import type { OnboardingBlockOption } from '../types';
import { h1 } from './blocks.css';

export const article2: Array<OnboardingBlockOption> = [
  {
    children: <h1 className={h1}>HOWTO: Be more productive</h1>,
    offset: { x: 0, y: 0 },
  },
  {
    children: <img src="./assets/article-0-note-1.png" />,
    edgelessOnly: true,
  },
];
