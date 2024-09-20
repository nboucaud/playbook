import { NotificationCenter } from '@affine/component';
import { AuthModal } from '@affine/core/components/affine/auth';

import { CreateWorkspaceDialog } from './create-workspace';
import { CustomThemeModifier } from './custom-theme';
import { GlobalLoading } from './global-loading';
import { ImportTemplateDialog } from './import-template';
import { Telemetry } from './telemetry';

export const AllDialogs = () => {
  return (
    <>
      <NotificationCenter />
      <CustomThemeModifier />
      <Telemetry />
      <ImportTemplateDialog />
      <CreateWorkspaceDialog />
      <AuthModal />
      <GlobalLoading />
    </>
  );
};
