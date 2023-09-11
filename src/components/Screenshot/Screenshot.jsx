import styles from './Screenshot.module.css';

export function Screenshot({ src, alt }) {

  return (
    <div className={styles.screenshotContainer}>
      <img src={src.src} alt={alt} className={styles.image} />
    </div>
  );
}
