# Fullscreen Swiper Implementation for Prayer Box Display

This implementation uses Swiper.js to create a smooth, animated fullscreen display system for all content types:

- Prayer Times
- Announcements
- Ayat and Hadith
- Events
- Posts

## Features

- Fullscreen fade transitions between all slides
- Auto-rotation between all content types
- Keyboard navigation (arrow keys)
- Touch-friendly for mobile devices
- Responsive design for all screen sizes
- Pagination indicators
- Navigation arrows

## Implementation Details

The implementation is directly integrated into the display page for maximum control and flexibility. Each content type takes up a full screen slide for optimal visibility.

### Content Types

1. **Prayer Times**: Shows the daily prayer schedule (always displayed first)
2. **Announcements**: Important messages from the masjid
3. **Ayat and Hadith**: Quranic verses and Prophetic traditions
4. **Events**: Upcoming events with details
5. **Posts**: Image-based posts from the masjid

### Smart Content Ordering

The display implements intelligent content ordering with two levels of prioritization:

1. **Module-level ordering**: Content types (announcements, events, etc.) are displayed in the order specified in the user's settings
2. **Item-level ordering**: Within each content type, individual items are sorted by their display_order property

This gives administrators complete control over both:

- Which content appears first (e.g., show events before announcements)
- The order of items within each section (e.g., most important announcements first)

### User Experience Enhancements

- **Keyboard Navigation**: Use left/right arrow keys to navigate slides
- **Pause on Hover**: Autoplay pauses when users hover over the content
- **Touch Swipe**: Users can swipe on mobile devices to navigate
- **Full Viewport**: All content takes advantage of the full screen

## CSS Customization

Custom styles in `display.css` ensure:

- Navigation controls match the app's theme
- Slides take up the full viewport height
- Content is properly centered
- Consistent styling across different screen sizes

## Swiper Configuration

```jsx
<Swiper
  modules={[Pagination, Autoplay, EffectFade, Navigation, Keyboard]}
  effect='fade'
  spaceBetween={0}
  slidesPerView={1}
  pagination={{ clickable: true, dynamicBullets: true }}
  keyboard={{ enabled: true, onlyInViewport: true }}
  navigation={true}
  autoplay={{ delay: 8000, disableOnInteraction: false, pauseOnMouseEnter: true }}
  className='h-full w-full'
>
  {/* Content slides */}
</Swiper>
```

## Display Components

Each content type has its own dedicated display component:

- **PrayerTimingDisplay**: Shows prayer times
- **AnnouncementsDisplay**: Shows announcements
- **AyatHadithDisplay**: Shows Quranic verses and hadiths
- **EventsDisplay**: Shows event details
- **PostsDisplay**: Shows posts with images

## Dependencies

This implementation uses:

- swiper: For the slideshow functionality
- @/components/ui: For Cards and other UI elements
- @/types: For TypeScript types
- date-fns: For date formatting in events
- lucide-react: For icons in event details
