import { asset } from "@/lib/asset";
import frames from "./signature-frames.json";

/** The film's transparent frames are prepared at build time. Direct indexing
 * works in either direction, including jumps across distant frames. */
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export class VanodSignatureController {
  private tier = frames.tiers[0];
  private sheets: HTMLImageElement[] = [];
  private loadGeneration = 0;
  private paintedFrame = -1;
  private stickTop = 88;
  private travel = 1;
  private positionDirty = true;
  private resizeObserver: ResizeObserver;
  private stage: HTMLElement;
  private track: HTMLElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;
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
  private pointer: {id:number;x:number;y:number;progress:number;dragging:boolean} | null = null;
  private originalHint: string;

  constructor(private root: HTMLElement, private container: HTMLElement, private labels: { reduced: string; error: string }) {
    this.stage = root.querySelector<HTMLElement>('[data-motion-stage]')!;
    this.track = root.closest<HTMLElement>('[data-signature-track]')!;
    this.canvas = root.querySelector<HTMLCanvasElement>('[data-motion-canvas]')!;
    this.context = this.canvas.getContext('2d', {alpha:true});
    this.hint = root.querySelector<HTMLElement>('[data-motion-hint]')!;
    this.originalHint = this.hint.textContent || '';
    this.stage.addEventListener('pointerdown', this.down);
    this.stage.addEventListener('pointermove', this.move, {passive:false});
    this.stage.addEventListener('pointerup', this.release);
    this.stage.addEventListener('pointercancel', this.release);
    this.stage.addEventListener('lostpointercapture', this.release);
    this.stage.addEventListener('keydown', this.key);
    this.container.addEventListener('scroll', this.scroll, {passive:true});

    document.addEventListener('visibilitychange', this.visibility);
    window.addEventListener('online', this.resumeMedia);
    window.addEventListener('pagehide', this.pagehide);
    window.addEventListener('pageshow', this.pageshow);
    this.preference.addEventListener('change', this.applyPreference);
    this.observer = new IntersectionObserver(([entry]) => {
      this.near = entry.isIntersecting;
      if (this.near) { this.measure(); this.resumeMedia(); }
      else this.stop();
    }, { root: container, rootMargin: '800px 0px' });
    this.observer.observe(this.track);
    this.resizeObserver = new ResizeObserver(this.measure);
    for (const element of [this.root, this.stage, this.container, this.track]) this.resizeObserver.observe(element);
    this.applyPreference();
  }

  private ensureMedia() {
    if (!this.near || this.loaded || this.failed || this.preference.matches || !this.pageActive || document.hidden) return;
    this.loaded = true;
    if (!this.context) { this.error(); return; }
    this.tier = this.stage.clientWidth <= 480 ? frames.tiers[0] : frames.tiers[1];
    const generation = ++this.loadGeneration;
    const sheets = this.tier.sheets.map(file => {
      const image = new Image();
      image.src = asset("/projects/vanod/interactive/" + file);
      return image;
    });
    Promise.all(sheets.map(sheet => sheet.decode())).then(() => {
      if (generation !== this.loadGeneration) return;
      this.sheets = sheets;
      this.canvas.width = this.tier.width;
      this.canvas.height = this.tier.height;
      this.wake();
    }).catch(() => { if (generation === this.loadGeneration) this.error(); });
  }
  private resumeMedia = () => {
    if (this.failed && this.context && !this.preference.matches) {
      this.failed = false;
      this.discardFrames();
      this.root.classList.remove('motion-unavailable');
      this.hint.textContent = this.originalHint;
    }
    this.ensureMedia();
  };
  private discardFrames() {
    this.loadGeneration++;
    this.sheets = [];
    this.loaded = false;
    this.paintedFrame = -1;
  }
  private applyPreference = () => {
    const reduced = this.preference.matches;
    this.root.classList.toggle('motion-reduced', reduced);
    this.stage.tabIndex = reduced ? -1 : 0;
    this.hint.textContent = reduced ? this.labels.reduced : this.originalHint;
    if (reduced) {
      this.stop(); this.release(); this.root.classList.remove('motion-ready');
      this.discardFrames();
    } else if (this.near) { this.ensureMedia(); this.measure(); }
  };
  private paintFrame() {
    const index = Math.round(this.value * (frames.frames - 1));
    if (!this.context || !this.sheets.length || index === this.paintedFrame) return;
    const { x, y, w, h } = this.tier;
    const sheet = this.sheets[Math.floor(index / frames.perSheet)];
    const tile = index % frames.perSheet;
    this.context.clearRect(x, y, w, h);
    this.context.drawImage(sheet, tile % frames.columns * w, Math.floor(tile / frames.columns) * h, w, h, x, y, w, h);
    if (this.paintedFrame === -1) this.root.classList.add('motion-ready');
    this.paintedFrame = index;
  }
  private error = () => {
    if (!this.loaded) return;
    this.failed = true; this.stop(); this.root.classList.remove('motion-ready');
    this.root.classList.add('motion-unavailable');
    this.hint.textContent = this.labels.error;
  };
  private measure = () => {
    if (!this.near || this.preference.matches) return;
    const bounds = this.root.getBoundingClientRect();
    const stage = this.stage.getBoundingClientRect();
    this.stickTop = Math.max(88, this.container.clientHeight / 2 - (stage.top - bounds.top + stage.height / 2));
    this.root.style.setProperty('--signature-stick-top', `${this.stickTop}px`);
    this.track.style.setProperty('--signature-height', `${this.root.offsetHeight}px`);
    this.travel = Math.max(1, this.track.clientHeight - this.root.offsetHeight);
    this.positionDirty = true;
    this.wake();
  };
  private scroll = () => {
    if (!this.pointer?.dragging && this.manual && Math.abs(this.container.scrollTop - this.manualScroll) > 8) {
      this.manual = false;
    }
    this.positionDirty = true;
    this.wake();
  };
  private setManual(value: number) {
    this.manual = true; this.manualScroll = this.container.scrollTop; this.target = clamp(value);
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
  private tick = (now: number) => {
    this.frame = 0;
    if (this.preference.matches || !this.pageActive || document.hidden || !this.near || this.failed) return;
    const dt = this.last ? Math.min(64, now - this.last) : 16.67; this.last = now;
    if (this.positionDirty && !this.manual) {
      const top = this.track.getBoundingClientRect().top - this.container.getBoundingClientRect().top;
      this.target = clamp((this.stickTop - top) / this.travel);
    }
    this.positionDirty = false;
    const delta = this.target - this.value;
    // A horizontal drag maps directly to the displayed frame. Scroll already
    // eases in the site shell; use only a short settle for wheel/key steps.
    const follow = 1 - Math.exp(-dt / 32);
    this.value = this.pointer?.dragging || Math.abs(delta) < .0008 ? this.target : this.value + delta * follow;
    this.root.dataset.signatureProgress = this.value.toFixed(3);
    this.paintFrame();
    if (Math.abs(this.target - this.value) > .0008) this.wake();
  };
  private wake = () => {
    if (!this.frame && this.near && !this.preference.matches && !document.hidden && this.pageActive && !this.failed) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };
  private stop() { cancelAnimationFrame(this.frame); this.frame = 0; this.last = 0; }
  private visibility = () => { if (document.hidden) this.stop(); else { this.ensureMedia(); this.measure(); } };
  private pagehide = () => { this.pageActive = false; this.stop(); this.release(); };
  private pageshow = () => { this.pageActive = true; this.ensureMedia(); this.measure(); };
  destroy() {
    this.pageActive = false; this.stop(); this.release(); this.observer.disconnect();
    this.resizeObserver.disconnect();
    this.discardFrames();
    this.stage.removeEventListener('pointerdown', this.down);
    this.stage.removeEventListener('pointermove', this.move);
    this.stage.removeEventListener('pointerup', this.release);
    this.stage.removeEventListener('pointercancel', this.release);
    this.stage.removeEventListener('lostpointercapture', this.release);
    this.stage.removeEventListener('keydown', this.key);
    this.container.removeEventListener('scroll', this.scroll);
    document.removeEventListener('visibilitychange', this.visibility);
    window.removeEventListener('online', this.resumeMedia);
    window.removeEventListener('pagehide', this.pagehide);
    window.removeEventListener('pageshow', this.pageshow);
    this.preference.removeEventListener('change', this.applyPreference);
    this.root.classList.remove('motion-ready', 'motion-reduced', 'motion-unavailable');
    this.root.style.removeProperty('--signature-stick-top');
    this.track.style.removeProperty('--signature-height');
    this.context?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

}
