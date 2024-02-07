import { combineLatest } from 'rxjs';

import { createIdentifier } from '../di';
import { LiveData } from '../livedata';
import type { AuthenticationProviderId } from './types';

export interface AuthenticationSession {
  account: AuthenticationAccountInformation;
}

export interface AuthenticationAccountInformation {
  id: string;
  label: string;
  email?: string;
  avatar?: string | null;
}

export interface AuthenticationProvider {
  /**
   * provider unique id
   */
  id: AuthenticationProviderId;

  /**
   * current authentication session
   */
  session: LiveData<
    | { status: 'unauthenticated' }
    | { status: 'authenticated'; session: AuthenticationSession }
  >;

  /**
   * try revalidate current session
   */
  revalidateSession(): void;
}

export const AuthenticationProvider = createIdentifier<AuthenticationProvider>(
  'AuthenticationProvider'
);

export class AuthenticationManager {
  readonly authenticationProviders: Map<
    AuthenticationProviderId,
    AuthenticationProvider
  > = new Map();

  constructor(providers: AuthenticationProvider[]) {
    for (const provider of providers) {
      this.authenticationProviders.set(provider.id, provider);
    }
    this.sessions = LiveData.from(
      combineLatest(
        [...this.authenticationProviders.values()].map(provider =>
          provider.session.map(v => ({ id: provider.id, session: v }))
        )
      ),
      []
    );
  }

  sessions: LiveData<
    {
      id: AuthenticationProviderId;
      session:
        | {
            status: 'unauthenticated';
          }
        | {
            status: 'authenticated';
            session: AuthenticationSession;
          };
    }[]
  >;

  session(id: AuthenticationProviderId) {
    return this.sessions.map(s => {
      console.log(s);
      const session = s.find(x => x.id === id);
      return session?.session;
    });
  }

  revalidateSession(id: AuthenticationProviderId) {
    const provider = this.authenticationProviders.get(id);
    if (provider) {
      provider.revalidateSession();
    }
  }
}
