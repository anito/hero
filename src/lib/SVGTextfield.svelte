<script lang="ts">
  import { onMount } from 'svelte';

  export let text;
  export let id = '';
  export let link = '';
  export let ink = '#000000';
  export let background = 'white';
  export let outline = 'red';
  export let strokeWidth = 2;
  export let fontSize = '1em';
  export {className as class};

  let className = '';

  onMount(() => {});

</script>

<g class="svg-textfield {className}" fill={ink} data-id={id}
  ><rect
    width="150"
    height="40"
    rx="12"
    ry="12"
    fill={background}
    stroke-width={strokeWidth}
    stroke={outline}
  />
  <text class="svg-text" text-anchor="middle" alignment-baseline="central">
    <tspan stroke-width="0" x="80" dy="26" style="font-size: {fontSize}">
      {#if link}
        <a href={link} target="_self">{@html text}</a>
      {:else}
        {@html text}
      {/if}
    </tspan>
  </text></g
>

<style></style>
