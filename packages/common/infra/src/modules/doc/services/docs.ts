import { Service } from '../../../framework';
import { ObjectPool } from '../../../utils';
import type { Doc } from '../entities/doc';
import { DocRecordList } from '../entities/record-list';
import { DocScope } from '../scopes/doc';
import { DocService } from './doc';
import type { DocsStoreService } from './docs-store';

export class DocsService extends Service {
  docRecordList = this.framework.createEntity(DocRecordList);

  pool = new ObjectPool<string, Doc>({
    onDelete(obj) {
      obj.scope.dispose();
    },
  });

  constructor(private readonly store: DocsStoreService) {
    super();
  }

  open(docId: string) {
    const docRecord = this.docRecordList.record$(docId).value;
    if (!docRecord) {
      throw new Error('Doc record not found');
    }
    const blockSuiteDoc = this.store.getBlockSuiteDoc(docId);
    if (!blockSuiteDoc) {
      throw new Error('Doc not found');
    }

    const exists = this.pool.get(docId);
    if (exists) {
      return { doc: exists.obj, release: exists.release };
    }

    const docScope = this.framework.createScope(DocScope, {
      docId,
      blockSuiteDoc,
      record: docRecord,
    });

    const doc = docScope.get(DocService).doc;

    const { obj, release } = this.pool.put(docId, doc);

    return { doc: obj, release };
  }
}
