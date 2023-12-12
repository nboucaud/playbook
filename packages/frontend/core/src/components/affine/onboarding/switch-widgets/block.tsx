import type { CSSProperties } from 'react';

import { type EdgelessSwitchMode, type OnboardingBlockOption } from '../types';
import { onboardingBlock } from './style.css';

interface OnboardingBlockProps extends OnboardingBlockOption {
  mode: EdgelessSwitchMode;
  style?: CSSProperties;
}

export const OnboardingBlock = ({
  bg,
  mode,
  style,
  children,
  offset,
  position,
  fromPosition,
  enterDelay,
  leaveDelay,
  edgelessOnly,
}: OnboardingBlockProps) => {
  const blockStyles = {
    '--bg': bg,
    '--enter-delay': enterDelay ? `${enterDelay}ms` : '0ms',
    '--leave-delay': leaveDelay ? `${leaveDelay}ms` : '0ms',
    zIndex: position ? 1 : 0,
    position: position || fromPosition ? 'absolute' : 'relative',
    ...style,
  } as CSSProperties;

  if (mode === 'page') {
    if (fromPosition) {
      blockStyles.left = fromPosition.x ?? 'unset';
      blockStyles.top = fromPosition.y ?? 'unset';
    }
  } else {
    if (offset) {
      blockStyles.transform = `translate(${offset.x}px, ${offset.y}px)`;
    }
    if (position) {
      blockStyles.left = position.x ?? 'unset';
      blockStyles.top = position.y ?? 'unset';
    }
  }

  return (
    <div
      style={blockStyles}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      className={onboardingBlock}
      data-mode={mode}
      data-bg-mode={bg && mode === 'edgeless'}
      data-invisible={mode === 'page' && edgelessOnly}
    >
      {children}
    </div>
  );
};
