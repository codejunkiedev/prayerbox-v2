import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches and displays React errors gracefully
 * Provides fallback UI and optional error details for debugging
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { showDetails = process.env.NODE_ENV === 'development' } = this.props;
      const { error, errorInfo } = this.state;

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden'>
            <div className='bg-red-600 px-4 py-5 sm:px-6'>
              <h2 className='text-lg font-medium text-white'>Something went wrong</h2>
            </div>
            <div className='px-4 py-5 sm:p-6'>
              <p className='text-gray-700 mb-4'>
                We're sorry, but an error occurred while rendering this view.
              </p>

              {showDetails && error && (
                <div className='mt-4'>
                  <h3 className='text-sm font-medium text-gray-900'>Error details:</h3>
                  <div className='mt-2 bg-gray-100 p-3 rounded overflow-auto text-sm'>
                    <p className='font-mono text-red-600'>{error.toString()}</p>

                    {errorInfo && (
                      <details className='mt-2'>
                        <summary className='cursor-pointer text-sm text-gray-600'>
                          Component Stack
                        </summary>
                        <pre className='mt-2 whitespace-pre-wrap text-xs text-gray-600 overflow-auto max-h-64'>
                          {errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className='mt-6 flex flex-col sm:flex-row-reverse sm:space-x-reverse sm:space-x-3'>
                <button
                  onClick={() => window.location.reload()}
                  className='w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.history.back()}
                  className='mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
