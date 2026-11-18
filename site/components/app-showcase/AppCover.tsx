import { useLanguage } from "@/lib/language";
import DeviceMockup, { type DeviceKind } from "./DeviceMockup";
import styles from "./showcase.module.css";

export interface AppPresentation {
  device: DeviceKind;
  scene: "notebook" | "conversation" | "ledger";
}

// Daily costs from the three items in the purchased-items screenshot.
const receiptItems = [
  ["Sony A7C II", "145.15"],
  ["MacBook Pro", "90.90"],
  ["AirPods Pro", "5.95"],
];

function CostReceipt({ chinese }: { chinese: boolean }) {
  return <div className={styles.receipt} aria-hidden="true">
    <div className={styles.receiptBrand}>{chinese ? "久用" : "LongUse"}</div>
    <div className={styles.receiptTitle}>{chinese ? "物品日均账单" : "Daily cost ledger"}</div>
    <div className={styles.receiptItems}>
      {receiptItems.map(([name, cost]) => <div key={name}><span>{name}</span><span>{cost}</span></div>)}
    </div>
    <div className={styles.totalLabel}>{chinese ? "今日总日均成本" : "Total cost per day"}</div>
    <div className={styles.total}>¥242.01</div>
  </div>;
}

export default function AppCover({ presentation, src, name }: {
  presentation: AppPresentation;
  src: string;
  name: string;
}) {
  const { lang } = useLanguage();
  const { scene, device } = presentation;
  return <div className={`${styles.cover} ${styles[scene]}`} data-app-cover={scene}>
    {scene === "notebook" && <div className={styles.stylus} aria-hidden="true" />}
    {scene === "conversation" && <div className={styles.dialogue} aria-hidden="true">
      <div className={styles.wordmark}>AILY</div>
      <div className={styles.prompt}>hello</div>
      <div className={styles.reply}>Hello! <span>😊</span><br />How can I assist you today?</div>
    </div>}
    {scene === "ledger" && <CostReceipt chinese={lang === "zh"} />}
    <div className={styles.coverDevice}><DeviceMockup src={src} alt={name} device={device} /></div>
  </div>;
}
