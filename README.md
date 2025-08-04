# PrayerBox v2

A comprehensive prayer times application built with React, TypeScript, and Vite. This application provides prayer timings, weather information, announcements, events, and Islamic content management for mosques and Islamic centers.

## Features

- **Prayer Timings**: Accurate prayer times with location-based calculations
- **Weather Integration**: Real-time weather information display
- **Content Management**: Manage announcements, events, posts, and Islamic content
- **Themes**: Multiple customizable display themes
- **Location Services**: GPS and manual location selection
- **Display Mode**: Dedicated display view for mosque screens
- **Authentication**: Secure user authentication with Supabase
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom themes
- **UI Components**: Radix UI primitives
- **Backend**: Supabase (Authentication, Database, Storage)
- **Maps**: Leaflet with React-Leaflet
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

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

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Supabase configuration.

4. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and Supabase client
├── store/              # State management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── assets/             # Static assets (images, fonts, themes)
└── constants/          # Application constants
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.
