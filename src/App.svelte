<script lang="ts">
  import { onMount } from 'svelte';
  import Icons from './lib/Icons.svelte';
  import Sections from './lib/Sections.svelte';
  import Hero from './lib/Hero.svelte';
  import { app_url } from './lib/utils';

  onMount(() => {});

  function clickHandler({ detail }: CustomEvent) {
    const { type, data } = detail;
    console.log(type, 'is', data);
  }
</script>

<Icons />

<Sections --background={`url(${app_url}background.jpg)`} --close={`url(${app_url}close.svg`} --circle="transparent">
  <Hero on:click:menu-item={clickHandler} on:click:brand={clickHandler} />
</Sections>

<style lang="scss">
  :root {
    --white: var(--light);
    --light: #fafbfb;
    --black: #000000;
    --dark: #014574;
    --purple: #ff00a6;
    --green: #68fd8b;
    --turkis: #48c2ff;
    --c-origin: #03f1ff;
    --grd1-stop1: rgb(0 255 231);
    --grd1-stop2: rgb(0 135 255);
    --grd2-stop1: rgb(0 71 255);
    --grd2-stop2: rgb(0 241 255);
  }
</style>
