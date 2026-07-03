"use client";

// Passcode 全套（docs/11-shell.md §4，模块 28116 / 58156 / 4278）
// - 品牌名 "TikTok" 以 charCode+1 混淆存储（[85,106,108,85,112,108] = "UjlUpl"）
// - 校验走服务端 POST /api/passcode，客户端只看 res.ok
// - Provider 是 ref store + useSyncExternalStore，监听 "passcode-access-changed"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

// ---------------------------------------------------------------------------
// 常量（模块 28116）
// ---------------------------------------------------------------------------

// "UjlUpl" —— 每个 charCode -1 后得到 "TikTok"
const OBFUSCATED_BRAND_CODES = [85, 106, 108, 85, 112, 108];

export function revealBrandLabel(): string {
  let t = "";
  for (let e = 0; e < OBFUSCATED_BRAND_CODES.length; e++) {
    t += String.fromCharCode(OBFUSCATED_BRAND_CODES[e] - 1);
  }
  return t;
}

export function passcodeLockedSlotCount(): number {
  return OBFUSCATED_BRAND_CODES.length; // 6
}

export function passcodeLockedPlaceholderText(): string {
  return "■■■■■■";
}

export const PASSCODE_LOCKED_CHAR_CLASS =
  "inline-block min-w-[0.62em] text-center text-l1 tabular-nums select-text";

export const PASSCODE_LOCKED_SCRAMBLE_CLASS =
  "inline-flex items-baseline gap-[0.12em] mx-[0.06em] select-text [&>span]:inline-block [&>span]:min-w-[0.62em] [&>span]:text-center [&>span]:tabular-nums";

// ---------------------------------------------------------------------------
// 路径与配置（模块 58156）
// ---------------------------------------------------------------------------

export const PASSCODE = { slotCount: 4 };

export const PASSCODE_PROTECTED_PATHS = ["/2026"];

export function isPasscodeProtectedPath(href: string): boolean {
  return PASSCODE_PROTECTED_PATHS.includes(href);
}

export function primaryPasscodePath(): string {
  return PASSCODE_PROTECTED_PATHS[0];
}

export function buildPasscodeUnlockHref(
  scope: string,
  returnTo: string
): string {
  return `/unlock/${encodeURIComponent(
    scope.slice(1) || "_"
  )}?return=${encodeURIComponent(returnTo)}`;
}

export type PasscodeAccessState = Record<string, boolean>;

export function emptyPasscodeAccessState(): PasscodeAccessState {
  return Object.fromEntries(PASSCODE_PROTECTED_PATHS.map((p) => [p, false]));
}

/** 必须以 / 开头且不能 // 开头，否则 null */
export function sanitizePasscodeReturnTo(v: unknown): string | null {
  if (typeof v !== "string") return null;
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  return v;
}

// ---------------------------------------------------------------------------
// API 客户端（模块 58156，5995-6010 行）
// ---------------------------------------------------------------------------

export async function fetchPasscodeAccess(): Promise<PasscodeAccessState> {
  try {
    const res = await fetch("/api/passcode", { cache: "no-store" });
    if (!res.ok) return emptyPasscodeAccessState();
    return (await res.json()) as PasscodeAccessState;
  } catch {
    return emptyPasscodeAccessState();
  }
}

function postPasscode(body: unknown): Promise<Response> {
  return fetch("/api/passcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function submitPasscodeUnlock(
  scope: string,
  code: string
): Promise<Response> {
  return postPasscode({ scope, code });
}

export async function logoutPasscodeAccess(opts?: {
  reload?: boolean;
}): Promise<boolean> {
  const res = await postPasscode({ action: "logout" });
  if (!res.ok) return false;
  if (opts?.reload) window.location.reload();
  else notifyPasscodeAccessChanged();
  return true;
}

export function notifyPasscodeAccessChanged() {
  window.dispatchEvent(new CustomEvent("passcode-access-changed"));
}

// ---------------------------------------------------------------------------
// PasscodeAccessProvider（模块 4278）
// ---------------------------------------------------------------------------

interface PasscodeStore {
  getSnapshot: () => PasscodeAccessState;
  subscribe: (fn: () => void) => () => void;
  refresh: () => Promise<void>;
}

const PasscodeAccessContext = createContext<PasscodeStore | null>(null);

function shallowEqual(a: PasscodeAccessState, b: PasscodeAccessState) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
}

export function PasscodeAccessProvider({
  children,
  initialAccess,
}: {
  children: React.ReactNode;
  initialAccess?: PasscodeAccessState;
}) {
  const snapshotRef = useRef<PasscodeAccessState>(
    initialAccess ?? emptyPasscodeAccessState()
  );
  const listenersRef = useRef(new Set<() => void>());

  const store = useMemo<PasscodeStore>(() => {
    return {
      getSnapshot: () => snapshotRef.current,
      subscribe: (fn: () => void) => {
        listenersRef.current.add(fn);
        return () => {
          listenersRef.current.delete(fn);
        };
      },
      refresh: async () => {
        const next = await fetchPasscodeAccess();
        if (shallowEqual(snapshotRef.current, next)) return;
        snapshotRef.current = next;
        listenersRef.current.forEach((fn) => fn());
      },
    };
  }, []);

  useEffect(() => {
    const onChanged = () => {
      void store.refresh();
    };
    window.addEventListener("passcode-access-changed", onChanged);
    return () =>
      window.removeEventListener("passcode-access-changed", onChanged);
  }, [store]);

  return (
    <PasscodeAccessContext.Provider value={store}>
      {children}
    </PasscodeAccessContext.Provider>
  );
}

function usePasscodeStore(): PasscodeStore {
  const store = useContext(PasscodeAccessContext);
  if (!store) {
    throw new Error("usePasscodeStore must be inside PasscodeAccessProvider");
  }
  return store;
}

const SERVER_ACCESS = emptyPasscodeAccessState();

export function usePasscodeAccessState(): PasscodeAccessState {
  const store = usePasscodeStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => SERVER_ACCESS
  );
}

/** (href) => 非保护路径恒 true，否则看解锁状态 */
export function usePasscodeAccessLookup(): (href: string) => boolean {
  const state = usePasscodeAccessState();
  return useMemo(
    () => (href: string) => !isPasscodeProtectedPath(href) || !!state[href],
    [state]
  );
}

export function usePasscodeAllowed(path: string): boolean {
  return usePasscodeAccessLookup()(path);
}
