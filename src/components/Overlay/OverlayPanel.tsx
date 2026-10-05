import { useId, type ReactNode } from 'react';
import styles from './Overlay.module.css';

interface OverlayPanelProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function OverlayPanel({ title, children }: OverlayPanelProps) {
  const titleId = useId();
  return (
    <div className={styles.backdrop}>
      <section className={styles.panel} role="dialog" aria-labelledby={titleId}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
      </section>
    </div>
  );
}
