import { articles } from './articles';
import { PaperSteps } from './paper-steps';
import * as styles from './style.css';

interface OnboardingProps {
  onOpenApp?: () => void;
}

export const Onboarding = (_: OnboardingProps) => {
  return (
    <div className={styles.onboarding} data-is-desktop={environment.isDesktop}>
      <div className={styles.offsetOrigin}>
        {Object.entries(articles).map(([id, article]) => {
          return <PaperSteps key={id} article={article} show={true} />;
        })}
      </div>
    </div>
  );
};
