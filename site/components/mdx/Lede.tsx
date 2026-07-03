// 导语区块（docs/14-detail-pages.md §2.3 疑点 1）：每页正文第一块的弱化段落组，
// class 与基准 HTML 逐字一致。

export default function Lede({ children }: { children: React.ReactNode }) {
  return (
    <div className="[&_p+p]:mt-3 [&_p]:mb-0 text-l2 [&_p]:text-l2! text-sm lg:text-base leading-relaxed">
      {children}
    </div>
  );
}
