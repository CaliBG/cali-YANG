"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { useLanguage } from "@/lib/language";
import { validInvitation } from "@/lib/invitation";
import styles from "./invitation.module.css";
import FallingGlass from "./FallingGlass";

const WarmupContext = createContext(false);
export const useInvitationWarmup = () => useContext(WarmupContext);

export default function InvitationGate({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [phase, setPhase] = useState<"locked" | "opening" | "open">("locked");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [warmup, setWarmup] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const locked = phase !== "open";

  useEffect(() => {
    // Hero models already start in the server HTML. Give them first priority,
    // then prepare the first interactive showcase while the visitor types.
    const timer = window.setTimeout(() => setWarmup(true), 900);
    setHydrated(true);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && matchMedia("(hover: hover) and (pointer: fine)").matches) input.current?.focus({ preventScroll: true });
  }, [hydrated]);

  useEffect(() => {
    if (!warmup || !content.current) return;
    // Load the actual responsive image elements, reusing their browser cache.
    // Two at a time prevents distant photographs from saturating the network.
    const images = Array.from(content.current.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'));
    let index = 0, cancelled = false;
    const cleanups = new Set<() => void>();
    const next = () => {
      if (cancelled || index >= images.length) return;
      const image = images[index++];
      if (image.complete && image.naturalWidth) { next(); return; }
      let timer: ReturnType<typeof setTimeout>;
      const cleanup = () => {
        clearTimeout(timer);
        image.removeEventListener("load", done);
        image.removeEventListener("error", done);
        cleanups.delete(cleanup);
      };
      const done = () => { cleanup(); next(); };
      cleanups.add(cleanup);
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
      timer = setTimeout(done, 12000);
      image.fetchPriority = "low";
      image.loading = "eager";
    };
    next(); next();
    return () => { cancelled = true; cleanups.forEach(cleanup => cleanup()); };
  }, [warmup]);

  useEffect(() => {
    if (phase !== "open") return;
    // Hand keyboard navigation back to the page, without jumping its scroll.
    const target = content.current?.querySelector<HTMLElement>("h1, main, article, a[href]");
    if (!target) return;
    const previous = target.getAttribute("tabindex");
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    if (previous === null) target.removeAttribute("tabindex");
    else target.setAttribute("tabindex", previous);
  }, [phase]);

  const submit = (code = value) => {
    if (phase !== "locked") return;
    // Evaluate on every attempt, including tabs left open across midnight.
    if (!validInvitation(code)) {
      setError(true);
      input.current?.focus({ preventScroll: true });
      requestAnimationFrame(() => input.current?.select());
      return;
    }
    setError(false);
    input.current?.blur();
    setPhase("opening");
  };

  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation(); // Do not trigger the site's sound/scroll shortcuts.
    if (event.key !== "Tab") return;
    const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>("input, button:not(:disabled)") ?? []);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  return <WarmupContext.Provider value={warmup}>
    <div ref={content} className={styles.content} inert={locked} aria-hidden={locked || undefined} data-portfolio-content>
      {children}
    </div>
    {locked && <div ref={dialog} className={styles.gate} data-phase={phase} data-invitation-gate
      role="dialog" aria-modal="true" aria-labelledby="invitation-title"
      onKeyDown={keyboard} onPointerUp={event => event.stopPropagation()}>
      <FallingGlass opening={phase === "opening"} onComplete={() => setPhase("open")} />
      <div className={styles.panel}>
        <form onSubmit={event => { event.preventDefault(); submit(); }} noValidate>
          <label id="invitation-title" className={styles.label} htmlFor="invitation-code">{zh ? "请输入邀请码" : "Enter invitation code"}</label>
          <div className={styles.codeField} data-error={error || undefined}>
            <input ref={input} id="invitation-code" name="invitation-code" type="text" inputMode="numeric" pattern="[0-9]{4}"
              autoComplete="off" enterKeyHint="go" maxLength={4} spellCheck={false} value={value}
              disabled={!hydrated} readOnly={phase === "opening"} aria-invalid={error} aria-describedby="invitation-feedback"
              onPaste={event => {
                event.preventDefault();
                const next = event.clipboardData.getData("text").normalize("NFKC").replace(/\D/g, "").slice(0, 4);
                setValue(next); setError(false);
                if (next.length === 4) submit(next);
              }}
              onChange={event => {
                const next = event.target.value.normalize("NFKC").replace(/\D/g, "").slice(0, 4);
                setValue(next); setError(false);
                if (next.length === 4) submit(next);
              }} />
            <div className={styles.digits} aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i} data-active={value.length === i || undefined}>{value[i] || <i />}</span>)}</div>
          </div>
          <p id="invitation-feedback" className={styles.feedback} role="status" aria-live="polite">
            {error ? (zh ? "邀请码不正确，请重试" : "Incorrect code. Please try again.") : "\u00a0"}
          </p>
        </form>
        <noscript><p>请启用 JavaScript。Please enable JavaScript.</p></noscript>
      </div>
    </div>}
  </WarmupContext.Provider>;
}
