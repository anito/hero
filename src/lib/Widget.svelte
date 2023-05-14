<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
  import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
  import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
  import SVGTextfield from './SVGTextfield.svelte';
  import { fetchData, hide, use } from './utils';

  gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);

  const categoriesBaseUrl = '/product-categories/';
  const textfields: Set<{ id: string; element: SVGGElement }> = new Set();
  
  let ajaxurl: string;
  let svg;
  let lightLogogroup;
  let lightLogogroups;
  let theBackground;
  
  $: categories = fetchData('wbp_product_categories').then((res) => res.cats);
  // $: content = fetchData('wbp_remote');

  onMount(() => {
    ajaxurl = globalThis.ajaxurl;

    theBackground = document.getElementById('the-background');
    lightLogogroup = document.getElementById('use-light-logo-group');
    lightLogogroups = document.querySelectorAll('.light-logo-group');

    window.addEventListener('animation:init', start);
    start();
  });

  function initElements() {
    console.log('init');
    gsap.set('.stroke', { drawSVG: 0, stroke: 'var(--dark-blue)' });
    gsap.set('#the-type', {
      xPercent: -50,
      yPercent: -50
    });
    gsap.set(
      [
        '#use-light-logo-group',
        '#use-light-logo-group-1',
        '#use-light-logo-group-2',
        '#use-light-logo-group-3',
        '#use-light-logo-group-4',
        '#use-light-logo-group-5',
        '#use-light-logo-group-6',
        '#use-light-logo-group-7',
        '#use-light-logo-group-8'
      ],
      {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: '50% 50%'
      }
    );
    MorphSVGPlugin.convertToPath('#circle');
  }

  function start() {
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
        paused: false,
        onStart: () => initElements()
      })
      .to('#the-grind', {
        drawSVG: true,
        ease: 'power2.inout',
        duration: 0.5
      })
      .to('#the-type', {
        drawSVG: true,
        duration: 0.5
      })
      .to(
        '#use-art-grind-masked, #use-art-type-masked',
        {
          opacity: 0,
          duration: 0.5
        },
        'fade'
      )
      .add(() => hide('#use-art-grind-masked, #use-art-type-masked'))
      // .fromTo(
      //   '#use-logo-grind, #use-logo-type',
      //   {
      //     opacity: 0,
      //     fill: 'var(--dark-blue)',
      //     strokeWidth: 0,
      //     xPercent: -50,
      //     yPercent: -50
      //   },
      //   {
      //     opacity: 1,
      //     duration: 0.5
      //   },
      //   'fade'
      // )
      // .fromTo(
      //   '#use-logo-type',
      //   {
      //     opacity: 0,
      //     fill: 'var(--white)',
      //     strokeWidth: 0,
      //     xPercent: -50,
      //     yPercent: -50,
      //   },
      //   {
      //     opacity: 1,
      //     duration: 0.5
      //   },
      //   'fade'
      // )
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
          x: '50%',
          transformOrigin: '50% 50%',
          scaleX: 0
        },
        {
          scaleX: 2,
          ease: 'power3.out',
          duration: 1.5
        }
      )
      .add(() => hide('#use-logo-grind-for-mask, #use-logo-type-for-mask'))
      .add(() => use('.light-logo-group'))
      .add(() => {
        const { x, y } = MotionPathPlugin.convertCoordinates(svg, lightLogogroup, {
          x: -150,
          y: -200
        });

        let i = 0;
        let ph = 0;
        const yStart = 150;
        const yOffset = 90;
        console.log(lightLogogroups);
        lightLogogroups.forEach((group, key) => {
          console.log(group, key);
          gsap.timeline()
            .to(group, {
              scale: .25,
              x: x + 100,
              y: y + yStart + i * yOffset,
              duration: 0.5
            }, ph);
          i++;
          ph += .15
        });
      });
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

<svg
  bind:this={svg}
  out:fly={{ duration: 2000 }}
  style="fill: none; stroke-width: 6;"
  viewBox="-400 -300 800 600"
>
  <use id="use-dark-background" href="#the-background" style="fill: var(--dark-blue);" x="0" />

  <use
    id="use-dark-background-masked"
    href="#the-background"
    mask="url(#background-mask)"
    style="fill: var(--white);"
  />

  <g id="use-light-logo-masked">
    <use href="#the-background" style="fill: var(--dark-blue);" />
    <use href="#the-background" mask="url(#background-mask)" style="fill: var(--white);" />
  </g>

  <g id="use-dark-logo-masked">
    <use href="#the-background" style="fill: var(--white);" />
    <use href="#the-background" mask="url(#background-mask)" style="fill: #ff66eb;" />
  </g>

  <use id="use-logo-grind" href="#the-grind" />
  <use id="use-logo-type" href="#the-type" />

  <use id="use-logo-grind-for-mask" href="#the-grind" />
  <use id="use-logo-type-for-mask" href="#the-type" />

  <use id="use-light-logo-group" class="light-logo-group" href="#the-light-logo-group" />
  <use id="use-light-logo-group-1" class="light-logo-group" href="#the-light-logo-group" />
  <use id="use-light-logo-group-2" class="light-logo-group" href="#the-light-logo-group" />
  <use id="use-light-logo-group-3" class="light-logo-group" href="#the-light-logo-group" />
  <use id="use-light-logo-group-4" class="light-logo-group" href="#the-light-logo-group" />

  <use id="use-dark-logo-group" href="#the-dark-logo-group" />

  <use id="use-art-grind-masked" href="#the-grind" mask="url(#art-logo-border-mask)" />
  <use id="use-art-type-masked" href="#the-type" mask="url(#art-type-mask)" />

  <g class="categories-list categories-list">
    {#await categories then cats}
      {#each cats as cat}
        <SVGTextfield
          text={cat.name}
          id={cat.slug}
          link={categoriesBaseUrl + cat.slug}
          ink="var(--dark-blue)"
          outline="var(--dark-blue)"
          fontSize="1em"
          class="categories-textfield"
        />
      {/each}
    {/await}
  </g>
</svg>

<style>
  [id^='use-'] {
    visibility: hidden;
    pointer-events: none;
  }
  svg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
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
</style>
