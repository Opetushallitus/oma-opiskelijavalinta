export type AuthMethod = 'cas' | 'link';

export type AuthState =
  | { status: 'unknown' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; method: AuthMethod }
  | { status: 'loggedOut' };

export type AuthEvent =
  | { type: 'SESSION_OK'; method: AuthMethod }
  | { type: 'SESSION_401' }
  | { type: 'LOGOUT' };

export type SessionResponse = {
  authMethod: AuthMethod;
};
