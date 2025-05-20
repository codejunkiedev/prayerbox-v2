import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '@/components/ui';

type TableSkeletonProps = {
  columns: Array<{ name: string; width: string }>;
  rows?: number;
  showActions?: boolean;
};

export function TableSkeleton({ columns, rows = 5, showActions = true }: TableSkeletonProps) {
  return (
    <div className='rounded-md overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.width}>
                {column.name}
              </TableHead>
            ))}
            {showActions && <TableHead className='w-[10%] text-center'>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(rows)].map((_, index) => (
            <TableRow key={index}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className='h-4 w-[90%]' />
                </TableCell>
              ))}
              {showActions && (
                <TableCell className='text-center'>
                  <div className='flex justify-center space-x-1'>
                    <Skeleton className='h-8 w-8 rounded-md' />
                    <Skeleton className='h-8 w-8 rounded-md' />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
