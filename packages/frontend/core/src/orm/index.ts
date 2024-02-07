// export const table = <T extends Record<string, Filed>>(name: string, schema: T): TableSchema<T> => {
//   return {};
// };
//
// type TableSchema<T extends Record<string, Filed>> = { [K in keyof T]: K } & {
//   __name: string;
//   __schema: T;
//   __data: Convert<T>;
// }
// type ColumnType = 'string' | 'boolean' | 'json' | 'number';
// const nanoid = () => Math.random().toString(36).slice(2);
//
// class Filed<Type = unknown, Required extends boolean = boolean> {
//   constructor(private readonly ops: {
//     type: ColumnType,
//     required: Required,
//     default?: () => Type,
//   }) {
//   }
//
//   required(): Filed<Type, true> {
//     return new Filed({
//       ...this.ops,
//       required: true,
//     });
//   }
//
//   default(value: () => Type): Filed<Type, Required> {
//     return new Filed({
//       ...this.ops,
//       default: value,
//     });
//   }
// }
//
// type Rule = {
//   field: string
//   operator: string
//   value: string
// }
// export const f = {
//   string: (): Filed<string, false> => {
//     return new Filed({
//       type: 'string',
//       required: false,
//     });
//   },
//   boolean: (): Filed<boolean, false> => {
//     return new Filed({
//       type: 'boolean',
//       required: false,
//     });
//   },
//   number: (): Filed<number, false> => {
//     return new Filed({
//       type: 'number',
//       required: false,
//     });
//   },
//   json: <T>(): Filed<T, false> => {
//     return new Filed({
//       type: 'json',
//       required: false,
//     });
//   },
// };
// type Query<Schema extends Record<string, Filed>> = {
//   where?: (data: Convert<Schema>) => boolean;
//   sort?: (a: Convert<Schema>, b: Convert<Schema>) => number;
// };
// type ManyQuery<Schema extends Record<string, Filed>> = Query<Schema> & {
//   limit?: number;
//   offset?: number;
// };
//
// class DBQuery<T> {
//   value(): T {
//
//   }
//
//   subscribe(callback: (value: T) => void): () => void {
//     return () => {
//     };
//   }
//
//   with<V extends Record<string, Filed>, Name extends string>(from: TableSchema<V>, fieldA: string, fieldB: string, name: Name): DBQuery<Pretty<T & { [K in Name]: Convert<V>[] }>> {
//     return {} as any;
//   }
// }
//
// type ConvertProperty<T extends Filed> = T extends Filed<infer R, infer _> ? R : never;
//
// type ConvertToOptional<T extends Record<string, Filed>> = {
//   [P in keyof T as (T[P] extends Filed<infer _, false> ? P : never)]?: ConvertProperty<T[P]>;
// };
//
// type ConvertToRequired<T extends Record<string, Filed>> = {
//   [P in keyof T as (T[P] extends Filed<infer _, true> ? P : never)]: ConvertProperty<T[P]>;
// };
//
// type Convert<T extends Record<string, Filed>> = Pretty<ConvertToRequired<T> & ConvertToOptional<T>>;
//
// type Pretty<T> = T extends any ? {
//   [P in keyof T]: T[P];
// } : never
//
//
// const db = {
//   findFirst: <Schema extends Record<string, Filed>>(from: TableSchema<Schema>, query: Query<Schema>): DBQuery<Convert<Schema>> => {
//   },
//   findMany: <Schema extends Record<string, Filed>>(from: TableSchema<Schema>, query: ManyQuery<Schema>): DBQuery<Convert<Schema>[]> => {
//   },
//   create: <Schema extends Record<string, Filed>>(from: TableSchema<Schema>, value: Convert<Schema>) => {
//   },
//   update: <Schema extends Record<string, Filed>>(from: TableSchema<Schema>, where: (data: Convert<Schema>) => boolean, value: (old: Convert<Schema>) => Partial<Convert<Schema>>) => {
//   },
//   delete: <Schema extends Record<string, Filed>>(from: TableSchema<Schema>, where: (data: Convert<Schema>) => boolean) => {
//   },
// };
//
// const workspaceTable = table('workspace', {
//   id: f.string().required().default(nanoid),
//   name: f.string().required(),
// });
// const pageTable = table('page', {
//   id: f.string().required().default(nanoid),
//   title: f.string().required(),
//   favorite: f.boolean().required().default(() => false),
//   workspaceId: f.string().required(),
// });
//
// const collectionTable = table('collection', {
//   id: f.string().required().default(nanoid),
//   title: f.string().required(),
//   workspaceId: f.string().required(),
//   rules: f.json<Rule[]>().required().default(() => []),
// });
//
// const xxxWorkspaceQuery = db.findFirst(workspaceTable, {
//   where: (workspace) => workspace.id === 'xxx',
// });
//
// const xxxWorkspace = xxxWorkspaceQuery.value();
//
// const xxxWorkspaceUnsub = xxxWorkspaceQuery.subscribe((workspace) => {
//   console.log(workspace);
// });
//
// const xxxPagesQuery = db.findMany(pageTable, {
//   where: (page) => page.workspaceId === xxxWorkspace.id,
//   sort: (a, b) => a.title.localeCompare(b.title),
//   limit: 10,
//   offset: 0,
// });
//
// const xxxPages = xxxPagesQuery.value();
//
// const xxxPagesUnsub = xxxPagesQuery.subscribe((pages) => {
//   console.log(pages);
// });
//
// const xxxWorkspaceWithPagesQuery = xxxWorkspaceQuery.with(pageTable, workspaceTable.id, pageTable.workspaceId, 'pages');
// const xxxWorkspaceWithPages = xxxWorkspaceWithPagesQuery.value();
// xxxWorkspaceWithPages.pages[0].title;
//
//
//
export const a = 123;
