import { GameMessage } from './types';

export function m(key: string, params?: GameMessage['params']): GameMessage {
  return params ? { key, params } : { key };
}
