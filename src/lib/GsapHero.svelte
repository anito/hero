<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
  import { SplitText } from 'gsap/SplitText';
  import { fetchData, app_url } from './utils';
  import brands from './stores/brandsStore';
  import loadedBrands from './stores/loadedBrandsStore';
  import sections from './stores/sectionsStore';
  import sectionDict from './sectionsDict.json';
  import labelPosition from './labelPosition.json';
  import SvgImage from './SVGImage.svelte';
  import type { Brand, Section } from './types';

  gsap.registerPlugin(MotionPathPlugin, SplitText);

  sections.update(sectionDict);

  const dispatch = createEventDispatcher();
  const brandsCount = 5;
  const loadBrandsInterval = 15000;
  const CLOSED = 'closed';
  const DEFAULT = 'default';
  const OPEN = 'open';
  const EXTENDED = 'extended';
  const trackLib = {
    closed: 'M0,-1 0,0',
    default: 'M0,-1 170,0',
    open: 'M0,-1 250,0',
    extended: 'M0,-1 750,0'
  };
  const menuDict = [CLOSED, DEFAULT, OPEN, EXTENDED];
  const converted = new Map() as Map<
    SVGPathElement,
    {
      menuItem3d: SVGGElement;
      image: SVGImageElement;
      bg: SVGCircleElement;
      point?: { x: number; y: number };
    }
  >;

  let i = 0;
  let app: HTMLElement;
  let main1: Element;
  let m1_cGroup: SVGGElement[];
  let tracks: SVGPathElement[];
  let menuItems3d: SVGGElement[];
  let menuItems: SVGGElement[];
  let splitTextTimeoutId;
  let timeoutId;
  let navmodeId;
  let width;
  let height;
  let left;
  let top;
  let intervalId;
  let menuTl;
  let textTl;
  let brandTl;

  const now = () => new Date().getTime();
  const elapsed = (label = '') => {
    // console.log(label, Number.parseFloat(((now() - _t) / 1000).toString()).toFixed(2));
  };

  $: _t = now();
  $: activeDisplayMode = menuDict[i % menuDict.length];
  $: d = trackLib[activeDisplayMode];
  $: cx = width / 2;
  $: cy = height / 2;
  $: $brands.length && loadBrandImages();

  onMount(async () => {
    elapsed('onMount');
    app = document.getElementById('app');
    window.addEventListener('resize', resize);
    main1 = document.getElementById('main1');
    main1.addEventListener('mousemove', mousemoveHandler);
    main1.addEventListener('click', clickStageHandler);

    m1_cGroup = document.querySelectorAll('.m1_cGroup') as unknown as SVGGElement[];
    tracks = gsap.utils.toArray('.track') as unknown as SVGPathElement[];
    menuItems = gsap.utils.toArray('.menu-item') as unknown as SVGGElement[];
    menuItems3d = gsap.utils.toArray('.menu-item-3d') as unknown as SVGGElement[];

    MotionPathPlugin.convertToPath('.c1_line');
    initImages();
    initSections();
    resize();
    start();
    menuTl.play().then(() => playMode(1));

    // don't await
    fetchData('wbp_brands').then((res) => ($brands = res.brands));
  });

  function resize() {
    ({ width, height, left, top } = main1.getBoundingClientRect());
    gsap.set('#stage', { x: '0%', y: '0%' });

    // Split text again on resize
    clearTimeout(splitTextTimeoutId);
    splitTextTimeoutId = setTimeout(() => {
      $sections.forEach((section) => {
        splitText(section);
      });
    }, 10);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(animateHeader, 1000);
  }

  function initImages() {
    const images = gsap.utils.toArray('.menu-item-image');
    const onload = function () {
      gsap.set(this, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: '50% 50%'
      });
    };
    images.forEach((image: SVGImageElement) => (image.onload = onload));
  }

  async function loadBrandImages() {
    clearInterval(intervalId);

    const randomBrands: Brand[] = [];
    const getRandom = () => $brands[Math.floor(Math.random() * $brands.length)];

    while (randomBrands.length < brandsCount) {
      randomBrands.push(getRandom());
    }

    const _loadedBrands: Brand[] = [];
    const onload = (e) => {
      const target = e.target as unknown as HTMLImageElement;
      _loadedBrands.push(randomBrands.find((brand) => brand.image_url === target.src));
      if (_loadedBrands.length === randomBrands.length) {
        loadedBrands.update(_loadedBrands);
        intervalId = setInterval(loadBrandImages, loadBrandsInterval);
      }
    };

    randomBrands.forEach((url) => {
      const img = new Image();
      img.onload = onload;
      img.src = url.image_url;
    });
  }

  async function playMode(index?: number) {
    const nextIndex = index !== undefined ? index : i + 1;
    if (i === nextIndex) return;

    i = nextIndex;
    await tick();

    return _play().then((tl) => tl);
  }

  async function _setDisplayMode(mode = activeDisplayMode) {
    const data = trackLib[mode];
    await _setTrack(data);
  }

  async function _play(mode?: string) {
    const m = mode || activeDisplayMode;
    await _setDisplayMode(m);
    return menuTl?.play('display-mode').then((tl) => tl);
  }

  async function _setTrack(d) {
    tracks.forEach((track) => {
      gsap.to(track, {
        attr: { d },
        onUpdate: trackOnUpdateHandler,
        duration: 1
      });
    });

    await tick();
  }

  const getLabelPosition = (deg) => labelPosition.find(({ min, max }) => min <= deg && deg <= max);

  function trackOnCompleteRotationHandler() {
    const track = this.targets()[0];
    const rotation = gsap.getProperty(track, 'rotation');
    const parent = track.parentElement as unknown as SVGGElement;
    const label = parent.querySelector('.menu-item-label') as unknown as SVGImageElement;
    const { xPercent, yPercent } = getLabelPosition(rotation);

    gsap.set(label, {
      xPercent,
      yPercent
    });
  }

  function trackOnStartRotationHandler() {
    const track = this.targets()[0] as unknown as SVGPathElement;
    const parent = track.parentElement as unknown as SVGGElement;
    const menuItem3d = parent.querySelector('.menu-item-3d') as unknown as SVGGElement;
    const image = parent.querySelector('image') as unknown as SVGImageElement;
    const bg = parent.querySelector('.menu-item-image-bg') as unknown as SVGCircleElement;
    converted.set(track, { menuItem3d, image, bg });

    const d = track.getAttribute('d');
    const point = d.match(/-?\d+/g).map((p) => parseInt(p));
    const { x, y } = MotionPathPlugin.convertCoordinates(track, menuItem3d, {
      x: point[2],
      y: 0
    });

    gsap.set(menuItem3d, {
      onComplete: () => elapsed('set onrotationstart complete'),
      x: '+=' + x,
      y: '+=' + y
    });
  }

  function trackOnUpdateHandler() {
    const track = this.targets()[0] as unknown as SVGPathElement;
    if (!converted.has(track)) return;

    const { menuItem3d } = converted.get(track);

    const d = track.getAttribute('d');
    const point = d.match(/-?\d+/g).map((p) => parseInt(p));
    const { x, y } = MotionPathPlugin.convertCoordinates(track, menuItem3d, {
      x: point[2],
      y: 0
    });

    gsap.to(menuItem3d, {
      x: '+=' + x,
      y: '+=' + y
    });
  }

  function clickStageHandler(e) {
    wobble();
    gsap.to(menuItems, {
      scale: 1,
    });
    const active = activate();

    inOut('.menu-item-label, .brand', 1);
    navmodeId = null;
    animateHeader();
    setTimeout(() => playMode(1), 1000);
  }

  const activate = (item?: SVGGElement, force?: boolean) => {
    const activeMenus = menuItems3d.filter((itm) =>
      item === itm
        ? 'boolean' === typeof force
          ? itm.classList.toggle('menu-open', force)
          : itm.classList.toggle('menu-open')
        : itm.classList.remove('menu-open'))

    return app.classList.toggle('menu-open', 0 < activeMenus.length);
  };

  function clickSectionHandler(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault()

    const target = e.currentTarget as unknown as SVGGElement;
    const active = activate(target);
    navmodeId = active ? target.dataset.id : null
    gsap.to(menuItems, {
      scale: (i, me: SVGGElement) => (me.parentElement.classList.contains('menu-open') ? 1.25 : 1)
    });
    animateHeader();
    if (active) {
      inOut('.menu-item-label, .brand', 0);
      playMode(2);
      centerStage();
    } else {
      inOut('.menu-item-label, .brand', 1);
      // Wait a bit for the text to fade out
      setTimeout(() => playMode(1), 1000);
    }

    dispatch('click:menu-item', { type: 'menu-item', data: navmodeId });
  }

  function mouseoverHandler(e: MouseEvent) {
    const target = e.target as unknown as HTMLElement;
    const parent = target.closest('.menu-item-3d');
    const image = parent.querySelector('image') as unknown as HTMLElement;
    parent.addEventListener('mouseleave', mouseleaveHandler);
    parent.addEventListener('click', clickSectionHandler);
    gsap.to(image, {
      scale: 1.2
    });
  }

  function mouseleaveHandler(e: MouseEvent) {
    const target = e.target as unknown as HTMLElement;
    const image = target.parentElement.querySelector('image');
    gsap.to(image, {
      scale: 1,
      onComplete: () => target.removeEventListener('mouseleave', mouseleaveHandler)
    });
  }

  function mousemoveHandler(e: MouseEvent) {
    if (app.classList.contains('menu-open')) return;

    const dx = e.clientX - left - cx;
    const dy = e.clientY - top - cy;

    gsap.to('.m1_cGroup', {
      x: (i) => -dx * (i + 1) * 0.008,
      y: (i) => -dy * (i + 1) * 0.008,
      rotation: Math.random() * 0.2,
      duration: 1.5
    });
  }

  function centerStage() {
    gsap.to('.m1_cGroup', {
      x: 0,
      y: 0,
      delay: 1,
      duration: 0.5
    });
  }

  function inOut(selector, opacity: number) {
    gsap.to(selector, {
      opacity
    });
  }

  function wobble() {
    if (gsap.getProperty('.m1_cGroup', 'scale') != 1) return; //prevent overlapping bouncy tweens
    if (app.classList.contains('menu-open')) return;

    for (var i = 0; i < m1_cGroup.length; i++) {
      gsap.fromTo(
        m1_cGroup[i],
        { transformOrigin: '50% 50%', scale: 1 },
        { duration: 0.7 - i * 0.04, scale: 0.9, ease: 'back.in(10)', yoyo: true, repeat: 1 }
      );
    }
  }

  function initSections() {
    for (
      let nodes = document.querySelectorAll('section[data-section]'), i = 0;
      nodes.length > i;
      i++
    ) {
      const sectionEl = nodes[i] as unknown as HTMLElement;
      const id = sectionEl.dataset.section;

      sections.put({
        id,
        element: sectionEl,
        title: sectionEl.querySelector('h1')
      });
    }
  }

  function splitText(section) {
    section.split?.revert();
    section.split = new SplitText(section.title, {
      type: 'chars, lines',
      charsClass: 'charTxt',
      linesClass: 'lineTxt'
    });

    section.lines = [];
    for (var lines = section.split.lines, n = 0; lines.length > n; n++) {
      var i = lines[n].querySelectorAll('.charTxt');
      gsap.set(i, {
        y: '-100%'
      });
      section.lines.push(i);
    }
    section.lines.reverse();
  }

  function animateHeader() {
    textTl?.clear();
    let playhead = 0;

    // Clean up old lines
    $sections.forEach((section) => {
      if (section.active) {
        // Ease out line by line on navigation by adding a new timeline at the beginning of the main timeline
        textTl.add(() => {
          const tl = gsap.timeline({
            defaults: {
              duration: 1
            },
            onStart: () => {
              section.element?.classList.remove('textActive');
              section.element?.classList.add('textNotActive');
            },
            onComplete: () => {
              section.element?.classList.remove('active', 'textNotActive', 't-0', 't-1', 't-2');
              section.active = false;
            }
          });

          section.lines.forEach((line) => {
            tl.to(
              line,
              {
                y: '100%',
                stagger: {
                  each: 0.01,
                  amount: 0.3
                },
                duration: 0.5
              },
              '<+=.1'
            );
          });
        }, 0.1);
      }
    });

    const section = $sections.find((section) => section.id == navmodeId);

    if (section) {
      // pull in new header
      textTl.add(() => {
        // add another timeline
        const tl = gsap.timeline({
          onStart: () => {
            section.element?.classList.add('active');
            section.active = true;
          }
        });
        section.lines.forEach((line) => {
          tl.fromTo(
            line,
            {
              y: '-100%'
            },
            {
              y: '0%',
              stagger: {
                each: 0.03,
                amount: 0.2
              },
              duration: 0.7
            },
            '<+=.1'
          );
        });
        tl.add(() => section.element?.classList.add('textActive'), '>');
      }, playhead + 0.8);
    }
    textTl?.play(0);
  }

  function start() {
    elapsed('start');

    gsap.set(menuItems, {
      transformOrigin: '50% 50%'
    });

    menuTl = gsap
      .timeline({ defaults: { duration: 1 } })
      .from('#main1', { duration: 0.5, autoAlpha: 0, ease: 'power1.inOut' }, 0)
      .fromTo('.m1_cGroup', { opacity: 0 }, { duration: 0.3, opacity: 1, stagger: -0.1 }, 0)
      .from('.m1_cGroup', { duration: 2.5, scale: -0.3, stagger: -0.05, ease: 'elastic' }, 0)
      .pause()
      .add('display-mode')
      .fromTo(
        tracks,
        {
          transformOrigin: '0% 100%',
          onComplete: trackOnStartRotationHandler
        },
        {
          rotate: (i) => (i * 360) / tracks.length,
          stagger: {
            each: 0,
            onUpdate: trackOnUpdateHandler,
            onComplete: trackOnCompleteRotationHandler
          },
          onComplete: () => elapsed('to rotation complete'),
          duration: 0
        },
        0
      )
      .to('#stage', { opacity: 1, duration: 0.5 }, 0)
      .add(() => elapsed('end of timeline'));

    textTl = gsap.timeline({
      paused: true
    });

    brandTl = gsap
      .timeline({ defaults: { duration: 80 } })
      .add('orbs')
      .fromTo(
        '.orb-brand-0',
        { transformOrigin: '50% 50%' },
        {
          motionPath: {
            path: '.c1_line4',
            start: 0.33,
            end: 1.02
          },
          ease: 'none',
          yoyo: true,
          repeat: -1
        },
        'orbs'
      )
      .fromTo(
        '.orb-brand-1',
        { transformOrigin: '50% 50%' },
        {
          motionPath: {
            path: '.c1_line4',
            start: 1.3,
            end: 0.2
          },
          ease: 'none',
          yoyo: true,
          repeat: -1
        },
        'orbs'
      )
      .fromTo(
        '.orb-brand-2',
        { transformOrigin: '50% 50%' },
        {
          motionPath: {
            path: '.c1_line4',
            start: 1.31,
            end: 0.36
          },
          ease: 'none',
          yoyo: true,
          repeat: -1
        },
        'orbs'
      )
      .fromTo(
        '.orb-brand-3',
        { transformOrigin: '50% 50%' },
        {
          motionPath: {
            path: '.c1_line5',
            start: 0.49,
            end: 1.35
          },
          ease: 'none',
          yoyo: true,
          repeat: -1
        },
        'orbs'
      )
      .fromTo(
        '.orb-brand-4',
        { transformOrigin: '50% 50%' },
        {
          motionPath: {
            path: '.c1_line5',
            start: 0.05,
            end: 1.2
          },
          ease: 'none',
          yoyo: true,
          repeat: -1
        },
        'orbs'
      );
    // .fromTo(
    //   '.m1Orb',
    //   { scale: 0, transformOrigin: '50% 50%' },
    //   {
    //     opacity: 0.15,
    //     duration: 0.8,
    //     scale: 1.5,
    //     ease: 'back.out(3)',
    //     stagger: 0.15,
    //     overwrite: 'auto'
    //   },
    //   'orbs'
    // );
  }
