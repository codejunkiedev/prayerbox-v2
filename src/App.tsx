import { Toaster } from './components/ui';
import Navigation from './navigation';
import ErrorBoundary from './components/error-boundary';
import { ThemeProvider } from './providers';

function App() {
  return (
    <ErrorBoundary showDetails={true}>
      <ThemeProvider defaultTheme='system' storageKey='prayerbox-ui-theme'>
        <div>
          <Navigation />
          <Toaster />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
