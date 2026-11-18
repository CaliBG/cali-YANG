import { asset } from "@/lib/asset";
import MdxImg from "@/components/mdx/MdxImg";
import { mediaSize } from "@/lib/media";
import styles from "./showcase.module.css";

export type DeviceKind = "phone" | "tablet";

export default function DeviceMockup({ src, alt, device = "phone", zoom = false }: {
  src: string;
  alt: string;
  device?: DeviceKind;
  zoom?: boolean;
}) {
  const dimensions = mediaSize(src);
  return <div className={styles.deviceSize}>
    <div className={`${styles.device} ${styles[device]}`}>
      <div className={styles.screen}>
        {zoom ? <MdxImg src={asset(src)} alt={alt} nativePreview /> :
          <img src={asset(src)} alt={alt} width={dimensions?.width ?? (device === "tablet" ? 2732 : 370)} height={dimensions?.height ?? (device === "tablet" ? 2048 : 800)} loading="lazy" decoding="async" />}
      </div>
    </div>
  </div>;
}
