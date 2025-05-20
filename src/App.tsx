import { Toaster } from './components/ui';
import Navigation from './navigation';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary showDetails={true}>
      <div>
        <Navigation />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;
