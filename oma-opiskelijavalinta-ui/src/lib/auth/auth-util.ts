import type { AuthState } from './auth-types';

export function isLinkUser(state: AuthState) {
  return state.status === 'authenticated' && state.method === 'link';
}
