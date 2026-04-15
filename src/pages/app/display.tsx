import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useFetchDisplayData,
  useOrientationMismatch,
  usePrayerTimings,
  useWeatherData,
} from '@/hooks';
import { useDisplayStore } from '@/store';
import Loading from '../loading-page';
import {
  ErrorDisplay,
  PrayerTimingDisplay,
  AnnouncementsDisplay,
  PostsDisplay,
  EventsDisplay,
  WeatherDisplay,
  YouTubeVideoDisplay,
  AyatHadithDisplay,
} from '@/components/display';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { EffectFade, Keyboard } from 'swiper/modules';
import type { Announcement, AyatAndHadith, Event, Post, YouTubeVideo } from '@/types';
import './display.css';

const SLIDE_DELAY = 9000;

export default function Display() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const { masjidProfile, displayScreen } = useDisplayStore();

  const {
    mismatch: orientationMismatch,
    expected,
    actual,
  } = useOrientationMismatch(displayScreen?.orientation);

  const showPrayerTimes = displayScreen?.show_prayer_times ?? true;
  const showWeather = displayScreen?.show_weather ?? true;

  const { isLoading, errorMessage, orderedContent, userSettings } = useFetchDisplayData();

  const {
    isLoading: isPrayerTimingsLoading,
    errorMessage: prayerTimingsError,
    prayerTimes,
    prayerTimeSettings,
  } = usePrayerTimings(showPrayerTimes);

  const {
    weatherForecast,
    isLoading: isWeatherLoading,
    errorMessage: weatherErrorMessage,
  } = useWeatherData(showWeather);

  // Build a set of slide indices that are YouTube videos (offset by prayer/weather slides)
  const youtubeSlideIndices = useMemo(() => {
    const fixedSlideCount = (showPrayerTimes ? 1 : 0) + (showWeather && weatherForecast ? 1 : 0);
    const indices = new Set<number>();
    orderedContent.forEach((item, i) => {
      if (item.contentType === 'youtube_videos') {
        indices.add(fixedSlideCount + i);
      }
    });
    return indices;
  }, [orderedContent, showPrayerTimes, showWeather, weatherForecast]);

  const advanceSlide = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (swiper.activeIndex >= swiper.slides.length - 1) {
      swiper.slideTo(0);
    } else {
      swiper.slideNext();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      // Don't auto-advance if current slide is a YouTube video — the video handles its own timing
      if (youtubeSlideIndices.has(swiper.activeIndex)) return;
      if (swiper.activeIndex >= swiper.slides.length - 1) {
        swiper.slideTo(0);
      } else {
        swiper.slideNext();
      }
    }, SLIDE_DELAY);

    return () => clearInterval(interval);
  }, [youtubeSlideIndices]);

  const isPageLoading =
    isLoading || (showPrayerTimes && isPrayerTimingsLoading) || (showWeather && isWeatherLoading);

  if (isPageLoading) return <Loading />;

  if (orientationMismatch) {
    return (
      <ErrorDisplay
        errorMessage={{
          title: 'Orientation mismatch',
          description: `This screen is configured for ${expected} mode but your monitor is in ${actual} mode. Please rotate your monitor or change the screen orientation in the admin panel.`,
        }}
      />
    );
  }

  if (errorMessage) return <ErrorDisplay errorMessage={errorMessage} />;
  if (showPrayerTimes && prayerTimingsError)
    return <ErrorDisplay errorMessage={prayerTimingsError} />;
  if (showWeather && weatherErrorMessage)
    return <ErrorDisplay errorMessage={weatherErrorMessage} />;

  const hasNoContent =
    !showPrayerTimes && !(showWeather && weatherForecast) && orderedContent.length === 0;

  if (hasNoContent) {
    return (
      <ErrorDisplay
        errorMessage={{
          title: 'No content assigned',
          description:
            'This screen has no content assigned to it yet. Please assign content from the admin panel.',
        }}
      />
    );
  }

  const fixedSlideCount = (showPrayerTimes ? 1 : 0) + (showWeather && weatherForecast ? 1 : 0);

  const contentSlides = orderedContent.map((item, index) => {
    const slideIndex = fixedSlideCount + index;

    switch (item.contentType) {
      case 'announcements':
        return (
          <SwiperSlide key={`content-${index}`}>
            <AnnouncementsDisplay
              announcements={[item.data as Announcement]}
              orientation={displayScreen?.orientation ?? 'landscape'}
            />
          </SwiperSlide>
        );
      case 'events':
        return (
          <SwiperSlide key={`content-${index}`}>
            <EventsDisplay
              event={item.data as Event}
              orientation={displayScreen?.orientation ?? 'landscape'}
            />
          </SwiperSlide>
        );
      case 'posts':
        return (
          <SwiperSlide key={`content-${index}`}>
            <PostsDisplay post={item.data as Post} />
          </SwiperSlide>
        );
      case 'youtube_videos':
        return (
          <SwiperSlide key={`content-${index}`}>
            <YouTubeVideoDisplay
              video={item.data as YouTubeVideo}
              isActive={activeSlideIndex === slideIndex}
              onSlideNext={advanceSlide}
            />
          </SwiperSlide>
        );
      case 'ayat_and_hadith':
        return (
          <SwiperSlide key={`content-${index}`}>
            <AyatHadithDisplay slide={item.data as AyatAndHadith} />
          </SwiperSlide>
        );
      default:
        return null;
    }
  });

  return (
    <div className='h-screen w-full overflow-hidden'>
      <Swiper
        onSwiper={swiper => {
          swiperRef.current = swiper;
        }}
        onSlideChange={swiper => setActiveSlideIndex(swiper.activeIndex)}
        modules={[EffectFade, Keyboard]}
        effect='fade'
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        speed={800}
        keyboard={{ enabled: true, onlyInViewport: true }}
        navigation={false}
        className='h-full w-full'
      >
        {showPrayerTimes && (
          <SwiperSlide>
            <PrayerTimingDisplay
              prayerTimes={prayerTimes}
              prayerTimeSettings={prayerTimeSettings}
              userSettings={userSettings}
              orientation={displayScreen?.orientation ?? 'landscape'}
            />
          </SwiperSlide>
        )}
        {showWeather && weatherForecast && (
          <SwiperSlide>
            <WeatherDisplay
              weatherForecast={weatherForecast}
              area={masjidProfile?.area}
              orientation={displayScreen?.orientation ?? 'landscape'}
            />
          </SwiperSlide>
        )}
        {contentSlides}
        {/* {isDev && (
          <SwiperSlide>
            <LogoutDisplay />
          </SwiperSlide>
        )} */}
      </Swiper>
    </div>
  );
}
