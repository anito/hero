import { gsap } from 'gsap';

export function use(selector: string | string[], params = {}) {
  gsap.set(selector, {
    visibility: 'visible',
    ...params
  });
}

export function hide(selector: string | string[], params = {}) {
  gsap.set(selector, {
    visibility: 'hidden',
    ...params
  });
}

export const app_url = location.host.startsWith('localhost') ? '/' : undefined !== window && globalThis.app_hero.app_url;
export const stylesheet_url = location.host.startsWith('localhost') ? '/' : undefined !== window && globalThis.app_hero.stylesheet_url;

export async function fetchData(action) {
  const url = globalThis.ajaxurl;
  const formdata = new FormData();
  formdata.append('action', action);
  return await fetch(url, {
    method: 'POST',
    body: formdata
  }).then(async (res) => await res.json());
}