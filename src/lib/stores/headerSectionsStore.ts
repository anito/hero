import { writable } from 'svelte/store';
import type { HeaderSection } from '../types';

function createStore() {
  const { update, subscribe, set } = writable([] as HeaderSection[]);

  const findIndex = (item: HeaderSection, items: HeaderSection[]) => items.findIndex((itm => itm.id == item.id))
  return {
    update: (values: HeaderSection[]) => update(() => values),
    put: (item: HeaderSection) =>
      update((items) => {
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
