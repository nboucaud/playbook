import { PagePropertiesTable } from '@affine/core/components/affine/page-properties';
import { useReactiveAdapter } from '@affine/core/hooks/use-affine-adapter';
import { WorkspacePropertiesAdapter } from '@affine/core/modules/workspace';
import { __unstableSchemas, AffineSchemas } from '@blocksuite/blocks/models';
import { Schema } from '@blocksuite/store';
import type { StoryFn } from '@storybook/react';
import { useService } from '@toeverything/infra/di';

const schema = new Schema();
schema.register(AffineSchemas).register(__unstableSchemas);

export default {
  title: 'AFFiNE/PageInfoProperties',
};

export const PageInfoProperties: StoryFn<typeof PagePropertiesTable> = _ => {
  const adapter = useService(WorkspacePropertiesAdapter);
  useReactiveAdapter(adapter);
  return (
    <div style={{ height: '100vh' }}>
      <PagePropertiesTable />
    </div>
  );
};
