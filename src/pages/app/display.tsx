import { useFetchDisplayData, usePrayerTimings, useWeatherData } from '@/hooks';
import Loading from '../loading-page';
import {
  ErrorDisplay,
  PrayerTimingDisplay,
  AnnouncementsDisplay,
  PostsDisplay,
  EventsDisplay,
  AyatHadithDisplay,
  WeatherDisplay,
  LogoutDisplay,
} from '@/components/display';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Keyboard } from 'swiper/modules';
import { getModuleOrder, sortByDisplayOrder, createOrderedContentGroups } from '@/utils/display';
import { useDisplayStore } from '@/store';
import './display.css';
import { isDev } from '@/utils/env';

export default function Display() {
  const { isLoading, errorMessage, announcements, ayatAndHadith, events, posts, userSettings } =
    useFetchDisplayData();

  const {
    isLoading: isPrayerTimingsLoading,
    errorMessage: prayerTimingsError,
    prayerTimes,
    prayerTimeSettings,
  } = usePrayerTimings();

  const { masjidProfile } = useDisplayStore();
  const { weatherForecast, isLoading: isWeatherLoading } = useWeatherData(masjidProfile);

  if (isLoading || isPrayerTimingsLoading || isWeatherLoading) return <Loading />;
  if (errorMessage) return <ErrorDisplay errorMessage={errorMessage} />;
  if (prayerTimingsError) return <ErrorDisplay errorMessage={prayerTimingsError} />;

  const moduleOrder = getModuleOrder(userSettings);

  const sortedAnnouncements = sortByDisplayOrder(announcements);
  const sortedAyatAndHadith = sortByDisplayOrder(ayatAndHadith);
  const sortedEvents = sortByDisplayOrder(events);
  const sortedPosts = sortByDisplayOrder(posts);

  const announcementSlides = sortedAnnouncements.map((announcement, index) => (
    <SwiperSlide key={`announcement-${announcement.id || index}`}>
      <AnnouncementsDisplay announcements={[announcement]} />
    </SwiperSlide>
  ));

  const ayatHadithSlides = sortedAyatAndHadith.map((item, index) => (
    <SwiperSlide key={`ayat-hadith-${item.id || index}`}>
      <AyatHadithDisplay item={item} />
    </SwiperSlide>
  ));

  const eventSlides = sortedEvents.map((event, index) => (
    <SwiperSlide key={`event-${event.id || index}`}>
      <EventsDisplay event={event} />
    </SwiperSlide>
  ));

  const postSlides = sortedPosts.map((post, index) => (
    <SwiperSlide key={`post-${post.id || index}`}>
      <PostsDisplay post={post} />
    </SwiperSlide>
  ));

  const orderedContentGroups = createOrderedContentGroups(
    moduleOrder,
    announcementSlides,
    ayatHadithSlides,
    eventSlides,
    postSlides
  );

  return (
    <div className='h-screen w-full overflow-hidden'>
      <Swiper
        modules={[Autoplay, EffectFade, Keyboard]}
        effect='fade'
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        keyboard={{ enabled: true, onlyInViewport: true }}
        navigation={false}
        autoplay={{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className='h-full w-full'
      >
        <SwiperSlide>
          <PrayerTimingDisplay
            prayerTimes={prayerTimes}
            prayerTimeSettings={prayerTimeSettings}
            userSettings={userSettings}
          />
        </SwiperSlide>
        {weatherForecast && (
          <SwiperSlide>
            <WeatherDisplay weatherForecast={weatherForecast} />
          </SwiperSlide>
        )}
        {orderedContentGroups.length > 0 && orderedContentGroups.flatMap(group => group.content)}
        {isDev && (
          <SwiperSlide>
            <LogoutDisplay />
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
