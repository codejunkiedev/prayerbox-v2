import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  name: string;
  width: string;
  render?: (value: unknown, item: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  renderActions?: (item: T) => ReactNode;
  actionsWidth?: string;
  showRowNumbers?: boolean;
  rowNumberWidth?: string;
};

/**
 * A generic data table component that displays tabular data with configurable columns and optional actions
 */
export function DataTable<T>({
  columns,
  data,
  keyField,
  renderActions,
  actionsWidth = 'w-[10%]',
  showRowNumbers = false,
  rowNumberWidth = 'w-[5%]',
}: DataTableProps<T>) {
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/50'>
            {showRowNumbers && <TableHead className={rowNumberWidth}>#</TableHead>}
            {columns.map(column => (
              <TableHead key={column.key} className={column.width}>
                {column.name}
              </TableHead>
            ))}
            {renderActions && (
              <TableHead className={`${actionsWidth} text-center`}>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={String(item[keyField])} className='hover:bg-muted/30'>
              {showRowNumbers && (
                <TableCell className='text-muted-foreground'>{index + 1}</TableCell>
              )}
              {columns.map(column => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(item[column.key as keyof T], item)
                    : (item[column.key as keyof T] as ReactNode)}
                </TableCell>
              ))}
              {renderActions && <TableCell>{renderActions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
