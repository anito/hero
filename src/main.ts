import './app.scss';
import App from './App.svelte';
import { app_url } from './lib/utils';

const appElement = document.getElementById('app');
const app = new App({
  target: appElement,
  props: {
    appElement
  }
});

export default app;
