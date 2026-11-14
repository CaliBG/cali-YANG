export const RESEARCH_STATUS_DATE = "2026-11-14";

export const researchPapers = [
  {
    slug: "dual-camera-interaction-constraints",
    project: { en: "Tongkuang", zh: "同框" },
    title: "Translating situated needs into interaction constraints for dual camera recording",
    journal: "Interacting with Computers",
    date: "2026-11-10",
    status: { en: "Rejected 14 Nov 2026 (scope mismatch); new HCI study in preparation", zh: "2026-11-14 原稿已拒稿，准备新的 HCI 研究" },
    url: "https://academic.oup.com/iwc",
    mark: "iwc",
    description: {
      en: "A method for turning recording goals into testable rules for capture, local saving and export in a dual-camera interface.",
      zh: "把双摄拍摄场景中的记录目标转化为可测试的规则，明确何时开始录制、何时保存，以及何时可以确认导出完成。",
    },
    question: {
      en: "When a moment cannot be repeated, what evidence should a camera interface have before telling someone that a recording is ready?",
      zh: "当一个瞬间无法重来，拍摄界面依据什么证据，才能告诉用户这段视频已经可以使用？",
    },
    method: {
      en: "Two constructed scenarios, unboxing and a concert, inform a six-field requirement record covering source, situation, goal, behaviour, technical boundary and verification evidence. A finite-state model distinguishes capture, retention and export. Five selected engineering episodes contextualise the model’s assumptions.",
      zh: "以开箱和演唱会两个构造场景建立需求记录，逐项注明需求来源、情境、目标、行为、技术边界与验证证据。研究用有限状态模型区分录制、保留本地文件与导出，并以五项开发记录说明模型的适用边界。",
    },
    findings: [
      {
        en: "The reference model reached 10 states for the local goal and 14 for the export goal. No violation of the three specified invariants was found within the model.",
        zh: "参考模型在本地保存目标下有 10 个可达状态，在导出目标下有 14 个。模型遍历未发现违反三项预设不变量的路径。",
      },
      {
        en: "Four deliberately introduced faults exposed early recording feedback, premature completion, false export success and loss of the retained local file.",
        zh: "四种故意植入的状态转换错误暴露了录制提示过早、完成提示过早、导出成功误报，以及已保留的本地文件丢失。",
      },
    ],
    limits: {
      en: "The scenarios are constructed, and the model abstracts away concurrency, timing and later file corruption. The retrospective records do not estimate user preference or deployed reliability.",
      zh: "场景为研究构造，模型简化了并发、时序和文件后续损坏等问题。回顾性的开发记录无法估计用户偏好或上线后的可靠性。",
    },
  },
  {
    slug: "asynchronous-coding-agents",
    project: { en: "Valley AI", zh: "Valley AI" },
    title: "Governing Token Costs and User Control in Asynchronous Coding Agents",
    journal: "Australasian Journal of Information Systems",
    date: "2026-11-13",
    status: { en: "Submission stage", zh: "投稿阶段" },
    url: "https://ajis.aaisnet.org/index.php/ajis",
    mark: "ajis",
    description: {
      en: "A design-science study of time-based token prices, scoped delegation and reviewable decisions in asynchronous coding work.",
      zh: "以异步编程智能体为案例，研究峰谷 Token 成本、委托权限和事后复核如何在同一工作流中协调。",
    },
    question: {
      en: "How can developers use a cheaper execution window while retaining control over decisions an agent makes in their absence?",
      zh: "当开发者无法在线回复智能体时，如何利用谷价执行任务，同时保留对关键决策和后续修改的控制？",
    },
    method: {
      en: "The study examines an archived prototype and two de-identified engineering traces, using 34 targeted offline regression checks, a queue replay and deterministic pricing scenarios. The prototype connects a planning brief and scoped delegation to a canvas of decisions and module versions.",
      zh: "研究检查归档原型和两条去标识工程记录，并进行 34 项定向离线回归检查、一次队列重放及确定性计费分析。原型用画布记录委托决定与模块版本，便于开发者返回后复核。",
    },
    findings: [
      {
        en: "In one completed trace, halving execution rates reduced the two-phase cost estimate by 16.5%, with token usage and peak-priced planning held fixed.",
        zh: "在一条已完成记录中，保持 Token 用量与峰时规划费率不变，执行费率减半使两阶段总费用估算下降 16.5%。",
      },
      {
        en: "The queue replay showed how a flexible high-priority task can consume the only affordable slot for a later task. An earlier placement can accommodate both at a higher forecast cost.",
        zh: "队列重放显示，时间灵活的高优先级任务可能占用后续任务唯一负担得起的时段。将前者提前执行可以容纳两项任务，但预计总成本会上升。",
      },
    ],
    limits: {
      en: "Cost results are conditional estimates from archived usage and assumed prices. They do not measure provider bills, user outcomes or production scheduling performance.",
      zh: "费用结果来自归档用量和设定费率。研究未核对实际账单，也未测量用户成效或生产环境的调度表现。",
    },
  },
  {
    slug: "handheld-enclosure-verification",
    project: { en: "Vanod Slate", zh: "Vanod Slate" },
    title: "From Fit Models to Sealing Evidence in a Thin Handheld Enclosure",
    journal: "International Journal on Interactive Design and Manufacturing",
    date: "2026-11-12",
    status: { en: "Submitted to journal", zh: "期刊已收稿" },
    url: "https://link.springer.com/journal/12008",
    mark: "ijidem",
    description: {
      en: "A staged CAD verification method for assembly fit, connector alignment and seal geometry in a thin handheld enclosure.",
      zh: "用分阶段 CAD 核验检查薄型手持设备外壳的装配、接口对位和密封几何，并据此确定实体样机的测试项目。",
    },
    question: {
      en: "What can digital geometry establish about a thin enclosure, and which uncertainties still need a physical prototype?",
      zh: "数字几何核验可以为薄型外壳提供哪些证据，又有哪些问题需要靠实体样机才能回答？",
    },
    method: {
      en: "Across three design revisions, the study separates printable fit models, component layout and a rear-seal model. It audits exported meshes, re-imports assembly STEP files, calculates tolerance sensitivity and checks the connector against the frame.",
      zh: "研究回顾三版设计，将可打印装配模型、元件布局和后盖密封模型分开核验。方法包括网格检查、装配 STEP 文件重新导入、确定性公差分析及接口与前框的几何干涉检查。",
    },
    findings: [
      {
        en: "Twelve early print files and two later print layouts had closed, consistently wound meshes. Both assembly STEP exports re-imported as valid geometry.",
        zh: "12 个早期打印文件和 2 个后续打印布局的网格均闭合且绕向一致。两份装配 STEP 文件重新导入后均为有效几何。",
      },
      {
        en: "The gap sensitivity calculation widened the estimated gasket squeeze range. The connector study also found that zero overlap could coincide with contact.",
        zh: "间隙敏感性计算表明，密封件的压缩量可能落在更宽的区间。接口核验也发现，零干涉仍可能伴随接触，不能据此确认已留出装配间隙。",
      },
    ],
    limits: {
      en: "The results describe CAD geometry and calculated sensitivity. Ingress resistance, strength and electrical performance still need physical testing.",
      zh: "结果限于 CAD 几何和敏感性计算。防水、强度和电气性能仍需实体试验。",
    },
  },
] as const;

export type ResearchPaper = (typeof researchPapers)[number];

export function getResearchPaper(slug: string) {
  return researchPapers.find((paper) => paper.slug === slug);
}
