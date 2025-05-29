import { useFetchDisplayData } from '@/hooks';
import Loading from '../loading-page';
import { PrayerTimingDisplay, ErrorDisplay } from '@/components/display';

export default function Display() {
  const { isLoading, errorMessage, prayerTimes, prayerTimeSettings } = useFetchDisplayData();

  if (isLoading) return <Loading />;
  if (errorMessage) return <ErrorDisplay errorMessage={errorMessage} />;

  return <PrayerTimingDisplay prayerTimes={prayerTimes} prayerTimeSettings={prayerTimeSettings} />;
}
