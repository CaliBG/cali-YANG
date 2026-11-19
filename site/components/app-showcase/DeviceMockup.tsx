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
  const image = zoom ? <MdxImg src={asset(src)} alt={alt} nativePreview /> : (
    <img src={asset(src)} alt={alt} width={dimensions?.width} height={dimensions?.height} loading="lazy" decoding="async" />
  );
  if (device === "phone") {
    return <div className={`${styles.deviceSize} ${styles.hardware}`}>{image}</div>;
  }
  return <div className={styles.deviceSize}>
    <div className={`${styles.device} ${styles.tablet}`}>
      <div className={styles.screen}>{image}</div>
    </div>
  </div>;
}
