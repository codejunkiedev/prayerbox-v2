# PrayerBox v2

A mosque management and display system built with React, TypeScript, and Vite. PrayerBox provides prayer time management, weather forecasts, content management (announcements, events, posts), and a dedicated full-screen display mode designed for mosque TV screens.

## Features

### Prayer Times

- Accurate prayer time calculation via the Al-Adhan API
- 24+ calculation methods (Karachi, ISNA, Muslim World League, Umm Al-Qura, and more)
- Juristic school support (Shafi & Hanafi)
- Per-prayer adjustments: offset by minutes, set manual time, or use default
- Three configurable Jumma prayer time slots
- Monthly prayer times table view

### Display Mode

- Full-screen auto-rotating carousel optimized for mosque TVs and displays
- Two display themes with distinct prayer time layouts
- Slides include: prayer times, weather, announcements, events, posts
- Configurable module ordering and visibility
- Legacy browser support (Chrome 49+, Android 5+) for older TV boxes
- URL-based access: `/login/code?code=YOUR_CODE` for easy device setup

### Content Management

- **Announcements** - Create, edit, show/hide, reorder, and archive
- **Events** - Title, description, date/time, location, roles (chief guest, host, qari, naat khawn, karm farma)
- **Posts** - Image-based posts with upload to Supabase storage
- Drag-and-drop reordering for all content types
- Visibility toggle per item

### Weather Integration

- 5-day forecast via OpenWeather API
- Current temperature, feels-like, humidity, wind speed
- Weather-aware icons and background colors
- Location-based using masjid coordinates

### Masjid Profile

- Masjid name and area
- Logo upload with image validation (JPEG, PNG, GIF, WebP; max 5MB)
- GPS coordinates with interactive map picker
- Unique 7-character masjid code for display access

### Settings

- **Modules** - Enable/disable and reorder display modules
- **Themes** - Choose between Theme 1 and Theme 2
- **Hijri Calendar** - Calculation method (High Judicial Council, Umm al-Qura, Diyanet) with offset adjustment
- **Account** - Update email and password

### Authentication

- **Admin access** - Email/password authentication via Supabase Auth
- **Display access** - Masjid code-based login (no account required)
- Password reset via email
- Session persistence

### UI/UX

- Dark, light, and system theme modes
- Responsive design (mobile, tablet, desktop)
- Toast notifications, form validation, loading skeletons

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 19, TypeScript 5.8, Vite 6 |
| Styling | Tailwind CSS 4, Class Variance Authority |
| UI Components | Radix UI primitives, Lucide React icons |
| State Management | Zustand |
| Forms | React Hook Form, Zod validation |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Maps | Leaflet, React-Leaflet |
| Animations | Framer Motion, Swiper |
| Date/Time | date-fns |
| APIs | Al-Adhan (prayer times), OpenWeather (weather), Geoapify (geocoding) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd prayerbox-v2
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env.local` file:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-key>
VITE_GEOAPIFY_API_KEY=<your-geoapify-key>
VITE_OPEN_WEATHER_API_KEY=<your-openweather-key>
```

4. Start the development server:

```bash
npm run dev
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Project Structure

```
src/
├── api/                # External API integrations (Al-Adhan, OpenWeather, Geoapify)
├── assets/             # Static assets (images, fonts)
├── components/
│   ├── ui/             # Base UI components (Button, Input, Dialog, etc.)
│   ├── common/         # Shared components (PageHeader, DataTable, EmptyState)
│   ├── display/        # Display mode components (prayer timings, weather, slides)
│   ├── settings/       # Settings page components
│   ├── layout/         # App layout and sidebar navigation
│   ├── modals/         # Modal dialogs
│   └── skeletons/      # Loading skeleton components
├── constants/          # Route definitions and configuration
├── hooks/              # Custom hooks (usePrayerTimings, useWeatherData, etc.)
├── lib/
│   ├── supabase/       # Supabase client, helpers, and domain services
│   └── zod.ts          # Validation schemas
├── navigation/         # Route configuration and auth guards
├── pages/
│   ├── auth/           # Login, Register, Forgot Password, Login with Code
│   └── app/            # Admin pages and Display
├── providers/          # Theme provider
├── store/              # Zustand store (display auth state)
├── types/              # TypeScript type definitions
└── utils/              # Utility functions (date/time, weather, prayer adjustments)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Pre-commit hooks (Husky + lint-staged) will automatically lint and format your code.

## License

This project is private and proprietary.
