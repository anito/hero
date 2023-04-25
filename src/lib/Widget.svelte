<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
  import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
  import SVGTextfield from './SVGTextfield.svelte';
  import { fetchData, hide, use } from './utils';

  gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);

  const categoriesBaseUrl = '/product-categories/';
  const textfields: Set<{ id: string; element: SVGGElement }> = new Set();

  let ajaxurl: string;
  let is_active_categories = false;
  let wrapperEl;

  $: categories = fetchData('wbp_product_categories').then((res) => res.cats);
  // $: content = fetchData('wbp_remote');

  onMount(() => {
    init();
    ajaxurl = globalThis.ajaxurl;
    window.addEventListener('animation:init', start);
  });

  function init() {
    initElements();
    start();
  }

  function initElements() {
    gsap.set('.stroke', { drawSVG: 0, stroke: 'var(--dark)' });
    MorphSVGPlugin.convertToPath('#circle');
  }

  function start() {
    use('#use-grind, #use-type', { opacity: 0 });
    use('#use-art-type-masked, #use-art-grind-masked', {
      strokeWidth: 30,
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%'
    });

    gsap
      .timeline({
        defaults: { ease: 'none' },
        repeat: 0,
        repeatDelay: 2,
        paused: false
      })
      .to('#the-grind', {
        drawSVG: true,
        ease: 'power2.inout',
        duration: 1.3
      })
      .fromTo(
        '#the-type',
        {
          xPercent: -50,
          yPercent: -50
        },
        {
          drawSVG: true,
          ease: 'power2.inout',
          duration: 1
        }
      )
      .to('#use-art-grind-masked, #use-art-type-masked', {
        opacity: 0,
        duration: 0.3
      })
      .add(() => hide('#use-art-grind-masked, #use-art-type-masked'))
      .add(() => use('#use-logo-grind, #use-logo-type'))
      .fromTo(
        '#use-logo-grind',
        {
          fill: 'var(--dark)',
          strokeWidth: 0,
          xPercent: -50,
          yPercent: -50
        },
        {
          opacity: 1,
          duration: 0.3
        },
        '<'
      )
      .fromTo(
        '#use-logo-type',
        {
          fill: 'var(--white)',
          strokeWidth: 0,
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          scale: 1.5
        },
        {
          opacity: 1,
          scale: 1,
          ease: 'elastic.out(1, 0.35)',
          duration: 0.5
        },
        '<+=.5'
      )
      .add(() => {
        use('#use-dark-background, #use-dark-background-masked', {
          strokeWidth: 0
        });
        use('#use-logo-grind-for-mask, #use-logo-type-for-mask', {
          strokeWidth: 0,
          xPercent: -50,
          yPercent: -50
        });
      })
      .fromTo(
        '#the-background',
        {
          xPercent: -50,
          yPercent: -50
        },
        {
          x: '1600px',
          ease: 'ease.in',
          duration: 1.5
        }
      )
      .add(() => gsap.set('.categories-list', {
        x: -400,
        y: -300,
      }))
      // .add(placeCategories);
  }

  function placeCategories() {
    is_active_categories = true;
    const textfieldEls = wrapperEl.querySelectorAll('.categories-textfield');
    textfieldEls.forEach((element: SVGGElement) => {
      textfields.add({ id: element.dataset.id, element });
    });
    animateTextfields();
  }

  function getMatrixPosition(i, cols = 3) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { col, row };
  }

  function animateTextfields() {
    const cats = [];
    Array.from(textfields)
      .map((item) => item.element)
      .forEach((el, i) => {
        const { width, height } = el.getBoundingClientRect();
        const { col, row } = getMatrixPosition(i, 4);
        const x = (width - 6) * col + 10;
        const y = height * row + 10;
        cats.push(el);

        gsap.timeline().to(el, {
          x,
          y,
          duration: 0.03
        });
      });
  }
</script>

<div
  class="wrapper"
  bind:this={wrapperEl}
  on:click|preventDefault={start}
  on:keydown
  class:is_active_categories
>
  <svg
    out:fly={{ duration: 2000 }}
    style="fill: none; stroke-width: 6;"
    viewBox="-400 -300 800 600"
  >
    <g id="use-light-logo-masked">
      <use href="#the-background" style="fill: var(--dark);" />
      <use href="#the-background" mask="url(#background-mask)" style="fill: var(--white);" />
    </g>

    <g id="use-dark-logo-masked">
      <use href="#the-background" style="fill: var(--white);" />
      <use href="#the-background" mask="url(#background-mask)" style="fill: #ff66eb;" />
    </g>

    <use id="use-grind" href="#the-grind" />
    <use id="use-type" href="#the-type" />

    <use id="use-logo-grind" href="#the-grind" />
    <use id="use-logo-type" href="#the-type" />

    <use id="use-logo-grind-for-mask" href="#the-grind" />
    <use id="use-logo-type-for-mask" href="#the-type" />

    <use id="use-art-grind-masked" href="#the-grind" mask="url(#art-logo-border-mask)" />
    <use id="use-art-type-masked" href="#the-type" mask="url(#art-type-mask)" />

    <use id="use-dark-background" href="#the-background" style="fill: var(--dark);" />
    <use
      id="use-dark-background-masked"
      href="#the-background"
      mask="url(#background-mask)"
      style="fill: var(--white);"
    />


    <g class="categories-list categories-list">
      {#await categories then cats}
        {#each cats as cat}
          <SVGTextfield
            text={cat.name}
            id={cat.slug}
            link={categoriesBaseUrl + cat.slug}
            ink="var(--dark)"
            outline="var(--dark)"
            fontSize="1em"
            class="categories-textfield"
          />
        {/each}
      {/await}
    </g>
  </svg>
</div>

<style>
  [id^='use-'] {
    visibility: hidden;
    pointer-events: none;
  }
  .wrapper {
    display: flex;
    height: 100%;
  }
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
  .categories-list {
    display: none;
  }
  .is_active_categories .categories-list {
    display: inline-block;
    visibility: visible;
  }
</style>
