import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ScrollArea,
  Select,
  Skeleton,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { HADITH_BOOKS } from '@/constants';
import { searchHadith, type HadithSearchLanguage, type HadithSearchResult } from '@/api';
import { cn } from '@/utils';

interface HadithSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (bookSlug: string, hadithNumber: string) => void;
}

const ANY_BOOK = '__any__';
const PAGE_SIZE = 10;

export function HadithSearchDialog({ open, onOpenChange, onSelect }: HadithSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<HadithSearchLanguage>('english');
  const [bookSlug, setBookSlug] = useState<string>(ANY_BOOK);
  const [page, setPage] = useState(1);
  const [submittedQuery, setSubmittedQuery] = useState('');

  const [results, setResults] = useState<HadithSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
    }
  }, [open]);

  const runSearch = useCallback(
    async (q: string, p: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const res = await searchHadith(
          {
            query: q,
            language,
            bookSlug: bookSlug === ANY_BOOK ? undefined : bookSlug,
            page: p,
            paginate: PAGE_SIZE,
          },
          controller.signal
        );
        setResults(res.results);
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
        setTotal(res.total);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [language, bookSlug]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    setPage(1);
    runSearch(trimmed, 1);
  }

  function goToPage(p: number) {
    if (!submittedQuery || p < 1 || p > lastPage || p === currentPage) return;
    setPage(p);
    runSearch(submittedQuery, p);
  }

  function handlePick(r: HadithSearchResult) {
    if (!r.book_slug || !r.hadith_number) return;
    onSelect(r.book_slug, r.hadith_number);
    onOpenChange(false);
  }

  function snippetFor(r: HadithSearchResult): string {
    if (language === 'urdu') return r.urdu || r.english || r.arabic;
    if (language === 'arabic') return r.arabic || r.english;
    return r.english || r.urdu || r.arabic;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Search hadiths</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-3'>
          <div className='grid grid-cols-[1fr_auto] gap-2'>
            <div className='space-y-1'>
              <Label htmlFor='hadith-search-query' className='text-xs'>
                Keyword
              </Label>
              <Input
                id='hadith-search-query'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='e.g. patience, prayer, intention'
                autoFocus
              />
            </div>
            <div className='flex items-end'>
              <Button type='submit' disabled={loading || !query.trim()}>
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Search className='h-4 w-4' />
                )}
                <span className='ml-2'>Search</span>
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div className='space-y-1'>
              <Label className='text-xs'>Language</Label>
              <Select value={language} onValueChange={v => setLanguage(v as HadithSearchLanguage)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='english'>English</SelectItem>
                  <SelectItem value='urdu'>Urdu</SelectItem>
                  <SelectItem value='arabic'>Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1'>
              <Label className='text-xs'>Book</Label>
              <Select value={bookSlug} onValueChange={setBookSlug}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_BOOK}>Any book</SelectItem>
                  {HADITH_BOOKS.map(b => (
                    <SelectItem key={b.slug} value={b.slug}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <div className='border-t pt-3'>
          {error && !loading && <p className='text-destructive text-sm mb-2'>{error}</p>}

          {!submittedQuery && !loading && !error && (
            <p className='text-muted-foreground text-sm text-center py-8'>
              Enter a keyword and press Search to find hadiths.
            </p>
          )}

          {loading && (
            <>
              <div className='flex items-center justify-between mb-2'>
                <Skeleton className='h-3 w-40' />
                <Skeleton className='h-3 w-20' />
              </div>
              <div className='h-80 rounded-md border overflow-hidden'>
                <ul className='divide-y'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className='p-3 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-4 w-12 rounded-full' />
                        <Skeleton className='h-3 w-24' />
                      </div>
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-4/5' />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {!loading && submittedQuery && !error && results.length === 0 && (
            <p className='text-muted-foreground text-sm text-center py-8'>
              No hadiths found for &ldquo;{submittedQuery}&rdquo;.
            </p>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className='flex items-center justify-between text-xs text-muted-foreground mb-2'>
                <span>
                  {total.toLocaleString()} result{total === 1 ? '' : 's'} for &ldquo;
                  {submittedQuery}&rdquo;
                </span>
                <span>
                  Page {currentPage} of {lastPage}
                </span>
              </div>

              <ScrollArea className='h-80 rounded-md border'>
                <ul className='divide-y'>
                  {results.map(r => (
                    <li key={r.id}>
                      <button
                        type='button'
                        onClick={() => handlePick(r)}
                        className={cn(
                          'w-full text-left p-3 hover:bg-accent transition',
                          'focus:outline-none focus:bg-accent'
                        )}
                      >
                        <div className='flex items-center gap-2 mb-1 flex-wrap'>
                          <span className='font-medium text-sm'>
                            {r.book_name || r.book_slug} #{r.hadith_number}
                          </span>
                          {r.status && (
                            <Badge variant='secondary' className='text-[10px]'>
                              {r.status}
                            </Badge>
                          )}
                          {r.chapter_english && (
                            <span className='text-xs text-muted-foreground'>
                              · {r.chapter_english}
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-xs text-muted-foreground line-clamp-2',
                            language === 'arabic' && 'text-right',
                            language === 'urdu' && 'text-right'
                          )}
                          dir={language === 'english' ? 'ltr' : 'rtl'}
                        >
                          {snippetFor(r)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>

              <div className='flex items-center justify-between mt-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={loading || currentPage <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={loading || currentPage >= lastPage}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
