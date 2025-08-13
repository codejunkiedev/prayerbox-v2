export type WelcomeHeaderProps = {
  title: string;
  subtitle: string;
};

/**
 * Welcome header component displaying title and subtitle on dashboard
 * @param props Component props containing title and subtitle
 */
export function WelcomeHeader({ title, subtitle }: WelcomeHeaderProps) {
  return (
    <div className='mb-8'>
      <h1 className='text-3xl font-bold mb-2'>{title}</h1>
      <p className='text-gray-600 dark:text-gray-400'>{subtitle}</p>
    </div>
  );
}
