import { format, parse, addMinutes } from 'date-fns';
import { Printer } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { AlAdhanPrayerTimes, PrayerTimes } from '@/types';
import { useRef } from 'react';

interface PrintablePrayerTimesProps {
  prayerTimes: AlAdhanPrayerTimes[];
  savedSettings: PrayerTimes | null;
  masjidName?: string;
}

export function PrintablePrayerTimes({
  prayerTimes,
  savedSettings,
  masjidName = 'Masjid Prayer Times',
}: PrintablePrayerTimesProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Helper function to format prayer times
  const formatTime = (timeString: string) => {
    try {
      return format(parse(timeString, 'HH:mm', new Date()), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  // Get adjusted prayer time based on settings
  const getAdjustedPrayerTime = (prayerName: string, originalTime: string) => {
    if (!savedSettings?.prayer_adjustments) return originalTime;

    const prayerKey = prayerName.toLowerCase() as keyof typeof savedSettings.prayer_adjustments;
    const adjustment = savedSettings.prayer_adjustments[prayerKey];

    if (!adjustment) return originalTime;

    if (adjustment.type === 'default') {
      return originalTime;
    } else if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
      try {
        const parsedTime = parse(originalTime, 'HH:mm', new Date());
        const adjustedTime = addMinutes(parsedTime, adjustment.offset);
        return format(adjustedTime, 'HH:mm');
      } catch {
        return originalTime;
      }
    } else if (adjustment.type === 'manual' && adjustment.manual_time) {
      return adjustment.manual_time;
    }

    return originalTime;
  };

  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current;
      const printWindow = window.open('', '_blank');

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Prayer Times</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .header { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
                th { background-color: #f2f2f2; }
                .month { font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; }
                @media print {
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${masjidName}</h1>
                <div class="month">${format(new Date(), 'MMMM yyyy')}</div>
              </div>
              ${content.innerHTML}
              <script>
                setTimeout(() => { window.print(); window.close(); }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <Printer size={18} />
            Printable Prayer Times
          </div>
          <Button size='sm' onClick={handlePrint}>
            Print
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div ref={printRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[80px]'>Date</TableHead>
                <TableHead>Fajr</TableHead>
                <TableHead>Sunrise</TableHead>
                <TableHead>Dhuhr</TableHead>
                <TableHead>Asr</TableHead>
                <TableHead>Maghrib</TableHead>
                <TableHead>Isha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prayerTimes.map(day => (
                <TableRow key={day.date.gregorian.date}>
                  <TableCell>
                    {day.date.gregorian.day}{' '}
                    {format(
                      parse(`${day.date.gregorian.month.number}-01-2000`, 'M-dd-yyyy', new Date()),
                      'MMM'
                    )}
                  </TableCell>
                  <TableCell>
                    {formatTime(getAdjustedPrayerTime('Fajr', day.timings.Fajr))}
                  </TableCell>
                  <TableCell>
                    {formatTime(getAdjustedPrayerTime('Sunrise', day.timings.Sunrise))}
                  </TableCell>
                  <TableCell>
                    {formatTime(getAdjustedPrayerTime('Dhuhr', day.timings.Dhuhr))}
                  </TableCell>
                  <TableCell>{formatTime(getAdjustedPrayerTime('Asr', day.timings.Asr))}</TableCell>
                  <TableCell>
                    {formatTime(getAdjustedPrayerTime('Maghrib', day.timings.Maghrib))}
                  </TableCell>
                  <TableCell>
                    {formatTime(getAdjustedPrayerTime('Isha', day.timings.Isha))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
