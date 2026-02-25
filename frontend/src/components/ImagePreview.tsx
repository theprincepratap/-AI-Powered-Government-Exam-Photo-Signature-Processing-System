import styles from "./ImagePreview.module.css";

interface Props {

  src: string;

  kind: "photo" | "signature";
  label?: string;
}

export default function ImagePreview({ src, kind, label }: Props) {
  return (
    <figure className={`${styles.figure} ${styles[kind]}`}>
      <img src={src} alt={label ?? kind} className={styles.img} />
      {label && <figcaption className={styles.caption}>{label}</figcaption>}
    </figure>
  );
}
