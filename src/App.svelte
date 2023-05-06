<script lang="ts">
  import { onMount } from 'svelte';
  import Icons from './lib/Icons.svelte';
  import Widget from './lib/Widget.svelte';
  import Hero from './lib/Hero.svelte';

  export let appElement;

  onMount(() => {});

  function clickHandler({ detail }: CustomEvent) {
    const { type, data } = detail;
    console.log(type, 'is', data);
  }
</script>

<Icons />

<Hero on:click:brand={clickHandler} on:click:item {appElement} />

<style lang="scss">
  :root {
    --circle: transparent;
    --white: var(--light);
    --yellow: #eaead4;
    --light: #fafbfb;
    --black: #000000;
    --dark-blue: #014574;
    --light-blue: #2386d3;
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
