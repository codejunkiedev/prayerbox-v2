import { useFetchDisplayData } from '@/hooks';
import Loading from '../loading-page';
import {
  ErrorDisplay,
  PrayerTimingDisplay,
  AnnouncementsDisplay,
  PostsDisplay,
  EventsDisplay,
  AyatHadithDisplay,
} from '@/components/display';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Keyboard } from 'swiper/modules';
import {
  getModuleOrder,
  sortByDisplayOrder,
  hasAdditionalContent,
  createOrderedContentGroups,
} from '@/utils/display';
import './display.css';

export default function Display() {
  const {
    isLoading,
    errorMessage,
    prayerTimes,
    prayerTimeSettings,
    announcements,
    ayatAndHadith,
    events,
    posts,
    userSettings,
  } = useFetchDisplayData();

  if (isLoading) return <Loading />;
  if (errorMessage) return <ErrorDisplay errorMessage={errorMessage} />;

  const hasContent = hasAdditionalContent(announcements, ayatAndHadith, events, posts);

  if (!hasContent) {
    return (
      <div className='h-screen w-full overflow-hidden'>
        <PrayerTimingDisplay prayerTimes={prayerTimes} prayerTimeSettings={prayerTimeSettings} />
      </div>
    );
  }

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
        autoplay={{ delay: 10000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className='h-full w-full'
      >
        <SwiperSlide>
          <div className='w-full h-full overflow-auto'>
            <PrayerTimingDisplay
              prayerTimes={prayerTimes}
              prayerTimeSettings={prayerTimeSettings}
            />
          </div>
        </SwiperSlide>
        {orderedContentGroups.flatMap(group => group.content)}
      </Swiper>
    </div>
  );
}
