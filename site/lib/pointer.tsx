"use client";

// PointerProvider（docs/11-shell.md §3，模块 16265）
// mutable ref + useSyncExternalStore，mousemove 不触发 Provider 渲染；
// y 轴翻转成 GL 坐标（y = 1 - clientY/innerHeight）；rAF 节流通知。

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Vector2 } from "three";

export interface PointerSnapshot {
  x: number;
  y: number;
  inside: boolean;
}

const SERVER_SNAPSHOT: PointerSnapshot = { x: 0.5, y: 0.5, inside: false };

interface PointerContextValue {
  /** GL uv 坐标（mutable，供 WebGL 每帧直接读取） */
  uv: Vector2;
  insideRef: React.RefObject<boolean>;
  subscribe: (fn: () => void) => () => void;
  getSnapshot: () => PointerSnapshot;
  getServerSnapshot: () => PointerSnapshot;
}

const PointerContext = createContext<PointerContextValue | null>(null);

export function PointerProvider({ children }: { children: React.ReactNode }) {
  const uvRef = useRef(new Vector2(0.5, 0.5));
  const insideRef = useRef(false);
  const snapshotRef = useRef<PointerSnapshot>(SERVER_SNAPSHOT);
  const listenersRef = useRef(new Set<() => void>());
  const rafRef = useRef<number | null>(null);

  const value = useMemo<PointerContextValue>(() => {
    const notify = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        listenersRef.current.forEach((fn) => fn());
      });
    };

    const update = (x: number, y: number, inside: boolean) => {
      const prev = snapshotRef.current;
      if (prev.x === x && prev.y === y && prev.inside === inside) return;
      snapshotRef.current = { x, y, inside };
      uvRef.current.set(x, y);
      insideRef.current = inside;
      notify();
    };

    const onPointer = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      update(e.clientX / w, 1 - e.clientY / h, true);
    };
    const reset = () => update(0.5, 0.5, false);

    const subscribe = (fn: () => void) => {
      const listeners = listenersRef.current;
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.addEventListener("pointermove", onPointer, {
          capture: true,
          passive: true,
        });
        window.addEventListener("pointerdown", onPointer, {
          capture: true,
          passive: true,
        });
        window.addEventListener("pointerover", onPointer, {
          capture: true,
          passive: true,
        });
        window.addEventListener("blur", reset);
        document.addEventListener("mouseleave", reset);
        document.addEventListener("visibilitychange", reset);
      }
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("pointermove", onPointer, {
            capture: true,
          });
          window.removeEventListener("pointerdown", onPointer, {
            capture: true,
          });
          window.removeEventListener("pointerover", onPointer, {
            capture: true,
          });
          window.removeEventListener("blur", reset);
          document.removeEventListener("mouseleave", reset);
          document.removeEventListener("visibilitychange", reset);
        }
      };
    };

    return {
      uv: uvRef.current,
      insideRef,
      subscribe,
      getSnapshot: () => snapshotRef.current,
      getServerSnapshot: () => SERVER_SNAPSHOT,
    };
  }, []);

  return (
    <PointerContext.Provider value={value}>{children}</PointerContext.Provider>
  );
}

export function usePointerContext() {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("usePointerContext must be inside PointerProvider");
  return ctx;
}

export function usePointerPosition(): PointerSnapshot {
  const { subscribe, getSnapshot, getServerSnapshot } = usePointerContext();
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
