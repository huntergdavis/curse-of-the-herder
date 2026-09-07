// A screensaver runs for hours; when a new build is deployed, reload once the
// current herder is saved. Polls version.json with cache disabled every
// 60-75 minutes (randomised), never while hidden, and guards against loops.

const POLL_MIN_MS = 60 * 60 * 1000;
const POLL_JITTER_MS = 15 * 60 * 1000;
const ATTEMPT_KEY = "curse-of-the-herder:update-attempt";

export interface UpdateOptions {
  currentVersion: string;
  versionUrl: string;
  /** Called before reload so state can be flushed. */
  beforeReload: () => Promise<void>;
  /** Injected for tests. */
  fetchImpl?: typeof fetch;
  reload?: () => void;
  isHidden?: () => boolean;
}

export async function checkForUpdate(o: UpdateOptions): Promise<"same" | "reloading" | "skipped" | "error"> {
  if (o.isHidden?.() ?? document.hidden) return "skipped";
  try {
    const res = await (o.fetchImpl ?? fetch)(o.versionUrl, { cache: "no-store" });
    if (!res.ok) return "error";
    const data = (await res.json()) as { version?: string; builtAt?: string };
    const remote = `${data.version ?? ""}@${data.builtAt ?? ""}`;
    if (!data.version || data.version === o.currentVersion) return "same";
    // Do not reload twice for the same remote build (a bad deploy would loop forever).
    let attempted = "";
    try {
      attempted = sessionStorage.getItem(ATTEMPT_KEY) ?? "";
    } catch {
      /* ignore */
    }
    if (attempted === remote) return "skipped";
    try {
      sessionStorage.setItem(ATTEMPT_KEY, remote);
    } catch {
      /* ignore */
    }
    await o.beforeReload();
    (o.reload ?? (() => location.reload()))();
    return "reloading";
  } catch {
    return "error";
  }
}

export function startUpdatePolling(o: UpdateOptions): () => void {
  let timer = 0;
  const schedule = (): void => {
    timer = window.setTimeout(async () => {
      await checkForUpdate(o);
      schedule();
    }, POLL_MIN_MS + Math.random() * POLL_JITTER_MS);
  };
  schedule();
  return () => window.clearTimeout(timer);
}
