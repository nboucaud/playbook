import React from 'react';
import { AddIcon } from '@blocksuite/icons';
import { StyledModalFooterContent } from './style';
import { useEditor } from '@/providers/editor-provider';
import { useModal } from '@/providers/global-modal-provider';

export const Footer = (props: { query: string }) => {
  const { createPage, openPage } = useEditor();
  const { triggerQuickSearchModal } = useModal();
  const query = props.query;

  return (
    <StyledModalFooterContent
      onClick={async () => {
        const page = await createPage({ title: query });
        openPage(page.id);

        triggerQuickSearchModal();
      }}
    >
      <AddIcon />
      {query ? (
        <span>New &quot;{query}&quot; page</span>
      ) : (
        <span>New page</span>
      )}
    </StyledModalFooterContent>
  );
};
