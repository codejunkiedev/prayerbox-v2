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
  LogoutDisplay,
} from '@/components/display';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { EffectFade, Keyboard } from 'swiper/modules';
import { isDev } from '@/utils';
import './display.css';

const SLIDE_DELAY = 9000;

export default function Display() {
  const swiperRef = useRef<SwiperType | null>(null);

  const { isLoading, errorMessage, announcements, ayatAndHadith, events, posts, userSettings } =
    useFetchDisplayData();

  const {
    isLoading: isPrayerTimingsLoading,
    errorMessage: prayerTimingsError,
    prayerTimes,
    prayerTimeSettings,
  } = usePrayerTimings();

  const {
    weatherForecast,
    isLoading: isWeatherLoading,
    errorMessage: weatherErrorMessage,
  } = useWeatherData();

  const { masjidProfile } = useDisplayStore();

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

  if (isLoading || isPrayerTimingsLoading || isWeatherLoading) return <Loading />;
  if (errorMessage) return <ErrorDisplay errorMessage={errorMessage} />;
  if (prayerTimingsError) return <ErrorDisplay errorMessage={prayerTimingsError} />;
  if (weatherErrorMessage) return <ErrorDisplay errorMessage={weatherErrorMessage} />;

  const announcementSlides = announcements.map((announcement, index) => (
    <SwiperSlide key={`announcement-${announcement.id || index}`}>
      <AnnouncementsDisplay announcements={[announcement]} />
    </SwiperSlide>
  ));

  const ayatHadithSlides = ayatAndHadith.map((item, index) => (
    <SwiperSlide key={`ayat-hadith-${item.id || index}`}>
      <AyatHadithDisplay item={item} />
    </SwiperSlide>
  ));

  const eventSlides = events.map((event, index) => (
    <SwiperSlide key={`event-${event.id || index}`}>
      <EventsDisplay event={event} />
    </SwiperSlide>
  ));

  const postSlides = posts.map((post, index) => (
    <SwiperSlide key={`post-${post.id || index}`}>
      <PostsDisplay post={post} />
    </SwiperSlide>
  ));

  const allContentSlides = [
    ...announcementSlides,
    ...ayatHadithSlides,
    ...eventSlides,
    ...postSlides,
  ];

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
        <SwiperSlide>
          <PrayerTimingDisplay
            prayerTimes={prayerTimes}
            prayerTimeSettings={prayerTimeSettings}
            userSettings={userSettings}
          />
        </SwiperSlide>
        {weatherForecast && (
          <SwiperSlide>
            <WeatherDisplay weatherForecast={weatherForecast} area={masjidProfile?.area} />
          </SwiperSlide>
        )}
        {allContentSlides}
        {isDev && (
          <SwiperSlide>
            <LogoutDisplay />
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
