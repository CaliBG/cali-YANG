"use client";

import { useLanguage } from "@/lib/language";

const STATUS_DATE = "2026-11-13";

const papers = [
  {
    project: { en: "Tongkuang", zh: "同框" },
    title: "Translating situated needs into interaction constraints for dual camera recording",
    journal: "Interacting with Computers",
    date: "2026-11-10",
    status: { en: "Awaiting admin processing", zh: "等待编辑部处理" },
    description: {
      en: "A study of the Tongkuang dual-camera app that translates recording needs in situations such as unboxing and concerts into testable interaction constraints. A finite-state model checks feedback for recording, saving and exporting.",
      zh: "以双摄 App「同框」为案例，把开箱、演唱会等场景的拍摄需求转化为可验证的交互约束，并用有限状态模型检验录制、保存和导出反馈。",
    },
    url: "https://academic.oup.com/iwc",
  },
  {
    project: { en: "Valley AI", zh: "Valley AI" },
    title: "Governing Token Costs and User Control in Asynchronous Coding Agents",
    journal: "Australasian Journal of Information Systems",
    date: "2026-11-13",
    status: { en: "Submission stage", zh: "投稿阶段" },
    description: {
      en: "Using the Valley AI prototype, the study analyses token costs for peak-time planning and off-peak execution. It examines how permissions, a timeline and a modular canvas let users retain control over asynchronous coding work.",
      zh: "以 Valley AI 原型为案例，研究峰时规划、谷时执行的 Token 成本，以及用户如何通过授权、时间轴和模块化画布保留对开发过程的控制。",
    },
    url: "https://ajis.aaisnet.org/index.php/ajis",
  },
  {
    project: { en: "Vanod Slate", zh: "Vanod Slate" },
    title: "From Fit Models to Sealing Evidence in a Thin Handheld Enclosure",
    journal: "International Journal on Interactive Design and Manufacturing (IJIDeM)",
    date: "2026-11-12",
    status: { en: "Submitted to journal", zh: "期刊已收稿" },
    description: {
      en: "A staged CAD verification method for the Vanod Slate enclosure checks assembly fit, connector alignment and gasket gap sensitivity. The results identify what to measure on the next physical prototype.",
      zh: "以 Vanod Slate 外壳为案例，用分阶段 CAD 核验检查装配、接口对位和密封间隙，为下一轮实体样机确定测试项目。",
    },
    url: "https://link.springer.com/journal/12008",
  },
] as const;

export default function ResearchSubmissions() {
  const { lang } = useLanguage();
  const zh = lang === "zh";

  return (
    <section
      id="research"
      lang={zh ? "zh-CN" : "en"}
      aria-labelledby="research-heading"
      className="relative z-10 scroll-mt-24 bg-b1 px-4 py-16 text-l1 sm:px-8 lg:px-14 lg:py-24"
    >
      <div className="mx-auto grid max-w-[96rem] gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(15rem,1fr)_minmax(0,2.25fr)] lg:gap-12 lg:pt-12">
        <div>
          <h2 id="research-heading" className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            {zh ? "研究与投稿" : "Research & Submissions"}
          </h2>
          <p className="mt-4 font-mono-2 text-sm leading-relaxed text-l2">
            {zh ? "状态核对日期 " : "Status checked "}
            <time dateTime={STATUS_DATE}>{STATUS_DATE}</time>
          </p>
        </div>

        <ul className="min-w-0 divide-y divide-line border-y border-line">
          {papers.map((paper) => (
            <li key={paper.title} className="py-6 sm:py-8">
              <article className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-8">
                <div className="min-w-0">
                  <p className="mb-2 font-mono-2 text-sm text-l2">{paper.project[lang]}</p>
                  <h3 lang="en" className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                    {paper.title}
                  </h3>
                  <p lang="en" className="mt-2 text-sm font-medium leading-relaxed">{paper.journal}</p>
                  <p className="mt-3 max-w-prose text-base leading-relaxed text-l2">{paper.description[lang]}</p>
                </div>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end xl:flex-col xl:items-start xl:justify-start">
                  <dl className="grid gap-x-3 gap-y-1 text-sm leading-relaxed max-xl:grid-cols-[auto_1fr]">
                    <dt className="text-l2">{zh ? "投稿日期" : "Submitted"}</dt>
                    <dd className="font-mono-2 tabular-nums"><time dateTime={paper.date}>{paper.date}</time></dd>
                    <dt className="text-l2 xl:mt-2">{zh ? "当前状态" : "Status"}</dt>
                    <dd>{paper.status[lang]}</dd>
                  </dl>
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${zh ? "期刊官网" : "Journal website"} — ${paper.journal}`}
                    className="inline-flex shrink-0 items-center gap-2 py-1 text-sm font-medium underline decoration-current/35 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {zh ? "期刊官网" : "Journal website"} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
