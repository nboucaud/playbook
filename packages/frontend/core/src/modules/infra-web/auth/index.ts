import { DebugLogger } from '@affine/debug';
import type {
  AuthenticationProvider,
  AuthenticationSession,
} from '@toeverything/infra/auth';
import { LiveData } from '@toeverything/infra/livedata';
import type { GlobalState } from '@toeverything/infra/storage';
import { catchError, EMPTY, exhaustMap, from, Subject } from 'rxjs';

const logger = new DebugLogger('affine-cloud-auth');

export interface AffineCloudAuthenticationSession
  extends AuthenticationSession {
  expires: number;
}

export class AffineCloudAuthenticationProvider
  implements AuthenticationProvider
{
  id = 'affine-cloud' as const;
  session: LiveData<
    | { status: 'unauthenticated' }
    | { status: 'authenticated'; session: AuthenticationSession }
  > = LiveData.from(
    this.globalState.watch<AffineCloudAuthenticationSession>(
      'affine-cloud-auth'
    ),
    null
  ).map(session =>
    session
      ? {
          status: 'authenticated',
          session: session as AuthenticationSession,
        }
      : {
          status: 'unauthenticated',
        }
  );

  constructor(private readonly globalState: GlobalState) {
    this.revalidateSession();
  }

  revalidateSession() {
    this.revalidateRequest.next();
  }

  private readonly revalidateRequest = new Subject<void>();
  // @ts-expect-error never used
  private readonly revalidating = this.revalidateRequest
    .pipe(
      exhaustMap(() =>
        from(this.getSession()).pipe(
          catchError(err => {
            logger.warn('Failed to revalidate session, ' + err);
            return EMPTY;
          })
        )
      )
    )
    .subscribe(session => {
      this.saveSession(session);
    });

  private async getSession(): Promise<AffineCloudAuthenticationSession | null> {
    const session = await getSession();

    if (session) {
      const account = {
        id: session.user.id,
        email: session.user.email,
        label: session.user.name,
        avatar: session.user.image,
      };
      const result = {
        account,
        expires: Date.parse(session.expires),
      };
      return result;
    } else {
      return null;
    }
  }

  private saveSession(session: AffineCloudAuthenticationSession | null) {
    this.globalState.set<AffineCloudAuthenticationSession>(
      'affine-cloud-auth',
      session
    );
  }
}

function getBaseUrl(): string {
  if (environment.isDesktop) {
    return runtimeConfig.serverUrlPrefix;
  }
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

async function getSession() {
  const url = `${getBaseUrl()}/api/auth/session`;
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok)
    throw new Error('Get session fetch error: ' + JSON.stringify(data));
  return Object.keys(data).length > 0 ? data : null; // Return null if data empty
}
