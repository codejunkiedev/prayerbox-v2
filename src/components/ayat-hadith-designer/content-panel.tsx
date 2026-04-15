import { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { HADITH_BOOKS, QURAN_ARABIC_EDITION, QURAN_TRANSLATIONS, SURAHS } from '@/constants';
import { fetchAyahWithEditions, fetchHadith } from '@/api';
import type { AyatHadithCachedText, AyatHadithType } from '@/types';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils';

export interface ContentState {
  type: AyatHadithType;
  surah: number;
  ayah: number;
  book: string;
  hadith_number: string;
  showUrdu: boolean;
  urduEdition: string;
  showEnglish: boolean;
  englishEdition: string;
}

interface ContentPanelProps {
  state: ContentState;
  onChange: (next: ContentState) => void;
  onCachedTextChange: (next: AyatHadithCachedText) => void;
  onFetchingChange?: (fetching: boolean) => void;
}

function fingerprint(s: ContentState): string {
  return s.type === 'ayat'
    ? `ayat|${s.surah}|${s.ayah}|${s.showUrdu}|${s.urduEdition}|${s.showEnglish}|${s.englishEdition}`
    : `hadith|${s.book}|${s.hadith_number}|${s.showUrdu}|${s.showEnglish}`;
}

export function ContentPanel({
  state,
  onChange,
  onCachedTextChange,
  onFetchingChange,
}: ContentPanelProps) {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  useEffect(() => {
    const key = fingerprint(state);
    if (key === lastKey) return;

    const readyToFetch =
      state.type === 'ayat'
        ? state.surah >= 1 && state.ayah >= 1
        : !!state.book && !!state.hadith_number;
    if (!readyToFetch) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setFetching(true);
      onFetchingChange?.(true);
      setError(null);
      try {
        if (state.type === 'ayat') {
          const editions = [QURAN_ARABIC_EDITION];
          if (state.showUrdu) editions.push(state.urduEdition);
          if (state.showEnglish) editions.push(state.englishEdition);

          const result = await fetchAyahWithEditions(
            state.surah,
            state.ayah,
            editions,
            controller.signal
          );

          const next: AyatHadithCachedText = { arabic: result.arabic };
          if (state.showUrdu && result.translations[state.urduEdition]) {
            next.urdu = {
              edition: state.urduEdition,
              text: result.translations[state.urduEdition],
            };
          }
          if (state.showEnglish && result.translations[state.englishEdition]) {
            next.english = {
              edition: state.englishEdition,
              text: result.translations[state.englishEdition],
            };
          }
          onCachedTextChange(next);
        } else {
          const hadith = await fetchHadith(state.book, state.hadith_number, controller.signal);
          const next: AyatHadithCachedText = { arabic: hadith.arabic };
          if (state.showUrdu && hadith.urdu) {
            next.urdu = { edition: 'hadithapi-urdu', text: hadith.urdu };
          }
          if (state.showEnglish && hadith.english) {
            next.english = { edition: 'hadithapi-english', text: hadith.english };
          }
          onCachedTextChange(next);
        }
        setLastKey(key);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(`Failed to fetch content: ${(err as Error).message}`);
        }
      } finally {
        setFetching(false);
        onFetchingChange?.(false);
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [state, lastKey, onCachedTextChange, onFetchingChange]);

  const selectedSurah = SURAHS.find(s => s.number === state.surah);
  const selectedBook = HADITH_BOOKS.find(b => b.slug === state.book);

  return (
    <div className='space-y-4'>
      <Tabs
        value={state.type}
        onValueChange={v => onChange({ ...state, type: v as AyatHadithType })}
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='ayat'>Ayat</TabsTrigger>
          <TabsTrigger value='hadith'>Hadith</TabsTrigger>
        </TabsList>

        <TabsContent value='ayat' className='space-y-4 pt-4'>
          <div className='grid grid-cols-[1fr_140px] gap-3'>
            <div className='space-y-2'>
              <Label>Surah</Label>
              <Select
                value={String(state.surah)}
                onValueChange={v => onChange({ ...state, surah: Number(v), ayah: 1 })}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-72'>
                  {SURAHS.map(s => (
                    <SelectItem key={s.number} value={String(s.number)}>
                      {s.number}. {s.name_english} ({s.name_arabic})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Ayah (1–{selectedSurah?.ayah_count ?? 1})</Label>
              <Input
                type='number'
                min={1}
                max={selectedSurah?.ayah_count ?? 1}
                value={state.ayah}
                onChange={e => {
                  const next = Number(e.target.value);
                  const max = selectedSurah?.ayah_count ?? 1;
                  onChange({ ...state, ayah: Math.min(Math.max(1, next), max) });
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='hadith' className='space-y-4 pt-4'>
          <div className='grid grid-cols-[1fr_140px] gap-3'>
            <div className='space-y-2'>
              <Label>Book</Label>
              <Select
                value={state.book}
                onValueChange={v => onChange({ ...state, book: v, hadith_number: '' })}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a book' />
                </SelectTrigger>
                <SelectContent>
                  {HADITH_BOOKS.map(b => (
                    <SelectItem key={b.slug} value={b.slug}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Hadith {selectedBook ? `(1–${selectedBook.max_hadith_number})` : ''}</Label>
              <Input
                type='number'
                min={1}
                max={selectedBook?.max_hadith_number}
                placeholder='e.g. 123'
                value={state.hadith_number}
                onChange={e => {
                  const raw = e.target.value;
                  if (raw === '') {
                    onChange({ ...state, hadith_number: '' });
                    return;
                  }
                  const next = Number(raw);
                  if (Number.isNaN(next)) return;
                  const max = selectedBook?.max_hadith_number ?? next;
                  const clamped = Math.min(Math.max(1, next), max);
                  onChange({ ...state, hadith_number: String(clamped) });
                }}
                disabled={!state.book}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className='border-t pt-4 space-y-3'>
        <Label className='text-sm font-semibold'>Translations</Label>

        {state.type === 'ayat' ? (
          <>
            <div className='flex items-center gap-3'>
              <Switch
                id='show-urdu'
                checked={state.showUrdu}
                onCheckedChange={v => onChange({ ...state, showUrdu: v })}
              />
              <Label htmlFor='show-urdu' className='w-16 shrink-0 cursor-pointer'>
                Urdu
              </Label>
              <Select
                value={state.urduEdition}
                onValueChange={v => onChange({ ...state, urduEdition: v })}
                disabled={!state.showUrdu}
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QURAN_TRANSLATIONS.urdu.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-3'>
              <Switch
                id='show-english'
                checked={state.showEnglish}
                onCheckedChange={v => onChange({ ...state, showEnglish: v })}
              />
              <Label htmlFor='show-english' className='w-16 shrink-0 cursor-pointer'>
                English
              </Label>
              <Select
                value={state.englishEdition}
                onValueChange={v => onChange({ ...state, englishEdition: v })}
                disabled={!state.showEnglish}
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QURAN_TRANSLATIONS.english.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => onChange({ ...state, showUrdu: !state.showUrdu })}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition',
                state.showUrdu
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-sm border transition',
                  state.showUrdu ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}
              >
                {state.showUrdu && <Check className='h-3 w-3 text-primary-foreground' />}
              </span>
              Urdu
            </button>
            <button
              type='button'
              onClick={() => onChange({ ...state, showEnglish: !state.showEnglish })}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition',
                state.showEnglish
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-sm border transition',
                  state.showEnglish ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}
              >
                {state.showEnglish && <Check className='h-3 w-3 text-primary-foreground' />}
              </span>
              English
            </button>
          </div>
        )}
      </div>

      {error && <p className='text-destructive text-sm'>{error}</p>}

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => setLastKey(null)}
        disabled={fetching}
      >
        {fetching && <Loader2 className='mr-2 h-3 w-3 animate-spin' />}
        Re-fetch from API
      </Button>
    </div>
  );
}
