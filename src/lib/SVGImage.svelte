<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import loadedBrands from './stores/loadedBrandsStore';

  export let index;
  export let opacity: 'random' | number = 1;
  export let useFx = false;

  const dispatch = createEventDispatcher();
  const r = Math.random() * 10 + 15

  let useUrl: string;
  let pendingDeactivation = false;
  let active = false;
  let bgEl: SVGGElement;
  let wrapperEl: SVGGElement;
  let elementId = `circle-${index}`;
  let activationTimeoutId;
  let paused = false;

  $: or = r + 2;
  $: size = r * 2;
  $: brand = $loadedBrands[index];
  $: url = brand?.image_url;
  $: useFx ? fxOut() : url === useUrl;
  $: useFx ? fxIn(url) : (useUrl = url);
  $: opc = opacity === 'random' ? getRandomOpacity() : opacity;

  onMount(() => {});

  function fxIn(url: string) {
    delayedActivation({ url, delay: { max: 3000 } });
  }

  function fxOut() {
    if (!pendingDeactivation && active) {
      pendingDeactivation = true;
      delayedActivation({ delay: { min: 10000 } });
    }
  }

  function delayedActivation(options?: { url?: string; delay?: { min?: number; max?: number } }) {
    const { delay, url } = options;
    let { min, max } = { min: 1000, max: 0, ...delay };

    if (max) min = 0;

    activationTimeoutId = setTimeout(() => {
      if (paused) return;

      if (url) {
        useUrl = url;
        active = true;
      } else {
        active = false;
      }
      !active && (pendingDeactivation = false);
    }, Math.random() * max + min);
  }

  function getRandomOpacity() {
    const rnd = Math.random() + 0.1;
    return rnd > 0.4 ? 0.4 : rnd;
  }

  function clickHandler(detail) {
    dispatch('click:brand', detail);
  }

  function mouseenterHandler(detail) {
    pause(true);
    dispatch('mouseenter:brand', detail);
  }

  function mouseleaveHandler(detail) {
    pause(false);
    dispatch('mouseleave:brand', detail);
  }

  function pause(b) {
    if (!b) pendingDeactivation = false;
    else clearTimeout(activationTimeoutId);
    paused = b;
  }
</script>

{#if active}
  <g
    on:click|stopPropagation={() => clickHandler({ type: 'brand', data: brand?.slug })}
    on:mouseenter={() => mouseenterHandler({ type: 'brand', data: brand?.id })}
    on:mouseleave={() => mouseleaveHandler({ type: 'brand', data: brand?.id })}
    on:keydown
    bind:this={wrapperEl}
    class="image-wrapper"
    out:scale={{ duration: 500 }}
    in:scale={{ duration: 1000, delay: 500, easing: elasticOut }}
    style:--opacity={opc}
  >
    <g class="bg-wrapper" bind:this={bgEl} id={elementId}>
      <circle class="outer" cx="0" cy="0" fill="none" r={or} />
      <circle class="inner" cx="0" cy="0" fill="#fff" {r} />
    </g>
    <image
      id="image-{elementId}"
      href={useUrl}
      mask="url(#{elementId}-mask)"
      x={-r}
      y={-r}
      width={size}
      height={size}
    />
  </g>
{/if}

<svg>
  <symbol>
    <defs>
      <mask id="{elementId}-mask">
        <use href="#{elementId}" style="fill: #fff;" />
      </mask>
    </defs>
  </symbol>
</svg>

<style>
  .image-wrapper {
    opacity: var(--opacity);
    transition: all 0.3s ease-out;
  }
  .image-wrapper:hover {
    cursor: pointer;
  }
  .image-wrapper .outer,
  .image-wrapper .inner {
    stroke: #fff;
    stroke-width: 1;
    transition: all 0.2s ease-in-out;
  }
  .image-wrapper .inner {
    stroke-width: 0;
  }
  .image-wrapper:hover .inner {
    stroke-width: 12;
  }
</style>
