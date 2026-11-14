export const researchEditorial = {
  iwc: {
    topic: { zh: '交互设计 / 需求可追溯性', en: 'Interaction / Requirements traceability' },
    headline: { zh: '什么时候，才算真正录好了？', en: 'When is a recording really ready?' },
    takeaway: { zh: '“完成”是一项需要证据支持的承诺。', en: 'Completion is a claim that needs evidence.' },
    abstract: { zh: '双摄界面需要同时协调拍摄、本地文件保留和目标位置导出，这三个过程可能在不同时间结束。论文提出包含来源、情境、目标、行为、技术边界和验证证据的六字段需求记录，用开箱与演唱会两个构造场景推导交互约束，再用有限状态模型检查完成提示的条件。本地与导出目标分别产生 10 和 14 个可达状态；参考模型满足三项预设安全不变量，而四种人为注入的状态转换错误均产生可识别的反例。五项回顾性工程记录用于划定实现证据的范围。研究将情境需求、界面反馈与验收证据连接起来，尚未证明真实使用中的可靠性或用户效益。', en: 'Capture, local retention and export can finish at different times. This study connects situated goals to inspectable completion conditions through a six-field requirement record and a finite-state specification. The local and export goals produce 10 and 14 reachable states. Four injected faults reveal counterexamples to the intended interaction contract. Five retrospective engineering episodes establish the boundaries of implementation evidence. The evaluation concerns model consistency, not deployed reliability or user benefit.' },
    insight: { zh: '界面上同样的“完成”，可能对应完全不同的事实。停止采集只意味着录制过程结束，本地文件可用和目标相册导出成功仍是独立的条件。设计必须先确定用户的目标，再决定哪一条证据足以触发完成提示。', en: 'The same completion label can conceal different facts. Stopping capture does not establish that a file is retained or that export succeeded. The selected goal must determine which evidence licenses completion feedback.' },
    metrics: [['10 / 14', { zh: '两种目标的可达状态数', en: 'Reachable states by goal' }], ['4', { zh: '检出的注入故障', en: 'Injected faults detected' }], ['5', { zh: '回顾性工程记录', en: 'Engineering episodes' }]],
    steps: { zh: ['保留需求来源', '定义情境目标', '写出交互约束', '遍历状态与反例'], en: ['Preserve provenance', 'Define a situated goal', 'Specify obligations', 'Explore counterexamples'] },
  },
  ajis: {
    topic: { zh: '信息系统 / 人机委托', en: 'Information systems / Delegation' },
    headline: { zh: '人离线以后，谁来决定下一步？', en: 'Who decides when the developer is away?' },
    takeaway: { zh: '更低的执行价格，需要可追溯的决策来配合。', en: 'Cheaper execution needs accountable decisions.' },
    abstract: { zh: '谷价时段可能恰好出现在开发者无法回答问题的时候。论文以桌面编程智能体原型为对象，研究如何把时变推理费用、有限授权和可复核的模块版本连接起来。材料包括两条去标识工程记录、归档实现检查、34 项定向离线回归检查、队列重放与确定性费用情景。在一条已完成记录中，固定 Token 用量及峰时规划成本后，执行费率减半仅使两阶段总费用估算下降 16.5%。队列分析还显示，单项任务的最低价安排可能挤占另一任务唯一可负担的执行时段。研究据此提出可验证的交接、授权与修改命题，未分析实际服务商账单或参与者成效。', en: 'A lower-price execution window can arrive while the developer is unavailable. This design-science study connects time-based inference prices, scoped delegation and reviewable module versions. Evidence includes two engineering traces, 34 offline checks, archive inspection, a queue replay and deterministic pricing scenarios. Halving execution rates reduces the total estimate by 16.5% in one completed trace. Scheduling the cheapest slot for one task can also exclude another. The study proposes testable handoff and revision outcomes without claiming measured user benefit or invoice savings.' },
    insight: { zh: '价格优化的单位应当是一项完整任务。提前讨论的费用、无人值守时的决策权限、返回后的复核和重做，都影响“便宜”的实际含义。保存模块版本的同时，还需要保存生成它的指令、授权与决策关系。', en: 'The relevant unit of cost is the whole task. Planning, delegated authority, subsequent review and rework all shape what cheaper means. A saved module needs the instructions and decisions that explain its origin.' },
    metrics: [['34', { zh: '定向离线检查', en: 'Targeted offline checks' }], ['2', { zh: '去标识工程记录', en: 'Engineering traces' }], ['16.5%', { zh: '单条记录的条件费用降幅', en: 'Conditional reduction in one trace' }]],
    steps: { zh: ['确认任务与预算', '划定委托权限', '按条件执行', '复核版本与分支'], en: ['Confirm brief and budget', 'Scope authority', 'Execute within bounds', 'Review versions and branches'] },
  },
  ijidem: {
    topic: { zh: '工业设计 / 工程验证', en: 'Industrial design / Verification' },
    headline: { zh: '模型装得下，实物就可靠吗？', en: 'A model fits. What does that prove?' },
    takeaway: { zh: '每一份模型，只回答它有证据回答的问题。', en: 'Each model answers a bounded question.' },
    abstract: { zh: '薄型外壳可以通过数字干涉检查，同时仍在密封、接口和活动结构上保留风险。论文围绕一款 62 × 90 mm 手持设备的三版外壳建立分阶段 CAD 验证方法：用可打印替代件隔离装配问题，以供应商尺寸包络检查元件布局，再单独分析后盖密封。12 个早期打印文件与 2 个后续打印布局的网格闭合且绕向一致，两份装配 STEP 文件重新导入有效。额外施加 ±0.03 mm 间隙变化后，计算压缩率区间由 16.30–26.21% 扩展至 11.85–30.34%。接口平移 1.49 mm 可消除名义干涉，但进一步平移后的零干涉位置仍可能发生接触。结果用于安排下一轮实体测试，未构成防水、强度或电气认证。', en: 'A thin enclosure can pass a digital interference check while retaining unresolved sealing and interface risks. Across three revisions of a 62 × 90 mm enclosure, this study separates fit models, supplier-dimensional packaging and seal geometry. Fourteen print files or layouts pass mesh checks and two STEP assemblies re-import successfully. An additional ±0.03 mm gap excursion widens the calculated squeeze interval from 16.30–26.21% to 11.85–30.34%. Connector translation eliminates one nominal intersection, but zero overlap can still coincide with contact. These results define subsequent physical tests, not physical qualification.' },
    insight: { zh: '“没有碰撞”需要连同检查阈值、例外和模型假设一起阅读。密封性能还受到材料、表面与变形影响；一个闭合的网格只支持数字文件完整性。论文用证据矩阵把每项数字结论对应到尚待完成的实体测量。', en: 'A no-collision result depends on thresholds, exclusions and model assumptions. Sealing also depends on material, finish and deformation. The evidence matrix links each digital conclusion to the physical measurement still required.' },
    metrics: [['62 × 90', { zh: '外壳名义轮廓 / mm', en: 'Nominal footprint / mm' }], ['±0.03', { zh: '附加间隙扰动 / mm', en: 'Imposed gap excursion / mm' }], ['1.49', { zh: '移除名义干涉的平移 / mm', en: 'Translation removing overlap / mm' }]],
    steps: { zh: ['隔离装配问题', '核对元件包络', '检查密封敏感性', '确定实体测试'], en: ['Isolate fit questions', 'Check component envelopes', 'Analyse seal sensitivity', 'Specify physical tests'] },
  },
} as const;
