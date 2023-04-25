import { writable } from 'svelte/store';
import type { Brand } from '../types';

const reducer = (acc: Brand[], cur: Brand) => {
  !acc.find((item) => item.id === cur.id) && acc.push(cur);
  return acc;
};

function createStore() {
  const { update, subscribe, set } = writable([] as Brand[]);

  return {
    update: (values: Brand[]) => update(() => values.reduce(reducer, [])),
    subscribe,
    set
  };
}

export default createStore();
