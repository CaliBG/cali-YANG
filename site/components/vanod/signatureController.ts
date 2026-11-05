import { letterPose, markPose } from "./signaturePose";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export class VanodSignatureController {
  private stage: HTMLElement;
  private mark: SVGPathElement;
  private letters: SVGPathElement[];
  private hint: HTMLElement;
  private originalHint: string;
  private preference = matchMedia('(prefers-reduced-motion: reduce)');
  private observer: IntersectionObserver;
  private resizeObserver: ResizeObserver;
  private near = false;
  private frame = 0;
  private progress = 1;
  private manualScroll: number | null = null;
  private pointer: {id:number;x:number;y:number;progress:number;dragging:boolean} | null = null;

  constructor(private root: HTMLElement, private container: HTMLElement, private reducedLabel: string) {
    this.stage = root.querySelector<HTMLElement>('[data-motion-stage]')!;
    this.mark = root.querySelector<SVGPathElement>('[data-signature-mark]')!;
    this.letters = Array.from(root.querySelectorAll<SVGPathElement>('[data-signature-letter]'));
    this.hint = root.querySelector<HTMLElement>('[data-motion-hint]')!;
    this.originalHint = this.hint.textContent || '';
    this.stage.addEventListener('pointerdown', this.down);
    this.stage.addEventListener('pointermove', this.move, {passive:false});
    this.stage.addEventListener('pointerup', this.release);
    this.stage.addEventListener('pointercancel', this.release);
    this.stage.addEventListener('lostpointercapture', this.release);
    this.stage.addEventListener('keydown', this.key);
    container.addEventListener('scroll', this.scroll, {passive:true});
    document.addEventListener('visibilitychange', this.wake);
    window.addEventListener('pageshow', this.wake);
    this.preference.addEventListener('change', this.applyPreference);
    this.observer = new IntersectionObserver(([entry]) => {
      this.near = entry.isIntersecting;
      this.wake();
    }, {root:container, rootMargin:'150px 0px'});
    this.observer.observe(root);
    this.resizeObserver = new ResizeObserver(this.wake);
    this.resizeObserver.observe(container);
    this.resizeObserver.observe(this.stage);
    this.applyPreference();
  }

  private applyPreference = () => {
    this.release();
    this.manualScroll = null;
    const reduced = this.preference.matches;
    this.stage.tabIndex = reduced ? -1 : 0;
    this.hint.textContent = reduced ? this.reducedLabel : this.originalHint;
    if (reduced) this.paint(1);
    else this.wake();
  };
  private paint(progress: number) {
    if (this.progress === progress && this.root.dataset.signatureProgress === progress.toFixed(3)) return;
    this.progress = progress;
    this.mark.setAttribute('transform', markPose(progress));
    this.letters.forEach((letter, index) => {
      const pose = letterPose(progress, index);
      letter.setAttribute('transform', pose.transform);
      letter.setAttribute('opacity', String(pose.opacity));
    });
    this.root.dataset.signatureProgress = progress.toFixed(3);
  }
  private scroll = () => {
    if (!this.pointer?.dragging && this.manualScroll !== null && this.container.scrollTop !== this.manualScroll) {
      this.manualScroll = null;
    }
    this.wake();
  };
  private wake = () => {
    if (this.frame || !this.near || this.preference.matches || document.hidden || this.manualScroll !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (this.preference.matches || this.manualScroll !== null) return;
      const stage = this.stage.getBoundingClientRect();
      const center = stage.top - this.container.getBoundingClientRect().top + stage.height / 2;
      const height = this.container.clientHeight;
      // Expand as the mark crosses from 90% to 36% of the viewport height.
      this.paint(clamp((0.9 - center / Math.max(1, height)) / 0.54));
    });
  };
  private setManual(value: number) {
    this.manualScroll = this.container.scrollTop;
    this.paint(clamp(value));
  }
  private down = (event: PointerEvent) => {
    if (event.button !== 0 || this.preference.matches) return;
    this.pointer = {id:event.pointerId,x:event.clientX,y:event.clientY,progress:this.progress,dragging:false};
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
    if (this.preference.matches) return;
    let next: number;
    switch(event.key) {
      case 'ArrowRight': next = this.progress + .08; break;
      case 'ArrowLeft': next = this.progress - .08; break;
      case 'Home': next = 0; break;
      case 'End': next = 1; break;
      default: return;
    }
    event.preventDefault(); this.setManual(next);
  };
  destroy() {
    cancelAnimationFrame(this.frame);
    this.release();
    this.observer.disconnect();
    this.resizeObserver.disconnect();
    this.stage.removeEventListener('pointerdown', this.down);
    this.stage.removeEventListener('pointermove', this.move);
    this.stage.removeEventListener('pointerup', this.release);
    this.stage.removeEventListener('pointercancel', this.release);
    this.stage.removeEventListener('lostpointercapture', this.release);
    this.stage.removeEventListener('keydown', this.key);
    this.container.removeEventListener('scroll', this.scroll);
    this.preference.removeEventListener('change', this.applyPreference);
    document.removeEventListener('visibilitychange', this.wake);
    window.removeEventListener('pageshow', this.wake);
  }
}
