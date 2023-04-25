import { writable } from 'svelte/store';
import type { Section } from '../types';

function createStore() {
  const { update, subscribe, set } = writable([] as Section[]);

  const findIndex = (item: Section, items: Section[]) => items.findIndex((itm => itm.id == item.id))
  return {
    update: (values: Section[]) => update(() => values),
    put: (item: Section) => update((items) => {
      const i = findIndex(item, items);
      if (i != -1) {
        return [...items.slice(0, i), { ...items[i], ...item }, ...items.slice(i + 1)];
      } else {
        return [...items, item];
      }
    }),
    subscribe,
    set
  };
}

export default createStore();
