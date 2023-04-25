import { writable } from 'svelte/store';
import type { Brand } from '../types';

function createStore() {
  const { update, subscribe, set } = writable([] as Brand[]);

  return {
    update: (values: Brand[]) => update(() => values),
    subscribe,
    set
  };
}

export default createStore();
