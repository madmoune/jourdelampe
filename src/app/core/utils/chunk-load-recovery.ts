const RELOAD_PARAM = 'jdl-refresh';
const RELOAD_STORAGE_KEY = 'jdl-chunk-refresh-at';
const RETRY_WINDOW_MS = 10_000;

function errorText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return `${error.name} ${error.message} ${error.stack ?? ''}`;
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { message?: unknown; filename?: unknown; stack?: unknown };
    return [candidate.message, candidate.filename, candidate.stack]
      .filter((value): value is string => typeof value === 'string')
      .join(' ');
  }
  return '';
}

/** Reconnaît les erreurs créées quand un ancien bundle demande un chunk supprimé. */
export function isChunkLoadError(error: unknown): boolean {
  return /failed to fetch dynamically imported module|loading (?:chunk|module) .* failed|chunkloaderror|chunk load error|net::err_aborted.*\.(?:js|mjs)/iu.test(
    errorText(error),
  );
}

function readLastReload(): number | null {
  try {
    const stored = window.sessionStorage.getItem(RELOAD_STORAGE_KEY);
    if (stored === null) return null;
    const value = Number(stored);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function writeLastReload(timestamp: number): boolean {
  try {
    window.sessionStorage.setItem(RELOAD_STORAGE_KEY, String(timestamp));
    return true;
  } catch {
    return false;
  }
}

function clearReloadParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(RELOAD_PARAM)) return;

  // Keep the marker if sessionStorage is unavailable: it is then our only
  // protection against repeatedly reloading a still-broken deployment.
  const lastReload = readLastReload();
  if (lastReload === null) return;

  url.searchParams.delete(RELOAD_PARAM);
  window.history.replaceState(null, '', url);
}

/** Recharge la page une seule fois avec une URL fraîche quand un chunk manque. */
export function recoverFromChunkLoadError(error: unknown): boolean {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) return false;

  const url = new URL(window.location.href);
  if (url.searchParams.has(RELOAD_PARAM)) return false;

  const now = Date.now();
  const lastReload = readLastReload();
  if (lastReload !== null && now - lastReload < RETRY_WINDOW_MS) return false;

  const stored = writeLastReload(now);
  url.searchParams.set(RELOAD_PARAM, String(now));
  if (!stored) {
    // Without sessionStorage the query parameter prevents a reload loop.
    url.searchParams.set(RELOAD_PARAM, 'retry');
  }
  window.location.replace(url.toString());
  return true;
}

/** Installe les écouteurs qui couvrent les imports hors navigation du routeur. */
export function installChunkLoadRecovery(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  clearReloadParam();
  const handleError = (error: unknown): void => {
    recoverFromChunkLoadError(error);
  };
  const handleRejection = (event: PromiseRejectionEvent): void => {
    handleError(event.reason);
  };
  const handleWindowError = (event: ErrorEvent): void => {
    handleError(`${event.message} ${event.filename}`);
  };

  window.addEventListener('unhandledrejection', handleRejection);
  window.addEventListener('error', handleWindowError);
  return () => {
    window.removeEventListener('unhandledrejection', handleRejection);
    window.removeEventListener('error', handleWindowError);
  };
}
