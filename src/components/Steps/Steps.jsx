import styles from './Steps.module.css';

export function Steps({ children }) {
  return (
    <div className={`${styles.stepsContainer} ${styles.steps}`}>
      {children}
    </div>
  );
}
