import styles from './LoadingIndicator.module.css';

interface LoadingIndicatorProps {
  readonly label: string;
}

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
