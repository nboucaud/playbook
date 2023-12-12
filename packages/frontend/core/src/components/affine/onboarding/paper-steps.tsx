import { useCallback, useState } from 'react';

import { AnimateIn } from './steps/animate-in';
import { EdgelessSwitch } from './steps/edgeless-switch';
import { Unfolding } from './steps/unfolding';
import type { ArticleId, OnboardingStep } from './types';
import { type ArticleOption } from './types';

interface PaperStepsProps {
  show?: boolean;
  article: ArticleOption;
  onFoldChange?: (id: ArticleId, v: boolean) => void;
  onFoldChanged?: (id: ArticleId, v: boolean) => void;
}

export const PaperSteps = ({
  show,
  article,
  onFoldChange,
  onFoldChanged,
}: PaperStepsProps) => {
  const [stage, setStage] = useState<OnboardingStep>('enter');

  const onEntered = useCallback(() => {
    setStage('unfold');
  }, []);

  const _onFoldChange = useCallback(
    (v: boolean) => {
      onFoldChange?.(article.id, v);
    },
    [onFoldChange, article.id]
  );

  const _onFoldChanged = useCallback(
    (v: boolean) => {
      onFoldChanged?.(article.id, v);
      if (!v) setStage('edgeless-switch');
    },
    [onFoldChanged, article.id]
  );

  if (!show) return null;
  return stage === 'enter' ? (
    <AnimateIn article={article} onFinished={onEntered} />
  ) : stage === 'unfold' ? (
    <Unfolding
      article={article}
      onChange={_onFoldChange}
      onChanged={_onFoldChanged}
    />
  ) : (
    <EdgelessSwitch article={article} />
  );
};
