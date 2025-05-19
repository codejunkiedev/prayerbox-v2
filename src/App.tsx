import { Toaster } from 'react-hot-toast';
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
