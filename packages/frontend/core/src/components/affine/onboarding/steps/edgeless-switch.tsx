import { debounce } from 'lodash-es';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { OnboardingBlock } from '../switch-widgets/block';
import { EdgelessSwitchButtons } from '../switch-widgets/switch';
import { ToolbarSVG } from '../switch-widgets/toolbar';
import type { ArticleOption, EdgelessSwitchMode } from '../types';
import * as styles from './edgeless-switch.css';

interface EdgelessSwitchProps {
  article: ArticleOption;
}

const offsetXRanges = [-2000, 2000];
const offsetYRanges = [-2000, 2000];
const scaleRange = [0.5, 2];

interface State {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const defaultState: State = {
  scale: 0.8,
  offsetX: 0,
  offsetY: 0,
};

export const EdgelessSwitch = ({ article }: EdgelessSwitchProps) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef(false);
  const prevStateRef = useRef<State | null>(null);
  const turnOffScalingRef = useRef<() => void>(() => {});

  const [mode, setMode] = useState<EdgelessSwitchMode>('page');
  const [state, setState] = useState<State>(defaultState);

  const onSwitchToPageMode = useCallback(() => setMode('page'), []);
  const onSwitchToEdgelessMode = useCallback(() => setMode('edgeless'), []);
  const toggleGrabbing = useCallback((v: boolean) => {
    if (!windowRef.current) return;
    windowRef.current.classList.toggle('grabbing', v);
  }, []);
  const turnOnScaling = useCallback(() => {
    if (!windowRef.current) return;
    windowRef.current.classList.add('scaling');
  }, []);

  useEffect(() => {
    turnOffScalingRef.current = debounce(() => {
      if (!windowRef.current) return;
      windowRef.current.classList.remove('scaling');
    }, 100);
  }, []);

  useEffect(() => {
    if (mode === 'page') return;
    const canvas = canvasRef.current;
    const win = windowRef.current;
    if (!win || !canvas) return;

    const onWheel = (e: WheelEvent) => {
      turnOnScaling();
      const { deltaY } = e;
      const newScale = state.scale - deltaY * 0.001;
      const safeScale = Math.max(
        Math.min(newScale, scaleRange[1]),
        scaleRange[0]
      );
      setState(state => ({ ...state, scale: safeScale }));
      turnOffScalingRef.current?.();
    };

    // TODO: mobile support
    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      mouseDownRef.current = true;
      toggleGrabbing(true);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;
      const offsetX = state.offsetX + e.movementX / state.scale;
      const offsetY = state.offsetY + e.movementY / state.scale;

      const safeOffsetX = Math.max(
        Math.min(offsetX, offsetXRanges[1]),
        offsetXRanges[0]
      );
      const safeOffsetY = Math.max(
        Math.min(offsetY, offsetYRanges[1]),
        offsetYRanges[0]
      );

      setState({
        scale: state.scale,
        offsetX: safeOffsetX,
        offsetY: safeOffsetY,
      });
    };
    const onMouseUp = (_: MouseEvent) => {
      mouseDownRef.current = false;
      toggleGrabbing(false);
    };

    win.addEventListener('wheel', onWheel);
    win.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      win.removeEventListener('wheel', onWheel);
      win.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [
    mode,
    state.offsetX,
    state.offsetY,
    state.scale,
    toggleGrabbing,
    turnOnScaling,
  ]);

  useEffect(() => {
    if (mode === 'page') {
      // handle scale/drag
      setState(state => {
        prevStateRef.current = state;
        return { ...defaultState, scale: 1 };
      });

      // handle scroll
      canvasRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (prevStateRef.current) setState(prevStateRef.current);
      canvasRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [mode]);

  const canvasStyle = {
    '--scale': state.scale,
    '--offset-x': state.offsetX + 'px',
    '--offset-y': state.offsetY + 'px',
  } as CSSProperties;

  return (
    <div
      ref={windowRef}
      data-mode={mode}
      className={styles.edgelessSwitchWindow}
      style={canvasStyle}
    >
      <div className={styles.canvas} ref={canvasRef}>
        <div className={styles.page}>
          {
            /* render blocks */
            article.blocks.map((block, key) => {
              return <OnboardingBlock key={key} mode={mode} {...block} />;
            })
          }
        </div>
      </div>

      <EdgelessSwitchButtons
        className={styles.switchButtons}
        mode={mode}
        onSwitchToPageMode={onSwitchToPageMode}
        onSwitchToEdgelessMode={onSwitchToEdgelessMode}
      />

      <div className={styles.toolbar}>
        <ToolbarSVG />
      </div>
    </div>
  );
};
