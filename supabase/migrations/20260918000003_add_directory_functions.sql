-- ============================================
-- Directory reads for the mobile app
-- ============================================
-- 20260909000002 revoked anon's SELECT on masjid_profiles because the old
-- `USING (true)` policy handed every masjid's contact details to anyone holding
-- the publishable key. The mobile directory does not reopen that.
--
-- These functions are granted to service_role only. The one door a public
-- request comes through is the `masjid-directory` Edge Function, which is also
-- where the rate limit lives; anon and authenticated gain nothing here, and
-- `verify-anon-lockdown.sh` keeps passing unchanged.
--
-- Every function projects an explicit column list. `to_jsonb(row)` would have
-- been shorter — the display functions use it — but on a surface this public it
-- publishes whatever column is added to the table next, starting with `user_id`.

CREATE OR REPLACE FUNCTION masjid_distance_km(
  p_from_lat DOUBLE PRECISION,
  p_from_lng DOUBLE PRECISION,
  p_to_lat DOUBLE PRECISION,
  p_to_lng DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  -- Haversine on a spherical earth. Good to a few metres at city scale, which is
  -- two orders of magnitude finer than "which masjid is nearest", and avoids
  -- making PostGIS a dependency for one ORDER BY.
  SELECT 2 * 6371 * asin(
    sqrt(
      power(sin(radians(p_to_lat - p_from_lat) / 2), 2) +
      cos(radians(p_from_lat)) * cos(radians(p_to_lat)) *
      power(sin(radians(p_to_lng - p_from_lng) / 2), 2)
    )
  );
$$;

-- ============================================
-- Nearby
-- ============================================
-- Bounding box first so the partial index does the culling, haversine second on
-- what survives. Limits are clamped here rather than trusted from the caller.

CREATE OR REPLACE FUNCTION search_masjids_nearby(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 25,
  p_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ur TEXT,
  name_ar TEXT,
  area TEXT,
  area_ur TEXT,
  area_ar TEXT,
  logo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  contact_number TEXT,
  contact_email TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ,
  prayer_updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_radius DOUBLE PRECISION := least(greatest(coalesce(p_radius_km, 25), 0.5), 200);
  v_limit INTEGER := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_lat_delta DOUBLE PRECISION;
  v_lng_delta DOUBLE PRECISION;
BEGIN
  IF p_lat IS NULL OR p_lng IS NULL THEN
    RETURN;
  END IF;

  v_lat_delta := v_radius / 111.045;
  -- Longitude degrees shrink towards the poles; the floor keeps the box finite
  -- rather than dividing by a cosine that reaches zero.
  v_lng_delta := v_radius / (111.045 * greatest(cos(radians(p_lat)), 0.01));

  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.name_ur,
    m.name_ar,
    m.area,
    m.area_ur,
    m.area_ar,
    m.logo_url,
    m.latitude,
    m.longitude,
    m.timezone,
    m.contact_number,
    m.contact_email,
    m.website,
    m.updated_at,
    -- When the masjid last touched its prayer configuration, so the app can say
    -- how current the times are rather than leaving a follower to assume.
    GREATEST(
      (SELECT max(s.updated_at) FROM settings s WHERE s.masjid_id = m.id),
      (SELECT max(t.updated_at) FROM prayer_times t WHERE t.masjid_id = m.id)
    ) AS prayer_updated_at,
    masjid_distance_km(p_lat, p_lng, m.latitude, m.longitude) AS distance_km
  FROM masjid_profiles m
  WHERE m.listed
    AND m.latitude BETWEEN p_lat - v_lat_delta AND p_lat + v_lat_delta
    AND m.longitude BETWEEN p_lng - v_lng_delta AND p_lng + v_lng_delta
    AND masjid_distance_km(p_lat, p_lng, m.latitude, m.longitude) <= v_radius
  ORDER BY masjid_distance_km(p_lat, p_lng, m.latitude, m.longitude)
  LIMIT v_limit;
END;
$$;

-- ============================================
-- By name
-- ============================================
-- The way out when location is denied, or when the masjid someone wants is in
-- another city. Coordinates are optional and only decide the ordering.

CREATE OR REPLACE FUNCTION search_masjids_by_name(
  p_query TEXT,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ur TEXT,
  name_ar TEXT,
  area TEXT,
  area_ur TEXT,
  area_ar TEXT,
  logo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  contact_number TEXT,
  contact_email TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ,
  prayer_updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_limit INTEGER := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_term TEXT := btrim(coalesce(p_query, ''));
  v_pattern TEXT;
BEGIN
  -- One character matches most of the directory; make the caller mean it.
  IF length(v_term) < 2 THEN
    RETURN;
  END IF;

  -- The wildcards belong to us, not to the search term.
  v_pattern := '%' || replace(replace(replace(v_term, '\', '\\'), '%', '\%'), '_', '\_') || '%';

  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.name_ur,
    m.name_ar,
    m.area,
    m.area_ur,
    m.area_ar,
    m.logo_url,
    m.latitude,
    m.longitude,
    m.timezone,
    m.contact_number,
    m.contact_email,
    m.website,
    m.updated_at,
    -- When the masjid last touched its prayer configuration, so the app can say
    -- how current the times are rather than leaving a follower to assume.
    GREATEST(
      (SELECT max(s.updated_at) FROM settings s WHERE s.masjid_id = m.id),
      (SELECT max(t.updated_at) FROM prayer_times t WHERE t.masjid_id = m.id)
    ) AS prayer_updated_at,
    masjid_distance_km(p_lat, p_lng, m.latitude, m.longitude) AS distance_km
  FROM masjid_profiles m
  WHERE m.listed
    AND (
      m.name ILIKE v_pattern
      OR m.name_ur ILIKE v_pattern
      OR m.name_ar ILIKE v_pattern
      OR m.area ILIKE v_pattern
      OR m.area_ur ILIKE v_pattern
      OR m.area_ar ILIKE v_pattern
    )
  ORDER BY
    -- Distance when the phone offered a location, name otherwise. NULLS LAST so
    -- a masjid outside the box never outranks one inside it.
    masjid_distance_km(p_lat, p_lng, m.latitude, m.longitude) ASC NULLS LAST,
    m.name ASC
  LIMIT v_limit;
END;
$$;

-- ============================================
-- By id
-- ============================================
-- Refreshing a phone's followed list in one round trip, and resolving a masjid
-- reached by deep link. Un-listing is a withdrawal of consent, so an un-listed
-- masjid drops out of the result and the app treats it as gone.

CREATE OR REPLACE FUNCTION get_masjids_public(p_ids UUID[])
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ur TEXT,
  name_ar TEXT,
  area TEXT,
  area_ur TEXT,
  area_ar TEXT,
  logo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  contact_number TEXT,
  contact_email TEXT,
  website TEXT,
  updated_at TIMESTAMPTZ,
  prayer_updated_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT
    m.id,
    m.name,
    m.name_ur,
    m.name_ar,
    m.area,
    m.area_ur,
    m.area_ar,
    m.logo_url,
    m.latitude,
    m.longitude,
    m.timezone,
    m.contact_number,
    m.contact_email,
    m.website,
    m.updated_at,
    GREATEST(
      (SELECT max(s.updated_at) FROM settings s WHERE s.masjid_id = m.id),
      (SELECT max(t.updated_at) FROM prayer_times t WHERE t.masjid_id = m.id)
    ) AS prayer_updated_at
  FROM masjid_profiles m
  WHERE m.listed
    AND m.id = ANY(coalesce(p_ids, ARRAY[]::UUID[]))
  ORDER BY m.name
  LIMIT 100;
$$;

-- ============================================
-- Grants
-- ============================================
-- Spelled out rather than left to the implicit EXECUTE for PUBLIC, and
-- deliberately not granted to anon or authenticated.

REVOKE ALL ON FUNCTION masjid_distance_km(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION
) FROM PUBLIC;
REVOKE ALL ON FUNCTION search_masjids_nearby(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER
) FROM PUBLIC;
REVOKE ALL ON FUNCTION search_masjids_by_name(
  TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER
) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_masjids_public(UUID[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION masjid_distance_km(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION
) TO service_role;
GRANT EXECUTE ON FUNCTION search_masjids_nearby(
  DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER
) TO service_role;
GRANT EXECUTE ON FUNCTION search_masjids_by_name(
  TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INTEGER
) TO service_role;
GRANT EXECUTE ON FUNCTION get_masjids_public(UUID[]) TO service_role;
