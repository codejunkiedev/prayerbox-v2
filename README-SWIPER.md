# Fullscreen Swiper Implementation for Prayer Box Display

This implementation uses Swiper.js to create a smooth, animated fullscreen display system for all content types:

- Prayer Times
- Announcements
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
3. **Events**: Upcoming events with details
4. **Posts**: Image-based posts from the masjid

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
- **EventsDisplay**: Shows event details
- **PostsDisplay**: Shows posts with images

## Recommended Hardware (TV Box / Display Devices)

PrayerBox is designed to run fullscreen on mosque TVs via a web browser. The choice of TV box and browser significantly impacts display quality.

### Minimum Requirements

- Android 12+ (ships with Chrome 100+ WebView for modern CSS support)
- 2GB RAM minimum, 4GB recommended (weather video backgrounds benefit from more RAM)
- Ethernet port (wired internet is more reliable for 24/7 mosque displays)
- HDMI output with 1080p support

### Recommended Devices

#### Best Value (Budget-Friendly)

| Device | Android | Chipset | RAM/Storage | Approx. Price (PKR) | Approx. Price (USD) |
|--------|---------|---------|-------------|----------------------|---------------------|
| X96H | 13 | H618 | 4GB/64GB | Rs. 8,000-12,000 | $30-40 |
| T95 (H616) | 10-12 | H616 | 4GB/32GB | Rs. 6,000-8,000 | $25-30 |
| H96 Max | 12-13 | Various | 4GB/32GB | Rs. 10,500 | $35 |

#### Most Reliable (Google/Amazon Certified)

| Device | Android | RAM/Storage | Approx. Price (PKR) | Approx. Price (USD) |
|--------|---------|-------------|----------------------|---------------------|
| Xiaomi Mi Box S / TV Box S | Google TV | 2GB/8GB | Rs. 12,000-15,000 | $50-60 |
| MECOOL KM2 Plus | Android TV 12 | 2GB/16GB | Rs. 15,000 | $88 |
| Amazon Fire TV Stick 4K Max | Fire OS | 2GB | Rs. 8,000-10,000 | $35-50 |

Certified devices receive automatic Chrome/WebView updates, ensuring long-term compatibility.

### Where to Buy (Pakistan)

- [Daraz.pk](https://www.daraz.pk/tag/android-tv-box-price/) - Cash on delivery nationwide
- [AndroidBox.pk](https://androidbox.pk/)
- [LAPTAB](https://www.laptab.com.pk/android-smart-tv-box/)
- [W11Stop](https://w11stop.com/smart-tv-box-and-devices)
- [OLX Pakistan](https://www.olx.com.pk/items/q-android-tv-box) - Second-hand options

### Browser Setup

1. **Install Google Chrome** from the Play Store (the built-in browser on most TV boxes is outdated and may not render the app correctly)
2. **Recommended: Install Fully Kiosk Browser** (free on Play Store) for the best mosque display experience:
   - Runs the web app in true fullscreen (no address bar or status bar)
   - Auto-restarts on crash
   - Auto-launches on device boot
   - Prevents accidental navigation away from the app
3. Use **Ethernet (wired)** connection instead of WiFi for reliability
4. If using Chrome, enable **Desktop mode** in settings if the layout appears off

### What to Prioritize

1. **Android version (12+)** is the most important factor - it determines Chrome/WebView version which affects CSS support for backdrop-blur, animations, and viewport units
2. **Box form factor over stick** - better heat dissipation for 24/7 operation
3. **Ethernet port** - WiFi can be unreliable for always-on displays
4. **4GB RAM** - helps with video backgrounds and smooth slide transitions

### Known Issues with Older Devices

Devices running Android 9 or below (like older X96Q models) may experience:
- Scrolling on the prayer timings screen (viewport height miscalculation)
- Blank/broken slides due to unsupported `backdrop-filter: blur()`
- Video backgrounds not auto-playing on the weather slide
- Poor animation performance with Framer Motion transitions

The app includes legacy browser polyfills and CSS fallbacks, but a modern Android version provides the best experience.

## Dependencies

This implementation uses:

- swiper: For the slideshow functionality
- @/components/ui: For Cards and other UI elements
- @/types: For TypeScript types
- date-fns: For date formatting in events
- lucide-react: For icons in event details
