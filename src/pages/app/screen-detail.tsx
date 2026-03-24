import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  getScreenById,
  getScreenContentWithDetails,
  updateScreenContentOrder,
  toggleScreenContentVisibility,
  type ScreenContentWithDetails,
} from '@/lib/supabase';
import type { DisplayScreen } from '@/types';
import { Badge, Button, Switch, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { PageHeader, ErrorAlert, EmptyState, DataTable, type Column } from '@/components/common';
import { ArrowLeft, Monitor, Copy, Check } from 'lucide-react';
import { AppRoutes } from '@/constants';
import { useTrigger } from '@/hooks';
import { toast } from 'sonner';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ayat_and_hadith: 'Ayat / Hadith',
  announcements: 'Announcement',
  events: 'Event',
  posts: 'Post',
};

export default function ScreenDetail() {
  const { id } = useParams<{ id: string }>();
  const [screen, setScreen] = useState<DisplayScreen | null>(null);
  const [content, setContent] = useState<ScreenContentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [trigger, forceUpdate] = useTrigger();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [screenData, contentData] = await Promise.all([
          getScreenById(id),
          getScreenContentWithDetails(id),
        ]);
        setScreen(screenData);
        setContent(contentData);
      } catch (err) {
        setError('Failed to load screen details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, trigger]);

  const handleOrderChange = async (items: ScreenContentWithDetails[]) => {
    if (isUpdatingOrder) return;

    setContent(items);

    try {
      setIsUpdatingOrder(true);
      const updates = items.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));
      await updateScreenContentOrder(updates);
      toast.success('Order updated');
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Failed to update order');
      forceUpdate();
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleVisibilityToggle = async (item: ScreenContentWithDetails) => {
    const newVisible = !item.visible;

    setContent(prev => prev.map(c => (c.id === item.id ? { ...c, visible: newVisible } : c)));

    try {
      await toggleScreenContentVisibility(item.id, newVisible);
      toast.success(`Content ${newVisible ? 'shown' : 'hidden'}`);
    } catch (err) {
      setContent(prev => prev.map(c => (c.id === item.id ? { ...c, visible: item.visible } : c)));
      console.error('Error toggling visibility:', err);
      toast.error('Failed to update visibility');
    }
  };

  const handleCopyCode = async () => {
    if (!screen?.code) return;
    try {
      await navigator.clipboard.writeText(screen.code);
      setCopiedCode(true);
      toast.success('Screen code copied');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const columns: Column<ScreenContentWithDetails>[] = [
    {
      key: 'content_type',
      name: 'Type',
      width: 'w-[15%]',
      render: value => (
        <Badge variant='default' className='capitalize'>
          {CONTENT_TYPE_LABELS[value as string] || (value as string)}
        </Badge>
      ),
    },
    {
      key: 'title',
      name: 'Title',
      width: 'w-[35%]',
      render: value => (
        <div className='font-medium whitespace-pre-wrap line-clamp-1 overflow-hidden'>
          {value as string}
        </div>
      ),
    },
    {
      key: 'description',
      name: 'Preview',
      width: 'w-[35%]',
      render: value => (
        <div className='text-muted-foreground whitespace-pre-wrap line-clamp-1 overflow-hidden'>
          {value as string}
        </div>
      ),
    },
    {
      key: 'visible',
      name: 'Visible',
      width: 'w-[10%]',
      render: (value, item) => (
        <Switch
          checked={!!value}
          onCheckedChange={() => handleVisibilityToggle(item)}
          aria-label='Toggle visibility'
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className='container mx-auto py-8 space-y-6'>
        <div className='animate-pulse bg-muted rounded-lg h-12 w-48' />
        <div className='animate-pulse bg-muted rounded-lg h-32' />
        <div className='animate-pulse bg-muted rounded-lg h-64' />
      </div>
    );
  }

  if (!screen) {
    return (
      <div className='container mx-auto py-8 space-y-6'>
        <ErrorAlert message='Screen not found' onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex items-center gap-4'>
        <Link to={AppRoutes.Screens}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Screens
          </Button>
        </Link>
      </div>

      <PageHeader
        title={screen.name}
        description='Manage content assigned to this screen. Drag to reorder, toggle to show/hide.'
        showAddButton={false}
      />

      <ErrorAlert message={error} onClose={() => setError(null)} />

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Screen Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground block'>Code</span>
              <div className='flex items-center gap-2 mt-1'>
                <code className='bg-muted px-2 py-0.5 rounded'>{screen.code}</code>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={handleCopyCode}
                  title='Copy code'
                >
                  {copiedCode ? <Check size={14} className='text-green-500' /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
            <div>
              <span className='text-muted-foreground block'>Orientation</span>
              <Badge variant='default' className='capitalize mt-1'>
                {screen.orientation}
              </Badge>
            </div>
            <div>
              <span className='text-muted-foreground block'>Prayer Times</span>
              <Badge variant={screen.show_prayer_times ? 'default' : 'secondary'} className='mt-1'>
                {screen.show_prayer_times ? 'Shown' : 'Hidden'}
              </Badge>
            </div>
            <div>
              <span className='text-muted-foreground block'>Weather</span>
              <Badge variant={screen.show_weather ? 'default' : 'secondary'} className='mt-1'>
                {screen.show_weather ? 'Shown' : 'Hidden'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {content.length === 0 ? (
        <EmptyState
          icon={<Monitor className='h-6 w-6 text-muted-foreground' />}
          title='No content assigned'
          description='Assign content to this screen from the Announcements, Ayat & Hadith, Events, or Posts pages.'
        />
      ) : (
        <DataTable
          columns={columns}
          data={content}
          keyField='id'
          showRowNumbers={true}
          isDraggable={true}
          onOrderChange={handleOrderChange}
        />
      )}
    </div>
  );
}
