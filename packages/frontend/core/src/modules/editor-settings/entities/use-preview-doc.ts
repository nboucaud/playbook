import { AffineSchemas } from '@blocksuite/blocks';
import { type Doc, DocCollection, Schema } from '@blocksuite/store';
import { useEffect, useState } from 'react';

export const usePreviewDoc = () => {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [docCollection, setDocCollection] = useState<DocCollection | null>(
    null
  );

  useEffect(() => {
    const schema = new Schema().register(AffineSchemas);
    const docCollection = new DocCollection({ schema });
    const doc = docCollection.createDoc();
    doc.load();
    const pageBlockId = doc.addBlock('affine:page', {});
    doc.addBlock('affine:surface', {}, pageBlockId);

    setDoc(doc);
    setDocCollection(docCollection);
    return () => doc.remove();
  }, []);

  return { doc, docCollection };
};
