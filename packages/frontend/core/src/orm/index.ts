import { map, Observable, of, switchMap } from 'rxjs';
import type { Array as YArray } from 'yjs';
import { Doc } from 'yjs';
import { Map as YMap } from 'yjs';

export const table = <T extends Record<string, Filed>>(
  name: string,
  schema: T
): TableSchema<T> => {
  return {
    __name: name,
    __schema: schema,
    // type
    __data: {} as Convert<T>,
  };
};

type TableSchema<T extends Record<string, Filed>> = {
  __name: string;
  __schema: T;
  __data: Convert<T>;
};
type ColumnType = 'string' | 'boolean' | 'json' | 'number';
const nanoid = () => Math.random().toString(36).slice(2);

class Filed<Type = unknown, Required extends boolean = boolean> {
  constructor(
    private readonly ops: {
      type: ColumnType;
      required: Required;
      default?: () => Type;
    }
  ) {}

  required(): Filed<Type, true> {
    return new Filed({
      ...this.ops,
      required: true,
    });
  }

  default(value: () => Type): Filed<Type, Required> {
    return new Filed({
      ...this.ops,
      default: value,
    });
  }
}

type Rule = {
  field: string;
  operator: string;
  value: string;
};
export const f = {
  string: (): Filed<string, false> => {
    return new Filed({
      type: 'string',
      required: false,
    });
  },
  boolean: (): Filed<boolean, false> => {
    return new Filed({
      type: 'boolean',
      required: false,
    });
  },
  number: (): Filed<number, false> => {
    return new Filed({
      type: 'number',
      required: false,
    });
  },
  json: <T>(): Filed<T, false> => {
    return new Filed({
      type: 'json',
      required: false,
    });
  },
};
type Where<Schema extends Record<string, Filed>> = Partial<Convert<Schema>>;

type ConvertProperty<T extends Filed> = T extends Filed<infer R, infer _>
  ? R
  : never;

type ConvertToOptional<T extends Record<string, Filed>> = {
  [P in keyof T as T[P] extends Filed<infer _, false>
    ? P
    : never]?: ConvertProperty<T[P]>;
};

type ConvertToRequired<T extends Record<string, Filed>> = {
  [P in keyof T as T[P] extends Filed<infer _, true>
    ? P
    : never]: ConvertProperty<T[P]>;
};

type Convert<T extends Record<string, Filed>> = Pretty<
  ConvertToRequired<T> & ConvertToOptional<T>
>;

type Pretty<T> = T extends any
  ? {
      [P in keyof T]: T[P];
    }
  : never;

const collectionTable = table('collection', {
  id: f.string().required().default(nanoid),
  title: f.string().required(),
  workspaceId: f.string().required(),
  rules: f
    .json<Rule[]>()
    .required()
    .default(() => []),
});
const createDB = (yjs: Doc) => {
  const find = (arr: YArray<YMap<unknown>>, where: [string, unknown][]) => {
    for (const item of arr) {
      const isMatch = where.every(([key, value]) => {
        return item.get(key) === value;
      });
      if (isMatch) {
        return item;
      }
    }
    return;
  };
  const filter = (arr: YArray<YMap<unknown>>, where: [string, unknown][]) => {
    const result = [];
    for (const item of arr) {
      const isMatch = where.every(([key, value]) => {
        return item.get(key) === value;
      });
      if (isMatch) {
        result.push(item);
      }
    }
    return result;
  };
  const toObject = <T>(map: YMap<unknown>): T => {
    return Object.fromEntries(map.entries()) as T;
  };
  const db = {
    findFirst: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      where: Where<Schema>
    ): Convert<Schema> | undefined => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      const whereEntries = Object.entries(where);
      const item = find(arr, whereEntries);
      return item ? toObject<Convert<Schema>>(item) : undefined;
    },
    findList: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      where: Where<Schema>
    ): Convert<Schema>[] => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      const whereEntries = Object.entries(where);
      const items = filter(arr, whereEntries);
      return items.map(toObject<Convert<Schema>>);
    },
    observeFirst: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      where: Where<Schema>
    ): Observable<Convert<Schema> | undefined> => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      const whereEntries = Object.entries(where);
      return new Observable(subscriber => {
        const listener = () => {
          const item = find(arr, whereEntries);
          subscriber.next(item ? toObject<Convert<Schema>>(item) : undefined);
        };
        arr.observe(listener);
        return () => {
          arr.unobserve(listener);
        };
      });
    },
    observeList: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      where: Where<Schema>
    ): Observable<Convert<Schema>[]> => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      const whereEntries = Object.entries(where);
      return new Observable(subscriber => {
        const listener = () => {
          const items = filter(arr, whereEntries);
          subscriber.next(items.map(toObject<Convert<Schema>>));
        };
        arr.observe(listener);
        return () => {
          arr.unobserve(listener);
        };
      });
    },
    create: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      value: Convert<Schema>
    ) => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      arr.insert(0, [new YMap<unknown>(Object.entries(value))]);
    },
    update: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      where: Where<Schema>,
      value: (old: Convert<Schema>) => Partial<Convert<Schema>>
    ) => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      const whereKeys = Object.entries(where);
      const item = find(arr, whereKeys);
      if (item) {
        const newValue = value(item.toJSON() as Convert<Schema>);
        Object.entries(newValue).forEach(([key, value]) => {
          item.set(key, value);
        });
      }
    },
    delete: <Schema extends Record<string, Filed>>(
      from: TableSchema<Schema>,
      where: Where<Schema>
    ) => {
      const arr = yjs.getArray(from.__name) as YArray<YMap<unknown>>;
      const whereKeys = Object.entries(where);
      const findIndex = (arr: YArray<YMap<unknown>>) => {
        for (let i = 0; i < arr.length; i++) {
          const item = arr.get(i);
          const isMatch = whereKeys.every(([key, value]) => {
            return item.get(key) === value;
          });
          if (isMatch) {
            return i;
          }
        }
        return -1;
      };
      const index = findIndex(arr);
      if (index !== -1) {
        arr.delete(index, 1);
      }
    },
  };
  return db;
};
const doc = new Doc();
const db = createDB(doc);

const workspaceTable = table('workspace', {
  id: f.string().required().default(nanoid),
  name: f.string().required(),
});

const pageTable = table('page', {
  id: f.string().required().default(nanoid),
  title: f.string().required(),
  favorite: f
    .boolean()
    .required()
    .default(() => false),
  workspaceId: f.string().required(),
});

const xxxWorkspaceObservable = db.observeFirst(workspaceTable, {
  id: 'xxx',
});

xxxWorkspaceObservable
  .pipe(
    switchMap(xxxWorkspace =>
      xxxWorkspace
        ? db
            .observeList(pageTable, {
              workspaceId: xxxWorkspace.id,
            })
            .pipe(map(pages => ({ ...xxxWorkspace, pages })))
        : of(undefined)
    )
  )
  .subscribe(workspace => {
    console.log(workspace);
  });

// const xxxWorkspaceUnsub = xxxWorkspaceObservable.subscribe((workspace) => {
//   console.log(workspace);
// });
// const xxxPages = db.observeList(pageTable, {
//   workspaceId: 'xxx',
// });

db.create(workspaceTable, {
  id: 'xxx',
  name: 'first workspace',
});
db.create(pageTable, {
  id: '1',
  title: 'first page',
  workspaceId: 'xxx',
  favorite: false,
});
db.create(collectionTable, {
  id: '1',
  title: 'first collection',
  workspaceId: 'xxx',
  rules: [],
});
console.log(doc.toJSON());
