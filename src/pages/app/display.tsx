import { useFetchDisplayData } from '@/hooks';

export default function Display() {
  const { isLoading, prayerTimes, prayerTimeSettings } = useFetchDisplayData();

  if (isLoading) return <div>Loading...</div>;
  console.log(prayerTimes);
  console.log(prayerTimeSettings);

  return (
    <div>
      <div>
        <h1>Announcements</h1>
        <div>dd</div>
      </div>
    </div>
  );
}
