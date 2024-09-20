import { Button } from '@affine/component';
import { AuthPageContainer } from '@affine/component/auth-components';
import { useNavigateHelper } from '@affine/core/components/hooks/use-navigate-helper';
import { Trans, useI18n } from '@affine/i18n';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import * as styles from './styles.css';

/**
 * /upgrade-success page
 *
 * only on web
 */
export const Component = () => {
  const t = useI18n();
  const [params] = useSearchParams();

  const { jumpToIndex, openInApp } = useNavigateHelper();
  const openAffine = useCallback(() => {
    if (params.get('schema')) {
      openInApp(params.get('schema') ?? 'affine', 'bring-to-front');
    } else {
      jumpToIndex();
    }
  }, [jumpToIndex, openInApp, params]);

  const subtitle = (
    <div className={styles.leftContentText}>
      {t['com.affine.payment.upgrade-success-page.text']()}
      <div>
        <Trans
          i18nKey={'com.affine.payment.upgrade-success-page.support'}
          components={{
            1: (
              <a
                href="mailto:support@toeverything.info"
                className={styles.mail}
              />
            ),
          }}
        />
      </div>
    </div>
  );

  return (
    <AuthPageContainer
      title={t['com.affine.payment.upgrade-success-page.title']()}
      subtitle={subtitle}
    >
      <Button variant="primary" size="extraLarge" onClick={openAffine}>
        {t['com.affine.other-page.nav.open-affine']()}
      </Button>
    </AuthPageContainer>
  );
};
