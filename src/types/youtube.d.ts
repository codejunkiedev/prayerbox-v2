declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    videoId?: string;
    host?: string;
    width?: number | string;
    height?: number | string;
    playerVars?: Record<string, unknown>;
    events?: {
      onReady?: (event: PlayerReadyEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: OnErrorEvent) => void;
    };
  }

  interface PlayerReadyEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    data: number;
    target: Player;
  }

  interface OnErrorEvent {
    data: number;
    target: Player;
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    destroy(): void;
    getPlayerState(): number;
  }
}

interface Window {
  YT: typeof YT;
  onYouTubeIframeAPIReady: (() => void) | undefined;
}
