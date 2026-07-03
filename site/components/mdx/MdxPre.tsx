"use client";

// MdxPre 代码块（docs/14-detail-pages.md §4，模块 93325）
// - prism-react-renderer，theme 缺省（vsDark 兜底只落在行容器 style 上，与基准一致）
// - 逐 token 用 --code-* CSS 变量覆盖 color，行号 + COPY 按钮
// - bash 未在 vendored 语言表中 → 整行 plain token，与基准 HTML 相同

import { useEffect, useRef, useState } from "react";
import { Highlight, type Language } from "prism-react-renderer";
import { DOTTED_BORDER_BASE } from "@/lib/ui-classes";

const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript React",
  js: "JavaScript",
  jsx: "JavaScript React",
  py: "Python",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  json: "JSON",
  yml: "YAML",
  yaml: "YAML",
  md: "Markdown",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  text: "Plain Text",
};

function languageLabel(lang: string): string {
  if (LANGUAGE_LABELS[lang]) return LANGUAGE_LABELS[lang];
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

// token.types → CSS 变量（按类别顺序，先命中先用；docs/14 §4 表）
const TOKEN_COLOR_RULES: Array<[string[], string]> = [
  [["comment", "prolog", "doctype"], "var(--code-comment)"],
  [["string", "char"], "var(--code-string)"],
  [["number", "boolean", "constant"], "var(--code-number)"],
  [["keyword", "atrule", "important"], "var(--code-keyword)"],
  [["function", "class-name"], "var(--code-function)"],
  [["operator", "punctuation"], "var(--code-operator)"],
  [["property", "attr-name", "tag"], "var(--code-tag)"],
];

function tokenCssColor(types: readonly string[]): string {
  for (const [names, color] of TOKEN_COLOR_RULES) {
    if (types.some((t) => names.includes(t))) return color;
  }
  return "var(--label-1)";
}

const COPY_BUTTON_CLASS = `${DOTTED_BORDER_BASE} cursor-pointer px-1 py-0.5 font-mono text-xs uppercase tracking-wide text-(--label-2) transition-colors lg:hover:text-(--label-1) focus-visible:text-(--label-1) focus-visible:outline-none focus-visible:before:border-l1`;

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      className={COPY_BUTTON_CLASS}
      aria-label={copied ? "Copied code" : "Copy code"}
      onClick={handleCopy}
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

export default function MdxPre({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const src = code.replace(/\n+$/, "");
  return (
    <div className="group my-6 overflow-hidden rounded-xl bg-[rgba(var(--label-d),0.03)]">
      <div className="flex items-center justify-between px-3 py-2 shadow-[inset_0_-1px_0_0_var(--line)] lg:px-4">
        <span className="px-1 font-mono text-xs tracking-wide text-(--label-3)">
          {languageLabel(language)}
        </span>
        <CopyButton code={src} />
      </div>
      <Highlight code={src} language={language as Language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="overflow-x-auto px-4 py-2 font-mono text-xs leading-relaxed text-(--label-1) lg:px-5 lg:py-2.5 lg:text-sm ">
            <code className={`language-${language}`}>
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                return (
                  <div
                    key={i}
                    className="gap-4 grid grid-cols-[auto_1fr]"
                    style={lineProps.style}
                  >
                    <span
                      aria-hidden="true"
                      className="select-none text-right tabular-nums text-(--label-4)"
                    >
                      {i + 1}
                    </span>
                    <span>
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        return (
                          <span
                            key={key}
                            {...tokenProps}
                            style={{
                              ...(token.empty
                                ? { display: "inline-block" }
                                : null),
                              color: tokenCssColor(token.types),
                            }}
                          />
                        );
                      })}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
