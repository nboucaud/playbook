import { notify } from '@affine/component';
import {
  generateUrl,
  type UseSharingUrl,
} from '@affine/core/hooks/affine/use-share-url';
import { getAffineCloudBaseUrl } from '@affine/core/modules/cloud/services/fetch';
import { EditorService } from '@affine/core/modules/editor';
import { I18n } from '@affine/i18n';
import type { MenuItemGroup } from '@blocksuite/affine-components/toolbar';
import type { MenuContext } from '@blocksuite/blocks';
import { LinkIcon } from '@blocksuite/icons/lit';
import type { FrameworkProvider } from '@toeverything/infra';

export function createToolbarMoreMenuConfig(framework: FrameworkProvider) {
  return {
    configure: <T extends MenuContext>(groups: MenuItemGroup<T>[]) => {
      const clipboardGroup = groups.find(group => group.type === 'clipboard');

      if (clipboardGroup) {
        const copyIndex = clipboardGroup.items.findIndex(
          item => item.type === 'copy'
        );
        clipboardGroup.items.splice(
          copyIndex + 1,
          0,
          createCopyLinkToBlockMenuItem(framework)
        );
      }

      return groups;
    },
  };
}

function createCopyLinkToBlockMenuItem(
  framework: FrameworkProvider,
  item = {
    icon: LinkIcon({ width: '20', height: '20' }),
    label: 'Copy link to block',
    type: 'copy-link-to-block',
    when: (ctx: MenuContext) => {
      if (ctx.isEmpty()) return false;

      const { editor } = framework.get(EditorService);
      const mode = editor.mode$.value;

      if (mode === 'edgeless') {
        // linking blocks in notes is currently not supported in edgeless mode.
        if (ctx.selectedBlockModels.length > 0) {
          return false;
        }

        // linking single block/element in edgeless mode.
        if (ctx.isMultiple()) {
          return false;
        }
      }

      return true;
    },
  }
) {
  return {
    ...item,
    action: (ctx: MenuContext) => {
      const baseUrl = getAffineCloudBaseUrl();
      if (!baseUrl) return;

      const { editor } = framework.get(EditorService);
      const mode = editor.mode$.value;
      const pageId = editor.doc.id;
      const workspaceId = editor.doc.workspace.id;
      const options: UseSharingUrl = { workspaceId, pageId, shareMode: mode };

      if (mode === 'page') {
        // maybe multiple blocks
        const blockIds = ctx.selectedBlockModels.map(model => model.id);
        options.blockIds = blockIds;
      } else if (mode === 'edgeless' && ctx.firstElement) {
        // single block/element
        const id = ctx.firstElement.id;
        const key = ctx.isElement() ? 'element' : 'block';
        options[`${key}Ids`] = [id];
      }

      const str = generateUrl(options);
      if (!str) return;

      navigator.clipboard
        .writeText(str)
        .then(() => {
          notify.success({
            title: I18n['Copied link to clipboard'](),
          });
        })
        .catch(console.error);
    },
  };
}
