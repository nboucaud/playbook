import {
  gqlFetcherFactory,
  GraphQLError,
  type GraphQLQuery,
  type QueryOptions,
  type QueryResponse,
} from '@affine/graphql';
import type { AuthenticationManager } from '@toeverything/infra/auth';

import type { AffineCloudFetcher } from '../fetcher';

export function getBaseUrl(): string {
  if (environment.isDesktop) {
    return runtimeConfig.serverUrlPrefix;
  }
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

export const fetcher = gqlFetcherFactory(getBaseUrl() + '/graphql');

export class AffineCloudGraphQL {
  constructor(
    private readonly fetcher: AffineCloudFetcher,
    private readonly auth: AuthenticationManager
  ) {}

  private readonly rawGqlFetch = gqlFetcherFactory('/graphql', (input, init) =>
    this.fetcher.fetch(input, { traceEvent: 'GraphQLRequest', ...init })
  );

  async gqlFetch<Query extends GraphQLQuery>(
    options: QueryOptions<Query>
  ): Promise<QueryResponse<Query>> {
    try {
      return await this.rawGqlFetch(options);
    } catch (err) {
      if (err instanceof Array) {
        for (const error of err) {
          if (error instanceof GraphQLError && error.extensions?.code === 403) {
            this.auth.revalidateSession('affine-cloud');
          }
        }
      }
      throw err;
    }
  }
}
