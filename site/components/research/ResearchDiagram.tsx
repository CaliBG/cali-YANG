"use client";
import { useState } from "react";
import type { ResearchPaper } from "@/lib/research";
import styles from "./research.module.css";

type Props = { mark: ResearchPaper['mark']; zh: boolean };
export default function ResearchDiagram({ mark, zh }: Props) {
  const [option, setOption] = useState(0);
  const labels = mark === 'iwc' ? (zh ? ['本地保存目标', '导出目标'] : ['Local goal', 'Export goal']) : mark === 'ajis' ? (zh ? ['峰价执行', '执行费率减半'] : ['Peak execution', 'Half-price execution']) : (zh ? ['发布尺寸', '附加 ±0.03 mm'] : ['Release dimensions', 'Extra ±0.03 mm']);
  return <div className={styles.diagram}>
    <div className={styles.diagramControls} role="group" aria-label={zh ? '切换图解条件' : 'Diagram condition'}>
      {labels.map((label, i) => <button type="button" key={label} aria-pressed={option === i} onClick={() => setOption(i)}>{label}</button>)}
    </div>
    {mark === 'iwc' ? <div className={styles.stateDiagram}>
      <div className={styles.statePath}>
        {(zh ? ['采集', '本地保留', '导出'] : ['Capture', 'Retain', 'Export']).map((label, i) => <div key={label} className={styles.stateNode} data-active={i <= option + 1}>
          <span className={styles.stateCircle}>{i === option + 1 ? '✓' : String(i + 1).padStart(2, '0')}</span><span>{label}</span>
        </div>)}
      </div>
      <div className={styles.diagramResult} aria-live="polite"><strong>{option ? '14' : '10'}</strong><span>{zh ? '可达状态' : 'reachable states'}<small>{zh ? '完成条件随目标改变' : 'Completion follows the selected goal'}</small></span></div>
      <p className={styles.figureNote}>{zh ? '交互契约示意，数值来自论文的有限状态模型。' : 'Interaction-contract schematic; counts from the finite-state model.'}</p>
    </div> : mark === 'ajis' ? <div className={styles.costDiagram}>
      <div className={styles.costPlot} aria-hidden="true">
        <div className={styles.costColumn}><span>{zh ? '规划' : 'Planning'}</span><div style={{ height: '100%' }} /></div>
        <div className={styles.costColumn}><span>{zh ? '执行' : 'Execution'}</span><div style={{ height: option ? '24.63%' : '49.25%' }} data-execution="true" /></div>
      </div>
      <div className={styles.diagramResult} aria-live="polite"><strong>{option ? '83.5' : '100'}<em>%</em></strong><span>{zh ? '归一化总费用' : 'normalised total cost'}<small>{zh ? '规划用量与价格保持不变' : 'Planning usage and prices held fixed'}</small></span></div>
      <p className={styles.figureNote}>{zh ? '基于单条完成记录的条件估算，基线为 100%。' : 'Conditional estimate for one completed trace; baseline = 100%.'}</p>
    </div> : <div className={styles.sealDiagram}>
      <svg viewBox="0 0 440 145" role="img" aria-label={zh ? '密封件压缩率计算区间，横轴为百分比' : 'Calculated gasket squeeze interval, horizontal axis in percent'}>
        <line x1="30" y1="105" x2="410" y2="105" className={styles.axis}/>
        {[0,10,20,30,40].map(v=><g key={v}><line x1={30+v*9.5} y1="101" x2={30+v*9.5} y2="110" className={styles.axis}/><text x={30+v*9.5} y="131" textAnchor="middle">{v}%</text></g>)}
        <line x1={30+(option ? 11.85 : 16.30)*9.5} x2={30+(option ? 30.34 : 26.21)*9.5} y1="61" y2="61" className={styles.interval}/>
        {[option ? 11.85 : 16.30,option ? 30.34 : 26.21].map((v,i)=><circle key={i} cx={30+v*9.5} cy="61" r="6" className={styles.intervalDot}/>)}
      </svg>
      <div className={styles.diagramResult} aria-live="polite"><strong className={styles.rangeValue}>{option ? '11.85–30.34' : '16.30–26.21'}<em>%</em></strong></div>
      <p className={styles.figureNote}>{zh ? '计算压缩率区间，非实测值或合格判据。' : 'Calculated squeeze interval, not a measured result or pass criterion.'}</p>
    </div>}
  </div>;
}
