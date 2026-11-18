import DeviceMockup from "./DeviceMockup";
import type { DeviceKind } from "./DeviceMockup";
import styles from "./showcase.module.css";

export interface AppPresentation {
  device: DeviceKind;
  tone: "paper" | "indigo" | "blue";
}

export default function AppCover({ presentation, images, name }: {
  presentation: AppPresentation;
  images: string[];
  name: string;
}) {
  return <div className={`${styles.cover} ${styles[presentation.tone]}`} data-app-cover>
    <div className={styles.coverRear}>
      <DeviceMockup src={images[1] ?? images[0]} alt={`${name} · 2`} device={presentation.device} />
    </div>
    <div className={styles.coverFront}>
      <DeviceMockup src={images[0]} alt={name} device={presentation.device} />
    </div>
  </div>;
}
