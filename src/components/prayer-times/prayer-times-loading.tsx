import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

/**
 * Displays a loading skeleton for the prayer times table while data is being fetched
 */
export function PrayerTimesLoading() {
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader className='bg-primary/5'>
        <CardTitle className='flex justify-between items-center mt-2'>
          <span>Fetching Prayer Times...</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0 overflow-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-[80px] text-center font-medium py-3'>Date</TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Fajr</span>
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Sunrise</span>
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Dhuhr</span>
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Asr</span>
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Maghrib</span>
                </div>
              </TableHead>
              <TableHead className='text-center font-medium'>
                <div className='flex flex-col items-center'>
                  <span className='font-semibold'>Isha</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daysInMonth.map(day => (
              <TableRow key={day}>
                <TableCell className='font-medium text-center'>{day}</TableCell>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableCell key={i} className='text-center'>
                    <div className='h-5 w-16 mx-auto bg-muted animate-pulse rounded'></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