</script>

<svg id="main1" class={activeDisplayMode} width="100%" height="100%" viewBox="-400 -300 800 600">
  <symbol>
    <defs>
      <linearGradient id="grad1" x1="50%" y1="50%" x2="50%" y2="100%">
        <stop offset="10%" style="stop-color: var(--grd1-stop1); stop-opacity: 0.4" />
        <stop offset="99%" style="stop-color: var(--grd1-stop2); stop-opacity: 0.1" />
      </linearGradient>
      <linearGradient id="grad2" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="25%" style="stop-color: var(--grd2-stop1); stop-opacity: 0.1" />
        <stop offset="99%" style="stop-color: var(--grd2-stop2); stop-opacity: 0.2" />
      </linearGradient>
      <linearGradient id="grad3" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" style="stop-color: #030f19; stop-opacity: 0" />
        <stop offset="45%" style="stop-color: #030f19; stop-opacity: 0" />
        <stop offset="75%" style="stop-color: var(--grd1-stop1); stop-opacity: 0.2" />
        <stop offset="99%" style="stop-color: #030f19; stop-opacity: 0.1" />
      </linearGradient>
    </defs>
  </symbol>

  <g id="stage" style="opacity: 0;">
    <g class="m1_cGroup">
      <circle
        class="c1_line c1_line1"
        cx="0"
        cy="0"
        r="177"
        fill="none"
        stroke-width="3"
        stroke="url(#grad1)"
        opacity="0.2"
      />
    </g>
    <g class="m1_cGroup">
      <circle
        class="c1_line c1_line2"
        cx="0"
        cy="0"
        r="229"
        fill="none"
        stroke-width="2"
        stroke="url(#grad1)"
        opacity="0.15"
      />
    </g>
    <g class="m1_cGroup">
      <circle
        class="c1_line c1_line3"
        cx="0"
        cy="0"
        r="286"
        fill="none"
        stroke-width="2"
        stroke="url(#grad1)"
        opacity=".2"
      />
    </g>
    <g class="m1_cGroup">
      <circle
        class="c1_line c1_line4"
        cx="0"
        cy="0"
        r="350"
        fill="none"
        stroke-width="1"
        stroke="url(#grad2)"
        opacity="0.2"
      />
      <g class="brand orb-brand-0">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={brandTl.pause()}
          on:mouseleave:brand={brandTl.play()}
          index="0"
          opacity={'random'}
          useFx
        />
      </g>
      <g class="brand orb-brand-1">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={brandTl.pause()}
          on:mouseleave:brand={brandTl.play()}
          index="1"
          opacity={'random'}
          useFx
        />
      </g>
    </g>
    <g class="m1_cGroup">
      <circle
        class="c1_line c1_line5"
        cx="0"
        cy="0"
        r="400"
        fill="none"
        stroke-width="2"
        stroke="url(#grad1)"
        opacity="0.2"
      />
      <g class="brand orb-brand-2">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={brandTl.pause()}
          on:mouseleave:brand={brandTl.play()}
          index="2"
          opacity={'random'}
          useFx
        />
      </g>
      <g class="brand orb-brand-3">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={brandTl.pause()}
          on:mouseleave:brand={brandTl.play()}
          index="3"
          opacity={'random'}
          useFx
        />
      </g>
      <g class="brand orb-brand-4">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={brandTl.pause()}
          on:mouseleave:brand={brandTl.play()}
          index="4"
          opacity={'random'}
          useFx
        />
      </g>
    </g>
    <g class="m1_cGroup">
      <circle class="c1_solid" cx="0" cy="0" r="140" fill="url(#grad1)" opacity="0.1" />
    </g>
    {#each $sections as { id, href, y, link, name }, i}
      <g class="m1_cGroup">
        <g>
          <path class="track" {d} stroke="url(#grad5)" />
          <g class="menu-item-3d" data-id={id}>
            <g class="menu-item-label" on:mouseover|stopPropagation={mouseoverHandler} on:focus>
              <rect
                x=".5"
                y=".5"
                width="100"
                height="21"
                rx="10"
                fill="#000"
                stroke="#ffffff33"
                stroke-miterlimit="10"
              />
              <text class="svg-text" text-anchor="middle" fill="#aaa" alignment-baseline="central">
                <tspan stroke-width="0" x="50" dy="14" style="font-size: .5em">
                  {name}
                </tspan>
              </text>
            </g>
            <g class="menu-item" on:mouseover|stopPropagation={mouseoverHandler} on:focus>
              <circle
                class="menu-item-image-bg"
                cx="0"
                cy="0"
                r="40"
                fill="#ffffff"
                stroke="#ffffff"
                stroke-width="1"
              />
              <image class="menu-item-image" {y} href={app_url.concat(href)} />
            </g>
          </g>
        </g>
      </g>
    {/each}
  </g>
</svg>

<style lang="scss">
  svg {
    position: absolute;
    z-index: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    *:focus {
      outline: none;
    }
    .menu-item-3d {
      &.menu-open .menu-item,
      &.menu-open .menu-item circle {
        opacity: 1 !important;
      }
      .menu-item {
        transition: opacity 0.3s ease-in-out;
        cursor: pointer;
        circle {
          transition: opacity 0.3s ease-in-out;
          filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
          opacity: 0.05;
          &:hover {
            opacity: 0.2;
          }
        }
      }
      .menu-item-label {
        transition: opacity 0.3s ease-in-out;
        cursor: pointer;
      }
      .track {
        fill: none;
        stroke-width: 1;
        stroke-miterlimit: 10;
        stroke-linecap: round;
        opacity: 0.2;
      }
    }
    &.closed .menu-item-3d {
      opacity: 0;
    }
    &.default .menu-item-3d {
      opacity: 1;
    }
    &.open .menu-item {
      opacity: 0.2;
      &:hover {
        opacity: 1;
      }
    }
    .menu-item-image {
      width: 130px;
    }
  }
</style>
