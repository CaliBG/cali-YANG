"use client";

import { useEffect, useRef } from "react";
import MdxImg from "@/components/mdx/MdxImg";
import { asset } from "@/lib/asset";
import { useContainerEl } from "@/lib/scroll-env";
import styles from "./tongkuang.module.css";

/** Scroll-driven entrances without pinning or changing the images' grid slots. */
export default function InterfaceGallery({ zh }: { zh: boolean }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const directions = useRef<number[]>([]);
  const container = useContainerEl();

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const slots = Array.from(gallery.children) as HTMLElement[];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 700px), (pointer: coarse)");
    // Shuffle once per visit: guarantee all four desktop directions, with no
    // direction changes during scrolling, resizing, or language switching.
    if (!directions.current.length) {
      const order = [0, 1, 2, 3];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      directions.current = [...order, order[0]];
    }
    let frame = 0;
    let focused = false;
    const render = () => {
      frame = 0;
      const viewport = container?.clientHeight ?? window.innerHeight;
      const top = gallery.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
      // Stable, untransformed slots keep each mobile row tied to its own
      // viewport entry rather than revealing all five images at once.
      const geometry = slots.map(slot => ({
        top: slot.offsetTop, left: slot.offsetLeft,
        width: slot.offsetWidth, height: slot.offsetHeight,
      }));
      geometry.forEach((rect, index) => {
        const t = reduced.matches || focused ? 1 : Math.max(0, Math.min(1,
          (viewport - top - rect.top) / (viewport * .34)));
        const remaining = 1 - t * t * (3 - 2 * t);
        const center = rect.left + rect.width / 2;
        const fromLeft = Math.abs(center - gallery.clientWidth / 2) < 2
          ? index % 2 === 0 : center < gallery.clientWidth / 2;
        const direction = mobile.matches ? (fromLeft ? 0 : 2) : directions.current[index];
        const x = direction === 0 ? -rect.left - rect.width - 16
          : direction === 2 ? gallery.clientWidth - rect.left + 16 : 0;
        const y = direction === 1 ? -rect.top - rect.height - 16
          : direction === 3 ? gallery.clientHeight - rect.top + 16 : 0;
        const image = slots[index].firstElementChild as HTMLElement;
        image.style.transform = `translate3d(${(x * remaining).toFixed(2)}px, ${(y * remaining).toFixed(2)}px, 0)`;
        image.style.willChange = t > 0 && t < 1 ? "transform" : "auto";
      });
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(render); };
    const focus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) {
        focused = true;
        render();
      }
    };
    const target = container ?? window;
    const sizes = new ResizeObserver(request);
    sizes.observe(gallery);
    // Observe stationary slots: transformed artwork is clipped outside the
    // gallery and must not delay image loading until its entrance has begun.
    const preload = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const image = entry.target.querySelector("img");
        if (image) image.loading = "eager";
        preload.unobserve(entry.target);
      }
    }, { root: container, rootMargin: "1400px 0px" });
    slots.forEach(slot => preload.observe(slot));
    target.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduced.addEventListener("change", request);
    mobile.addEventListener("change", request);
    gallery.addEventListener("focusin", focus);
    render();
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      preload.disconnect();
      target.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      reduced.removeEventListener("change", request);
      mobile.removeEventListener("change", request);
      gallery.removeEventListener("focusin", focus);
    };
  }, [container]);

  return <div ref={galleryRef} className={styles.gallery} data-interface-gallery>
    {[1, 2, 3, 4, 5].map(index => <div key={index} className={styles.gallerySlot}>
      <MdxImg nativePreview src={asset(`/work-detail/work09-${index}.png`)}
        alt={zh ? `同框产品界面 ${index}` : `Tongkuang product screen ${index}`} />
    </div>)}
  </div>;
}
