import { useTheme } from '@/providers';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Theme-aware toast notification provider with custom styling
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          padding: '12px 16px',
          gap: '8px',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
