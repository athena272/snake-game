import { THEME } from '../../render/theme';
import styles from './Overlay.module.css';

const toCssColor = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;

const ITEMS = [
  { label: 'Maçã', effect: 'cresce 1', color: THEME.apple },
  { label: 'Veneno', effect: 'encolhe 1', color: THEME.poison },
  { label: 'Armadilha', effect: 'fim de jogo', color: THEME.trap },
] as const;

export function ItemLegend() {
  return (
    <ul className={styles.legend}>
      {ITEMS.map(({ label, effect, color }) => (
        <li key={label}>
          <span
            className={styles.swatch}
            style={{ backgroundColor: toCssColor(color) }}
            aria-hidden="true"
          />
          <strong>{label}</strong> {effect}
        </li>
      ))}
    </ul>
  );
}
