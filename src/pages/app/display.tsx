import { useEffect, useRef } from 'react';
import { useFetchDisplayData, usePrayerTimings, useWeatherData } from '@/hooks';
import { useDisplayStore } from '@/store';
import Loading from '../loading-page';
import {
  ErrorDisplay,
  PrayerTimingDisplay,
  AnnouncementsDisplay,
  PostsDisplay,
  EventsDisplay,
  AyatHadithDisplay,
  WeatherDisplay,
} from '@/components/display';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { EffectFade, Keyboard } from 'swiper/modules';
import type { Announcement, AyatAndHadith, Event, Post } from '@/types';
import './display.css';

const SLIDE_DELAY = 9000;

export default function Display() {
  const swiperRef = useRef<SwiperType | null>(null);

  const { masjidProfile, displayScreen } = useDisplayStore();

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

  useEffect(() => {
    const interval = setInterval(() => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      if (swiper.activeIndex >= swiper.slides.length - 1) {
        swiper.slideTo(0);
      } else {
        swiper.slideNext();
      }
    }, SLIDE_DELAY);

    return () => clearInterval(interval);
  }, []);

  const isPageLoading =
    isLoading || (showPrayerTimes && isPrayerTimingsLoading) || (showWeather && isWeatherLoading);

  if (isPageLoading) return <Loading />;
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

  const contentSlides = orderedContent.map((item, index) => {
    switch (item.contentType) {
      case 'announcements':
        return (
          <SwiperSlide key={`content-${index}`}>
            <AnnouncementsDisplay announcements={[item.data as Announcement]} />
          </SwiperSlide>
        );
      case 'ayat_and_hadith':
        return (
          <SwiperSlide key={`content-${index}`}>
            <AyatHadithDisplay item={item.data as AyatAndHadith} />
          </SwiperSlide>
        );
      case 'events':
        return (
          <SwiperSlide key={`content-${index}`}>
            <EventsDisplay event={item.data as Event} />
          </SwiperSlide>
        );
      case 'posts':
        return (
          <SwiperSlide key={`content-${index}`}>
            <PostsDisplay post={item.data as Post} />
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
