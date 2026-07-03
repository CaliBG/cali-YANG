"use client";

// TransitionLink（docs/11-shell.md §8.1，模块 80894）
// 同路径 → lenisScrollTo(0, {lerp:.1}) 回顶；不同路径 → startNavigation 走全屏过渡
// （preventDefault 掉 next/link 默认跳转）。activeClassName 时当前路径显示底边。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { scrollEnv } from "@/lib/scroll-env";
import type { ComponentProps, MouseEvent } from "react";

interface TransitionLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  activeClassName?: string;
}

export default function TransitionLink({
  href,
  className,
  activeClassName,
  onClick,
  children,
  ...rest
}: TransitionLinkProps) {
  const pathname = usePathname();
  const { startNavigation } = useFullscreenTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    if (pathname === href) {
      scrollEnv.lenisScrollTo(0, { lerp: 0.1 });
    } else {
      startNavigation(href);
    }
  };

  const cls =
    activeClassName && pathname === href
      ? `${className ?? ""} ${activeClassName}`
      : className;

  return (
    <Link href={href} className={cls} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
