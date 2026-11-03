/** Authored video excerpts, driven by page position or direct manipulation.
 * Only one seek is in flight; later input replaces the pending target.
 * No autoplay clock, native transport UI, scroll interception or range input. */
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export class VanodSignatureController {
  private video: HTMLVideoElement;
  private stage: HTMLElement;
  private poster: HTMLImageElement;
  private replay: HTMLButtonElement;
  private hint: HTMLElement;
  private preference = matchMedia('(prefers-reduced-motion: reduce)');
  private observer: IntersectionObserver;
  private frame = 0;
  private last = 0;
  private target = 0;
  private value = 0;
  private loaded = false;
  private failed = false;
  private near = false;
  private pageActive = true;
  private manual = false;
  private manualScroll = 0;
  private replayStart: number | null = null;
  private pointer: {id:number;x:number;y:number;progress:number;dragging:boolean} | null = null;
  private originalHint: string;

  constructor(private root: HTMLElement, private container: HTMLElement, private labels: { reduced: string; error: string; retry: string; replay: string }) {
    this.stage = root.querySelector<HTMLElement>('[data-motion-stage]')!;
    this.video = root.querySelector<HTMLVideoElement>('video')!;
    this.poster = root.querySelector<HTMLImageElement>('[data-motion-poster]')!;
    this.replay = root.querySelector<HTMLButtonElement>('[data-motion-replay]')!;
    this.hint = root.querySelector<HTMLElement>('[data-motion-hint]')!;
    this.originalHint = this.hint.textContent || '';
    this.video.controls = false;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.disablePictureInPicture = true;
    this.video.addEventListener('loadedmetadata', this.wake);
    this.video.addEventListener('loadeddata', this.ready);
    this.video.addEventListener('seeked', this.ready);
    this.video.addEventListener('error', this.error);
    this.stage.addEventListener('pointerdown', this.down);
    this.stage.addEventListener('pointermove', this.move, {passive:false});
    this.stage.addEventListener('pointerup', this.release);
    this.stage.addEventListener('pointercancel', this.release);
    this.stage.addEventListener('lostpointercapture', this.release);
    this.stage.addEventListener('keydown', this.key);
    this.replay.addEventListener('click', this.restart);
    this.container.addEventListener('scroll', this.scroll, {passive:true});
    window.addEventListener('resize', this.measure, {passive:true});
    document.addEventListener('visibilitychange', this.visibility);
    window.addEventListener('pagehide', this.pagehide);
    window.addEventListener('pageshow', this.pageshow);
    this.preference.addEventListener('change', this.applyPreference);
    this.observer = new IntersectionObserver(this.measure, {root:this.container,rootMargin:'300px 0px',threshold:0});
    this.observer.observe(root);
    this.applyPreference();
  }

  private ensureMedia() {
    if (this.loaded || this.failed || this.preference.matches || !this.pageActive || document.hidden) return;
    this.loaded = true;
    this.video.preload = 'auto';
    this.video.src = this.video.dataset.src!;
    this.video.load();
  }
  private applyPreference = () => {
    const reduced = this.preference.matches;
    this.root.classList.toggle('motion-reduced', reduced);
    this.replay.hidden = reduced;
    this.stage.tabIndex = reduced ? -1 : 0;
    this.poster.src = reduced ? this.poster.dataset.rest! : this.poster.dataset.start!;
    this.hint.textContent = reduced ? this.labels.reduced : this.originalHint;
    if (reduced) {
      this.stop(); this.release(); this.replayStart = null; this.root.classList.remove('motion-ready');
      this.video.removeAttribute('src'); this.video.load(); this.loaded = false;
    } else if (this.near) { this.ensureMedia(); this.measure(); }
  };
  private ready = () => {
    if (!this.loaded || this.failed || this.preference.matches || this.video.readyState < 2) return;
    this.root.classList.add('motion-ready');
    this.wake();
  };
  private error = () => {
    if (!this.loaded) return;
    this.failed = true; this.stop(); this.root.classList.remove('motion-ready');
    this.root.classList.add('motion-unavailable');
    this.hint.textContent = this.labels.error;
    this.replay.textContent = this.labels.retry;
  };
  private measure = () => {
    const bounds = this.root.getBoundingClientRect();
    const viewportTop = this.container.getBoundingClientRect().top;
    const rect = { top: bounds.top - viewportTop, bottom: bounds.bottom - viewportTop, height: bounds.height };
    // Reconcile visibility on every scroll, including anchor jumps.
    this.near = rect.bottom > -300 && rect.top < this.container.clientHeight + 300;
    if (!this.near) { this.stop(); return; }
    this.ensureMedia();
    if (!this.manual) {
      this.target = clamp((this.container.clientHeight * .88 - rect.top) / Math.max(1, Math.min(rect.height, this.container.clientHeight * .56)));
    }
    this.wake();
  };
  private scroll = () => {
    if (!this.pointer?.dragging && this.manual && Math.abs(this.container.scrollTop - this.manualScroll) > 8) {
      this.manual = false; this.replayStart = null;
    }
    this.measure();
  };
  private setManual(value: number) {
    this.manual = true; this.manualScroll = this.container.scrollTop; this.target = clamp(value); this.replayStart = null;
    this.ensureMedia(); this.wake();
  }
  private down = (event: PointerEvent) => {
    if (event.button !== 0 || this.preference.matches || this.failed) return;
    this.pointer = {id:event.pointerId,x:event.clientX,y:event.clientY,progress:this.target,dragging:false};
  };
  private move = (event: PointerEvent) => {
    const p = this.pointer;
    if (!p || event.pointerId !== p.id) return;
    const dx = event.clientX - p.x, dy = event.clientY - p.y;
    if (!p.dragging) {
      // Leave vertical scrolling and pinch zoom entirely to the browser.
      if (Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx)) { this.pointer = null; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.1) return;
      p.dragging = true; this.stage.setPointerCapture(event.pointerId);
      this.root.classList.add('motion-dragging');
    }
    event.preventDefault();
    this.setManual(p.progress + dx / Math.max(1, this.stage.clientWidth) * 1.3);
  };
  private release = () => {
    const p = this.pointer; this.pointer = null; this.root.classList.remove('motion-dragging');
    if (p && this.stage.hasPointerCapture(p.id)) this.stage.releasePointerCapture(p.id);
  };
  private key = (event: KeyboardEvent) => {
    if (this.preference.matches || this.failed) return;
    let next: number;
    switch(event.key) {
      case 'ArrowRight': next = this.target + .08; break;
      case 'ArrowLeft': next = this.target - .08; break;
      case 'Home': next = 0; break;
      case 'End': next = 1; break;
      default: return;
    }
    event.preventDefault(); this.setManual(next);
  };
  private restart = () => {
    if (this.preference.matches) return;
    if (this.failed) {
      this.failed = false; this.loaded = false; this.root.classList.remove('motion-unavailable');
      this.hint.textContent = this.originalHint; this.replay.textContent = this.labels.replay;
    }
    this.setManual(0); this.value = 0; this.replayStart = performance.now(); this.wake();
  };
  private tick = (now: number) => {
    this.frame = 0;
    if (this.preference.matches || !this.pageActive || document.hidden || !this.near || this.failed) return;
    const dt = this.last ? Math.min(64, now - this.last) : 16.67; this.last = now;
    if (this.replayStart !== null) {
      const p = clamp((now - this.replayStart) / 1600);
      this.target = p * p * (3 - 2 * p);
      if (p === 1) this.replayStart = null;
    }
    const delta = this.target - this.value;
    this.value = Math.abs(delta) < .0008 ? this.target : this.value + delta * (1 - Math.exp(-dt / 65));
    this.root.dataset.signatureProgress = this.value.toFixed(3);
    const duration = this.video.duration;
    if (this.video.readyState >= 1 && Number.isFinite(duration) && duration > 0 && !this.video.seeking) {
      const time = this.value * Math.max(0, duration - 1/60);
      if (Math.abs(this.video.currentTime - time) >= 1/120) {
        try { this.video.currentTime = time; } catch { /* Metadata can be replaced during a preference change. */ }
      }
    }
    if (Math.abs(this.target - this.value) > .0008 || this.replayStart !== null) this.wake();
  };
  private wake = () => {
    if (!this.frame && this.near && !this.preference.matches && !document.hidden && this.pageActive && !this.failed) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };
  private stop() { cancelAnimationFrame(this.frame); this.frame = 0; this.last = 0; }
  private visibility = () => { if (document.hidden) this.stop(); else this.measure(); };
  private pagehide = () => { this.pageActive = false; this.stop(); this.release(); };
  private pageshow = () => { this.pageActive = true; this.measure(); };
  destroy() {
    this.pageActive = false; this.stop(); this.release(); this.observer.disconnect();
    this.video.removeEventListener('loadedmetadata', this.wake);
    this.video.removeEventListener('loadeddata', this.ready);
    this.video.removeEventListener('seeked', this.ready);
    this.video.removeEventListener('error', this.error);
    this.stage.removeEventListener('pointerdown', this.down);
    this.stage.removeEventListener('pointermove', this.move);
    this.stage.removeEventListener('pointerup', this.release);
    this.stage.removeEventListener('pointercancel', this.release);
    this.stage.removeEventListener('lostpointercapture', this.release);
    this.stage.removeEventListener('keydown', this.key);
    this.replay.removeEventListener('click', this.restart);
    this.container.removeEventListener('scroll', this.scroll);
    window.removeEventListener('resize', this.measure);
    document.removeEventListener('visibilitychange', this.visibility);
    window.removeEventListener('pagehide', this.pagehide);
    window.removeEventListener('pageshow', this.pageshow);
    this.preference.removeEventListener('change', this.applyPreference);
    this.root.classList.remove('motion-ready', 'motion-reduced', 'motion-unavailable');
    this.video.removeAttribute('src'); this.video.load();
  }

}
