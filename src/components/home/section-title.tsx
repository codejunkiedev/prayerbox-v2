export type SectionTitleProps = {
  title: string;
};

/**
 * Section title component displaying a styled heading for page sections
 * @param props Component props containing the title text
 */
export function SectionTitle({ title }: SectionTitleProps) {
  return <h2 className='text-2xl font-bold mb-6'>{title}</h2>;
}
