import { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import type { ReactNode } from 'react';
import type { Column } from './data-table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

type DraggableDataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  renderActions?: (item: T) => ReactNode;
  actionsWidth?: string;
  showRowNumbers?: boolean;
  rowNumberWidth?: string;
  isDraggable?: boolean;
  onOrderChange?: (items: T[]) => void;
};

type SortableRowProps<T> = {
  item: T;
  index: number;
  columns: Column<T>[];
  keyField: keyof T;
  renderActions?: (item: T) => ReactNode;
  showRowNumbers?: boolean;
  children?: ReactNode;
};

function SortableRow<T>({
  item,
  index,
  columns,
  keyField,
  renderActions,
  showRowNumbers,
  children,
}: SortableRowProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(item[keyField]),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? 'relative' : 'static',
    opacity: isDragging ? 0.8 : 1,
  } as React.CSSProperties;

  return (
    <TableRow ref={setNodeRef} style={style} className='hover:bg-muted/30'>
      <TableCell className='w-8 px-2'>
        <div
          {...attributes}
          {...listeners}
          className='flex h-8 w-8 cursor-grab items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground'
        >
          <GripVertical className='h-4 w-4' />
        </div>
      </TableCell>
      {showRowNumbers && <TableCell className='text-muted-foreground'>{index + 1}</TableCell>}
      {columns.map(column => (
        <TableCell key={column.key} className={column.className}>
          {column.render
            ? column.render(item[column.key as keyof T], item)
            : (item[column.key as keyof T] as ReactNode)}
        </TableCell>
      ))}
      {renderActions && <TableCell>{renderActions(item)}</TableCell>}
      {children}
    </TableRow>
  );
}

export function DraggableDataTable<T>({
  columns,
  data,
  keyField,
  renderActions,
  actionsWidth = 'w-[10%]',
  showRowNumbers = false,
  rowNumberWidth = 'w-[5%]',
  isDraggable = true,
  onOrderChange,
}: DraggableDataTableProps<T>) {
  const [items, setItems] = useState<T[]>(data);

  const callbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setItems(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => String(item[keyField]) === active.id);
      const newIndex = items.findIndex(item => String(item[keyField]) === over.id);

      const newItems = arrayMove([...items], oldIndex, newIndex);

      setItems(newItems);

      if (onOrderChange) {
        if (callbackTimeoutRef.current) {
          clearTimeout(callbackTimeoutRef.current);
        }

        callbackTimeoutRef.current = setTimeout(() => {
          onOrderChange(newItems);
          callbackTimeoutRef.current = null;
        }, 100);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (callbackTimeoutRef.current) {
        clearTimeout(callbackTimeoutRef.current);
      }
    };
  }, []);

  if (!isDraggable) {
    return (
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-8'></TableHead>
              {showRowNumbers && <TableHead className={rowNumberWidth}>#</TableHead>}
              {columns.map(column => (
                <TableHead key={column.key} className={cn(column.width, column.className)}>
                  {column.name}
                </TableHead>
              ))}
              {renderActions && (
                <TableHead className={`${actionsWidth} text-center`}>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={String(item[keyField])} className='hover:bg-muted/30'>
                <TableCell className='w-8 px-2'>
                  <div className='h-8 w-8 rounded-md border border-input opacity-30'>
                    <GripVertical className='h-4 w-4 m-auto mt-2' />
                  </div>
                </TableCell>
                {showRowNumbers && (
                  <TableCell className='text-muted-foreground'>{index + 1}</TableCell>
                )}
                {columns.map(column => (
                  <TableCell key={column.key} className={column.className}>
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

  return (
    <div className='overflow-x-auto'>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-8'></TableHead>
              {showRowNumbers && <TableHead className={rowNumberWidth}>#</TableHead>}
              {columns.map(column => (
                <TableHead key={column.key} className={cn(column.width, column.className)}>
                  {column.name}
                </TableHead>
              ))}
              {renderActions && (
                <TableHead className={`${actionsWidth} text-center`}>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={items.map(item => String(item[keyField]))}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableRow
                  key={String(item[keyField])}
                  item={item}
                  index={index}
                  columns={columns}
                  keyField={keyField}
                  renderActions={renderActions}
                  showRowNumbers={showRowNumbers}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}

export default DraggableDataTable;
