import { nanoid } from 'nanoid';

import {
  generateRandUTF16Chars,
  SPAN_ID_BYTES,
  TRACE_FLAG,
  TRACE_ID_BYTES,
  TRACE_VERSION,
  traceReporter,
} from './trace';

export class Fetcher {
  fetch(url: string, options?: RequestInit): Promise<Response> {
    return fetch(url, options);
  }
}

export function getAffineCloudBaseUrl(): string {
  if (environment.isDesktop) {
    return runtimeConfig.serverUrlPrefix;
  }
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

export class AffineCloudFetcher {
  constructor(private readonly fetcher: Fetcher) {}

  fetch = async (
    input: string,
    init?: RequestInit & {
      // https://github.com/microsoft/TypeScript/issues/54472
      priority?: 'auto' | 'low' | 'high';
    } & {
      traceEvent?: string;
    }
  ): Promise<Response> => {
    const startTime = new Date().toISOString();
    const spanId = generateRandUTF16Chars(SPAN_ID_BYTES);
    const traceId = generateRandUTF16Chars(TRACE_ID_BYTES);
    const traceparent = `${TRACE_VERSION}-${traceId}-${spanId}-${TRACE_FLAG}`;
    init = init || {};
    init.headers = init.headers || new Headers();
    const requestId = nanoid();
    const event = init.traceEvent;
    if (init.headers instanceof Headers) {
      init.headers.append('x-request-id', requestId);
      init.headers.append('traceparent', traceparent);
    } else {
      const headers = init.headers as Record<string, string>;
      headers['x-request-id'] = requestId;
      headers['traceparent'] = traceparent;
    }

    if (!traceReporter) {
      return this.fetcher.fetch(
        new URL(input, getAffineCloudBaseUrl()).href,
        init
      );
    }

    try {
      const response = await this.fetcher.fetch(input, init);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      traceReporter!.cacheTrace(traceId, spanId, startTime, {
        requestId,
        ...(event ? { event } : {}),
      });
      return response;
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      traceReporter!.uploadTrace(traceId, spanId, startTime, {
        requestId,
        ...(event ? { event } : {}),
      });
      throw err;
    }
  };
}
