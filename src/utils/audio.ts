/**
 * Alert tones for the display, synthesized with the Web Audio API.
 *
 * Nothing is bundled or fetched: a display can be offline for days and still
 * beep. Loudness is left to the screen's own volume — the tone plays at a fixed
 * level here rather than giving each screen a second control to get wrong.
 */

type WindowWithLegacyAudio = Window & { webkitAudioContext?: typeof AudioContext };

/** Three short tones — deliberate enough to cut through a hall, over in ~0.7s. */
const BEEP_COUNT = 3;
const BEEP_DURATION_SECONDS = 0.15;
const BEEP_GAP_SECONDS = 0.09;
const BEEP_FREQUENCY_HZ = 880;
/** Output gain, well under 1 so three overlapping-ish tones never clip. */
const BEEP_PEAK_GAIN = 0.8;
/** Fade each tone in and out; a square gain edge pops audibly on most speakers. */
const RAMP_SECONDS = 0.012;
/** Small lead so every tone is scheduled ahead of the audio clock, never behind it. */
const SCHEDULE_LEAD_SECONDS = 0.05;

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;

  const AudioContextCtor =
    window.AudioContext ?? (window as WindowWithLegacyAudio).webkitAudioContext;
  if (!AudioContextCtor) return null;

  try {
    audioContext = new AudioContextCtor();
  } catch (error) {
    console.error('Unable to create an AudioContext', error);
    return null;
  }
  return audioContext;
};

/**
 * Browsers hand out a suspended AudioContext until the page has seen a user
 * gesture. Displays boot unattended and we deliberately never prompt, so this
 * just resumes on the first interaction that happens to arrive — a remote
 * keypress, a tap while mounting the TV. Kiosk builds that allow autoplay are
 * already running and never need it.
 *
 * @returns A cleanup function that detaches the listeners.
 */
export const primeAudioPlayback = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'touchstart'];

  const unlock = () => {
    detach();
    void getAudioContext()?.resume();
  };

  const detach = () => {
    events.forEach(event => window.removeEventListener(event, unlock));
  };

  events.forEach(event => window.addEventListener(event, unlock, { passive: true }));

  return detach;
};

/**
 * Plays the alert beep pattern.
 *
 * Resolves without playing anything when the browser has no Web Audio support
 * or is still blocking audio — the display has no operator to tell, so a
 * blocked beep is a no-op rather than an error.
 */
export const playAlertBeep = async (): Promise<void> => {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    try {
      await context.resume();
    } catch {
      return;
    }
  }
  if (context.state !== 'running') return;

  const startAt = context.currentTime + SCHEDULE_LEAD_SECONDS;

  for (let index = 0; index < BEEP_COUNT; index++) {
    const toneStart = startAt + index * (BEEP_DURATION_SECONDS + BEEP_GAP_SECONDS);
    const toneEnd = toneStart + BEEP_DURATION_SECONDS;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(BEEP_FREQUENCY_HZ, toneStart);

    gain.gain.setValueAtTime(0, toneStart);
    gain.gain.linearRampToValueAtTime(BEEP_PEAK_GAIN, toneStart + RAMP_SECONDS);
    gain.gain.setValueAtTime(BEEP_PEAK_GAIN, toneEnd - RAMP_SECONDS);
    gain.gain.linearRampToValueAtTime(0, toneEnd);

    oscillator.connect(gain).connect(context.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(toneStart);
    oscillator.stop(toneEnd);
  }
};
