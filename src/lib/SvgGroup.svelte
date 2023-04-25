<!--
-----------------------------------------------
	svg icon
	- https://github.com/jacobmischka/svelte-feather-icon
	- https://feathericons.com/
-----------------------------------------------
-->
<script lang="ts">
  import { fly } from 'svelte/transition';

  export let name: string = '';
  export let fillColor = 'none';
  export let strokeWidth = 0;
  export let style = '';
  export { className as class };

  let className = '';
</script>

{#if name}
  <svg
    out:fly={{ duration: 2000 }}
    class={className}
    style={`fill: ${fillColor}; stroke-width: ${strokeWidth}; ${style}`}
    viewBox="0 0 800 600"
  >
    <use href="#{name}" xlink:href="#{name}" />
  </svg>
{/if}

<style>
  svg {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    -o-object-fit: contain;
    object-fit: contain;
    -webkit-transform-origin: center center;
    transform-origin: center center;
    stroke: currentColor;
    stroke-width: 1px;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: currentColor;
  }
</style>
