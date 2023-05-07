<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
  import { InertiaPlugin } from 'gsap/InertiaPlugin';
  import { SplitText } from 'gsap/SplitText';
  import { CustomWiggle } from 'gsap/CustomWiggle';
  import { CustomEase } from 'gsap/CustomEase';
  import { fetchData, app_url } from './utils';
  import brands from './stores/brandsStore';
  import loadedBrands from './stores/loadedBrandsStore';
  import headerSections from './stores/headerSectionsStore';
  import sections from './stores/sectionsStore';
  import sectionDict from './sectionsDict.json';
  import labelPosition from './labelPosition.json';
  import SvgImage from './SVGImage.svelte';
  import type { Brand, HeaderSection, Section } from './types';

  export let appElement: HTMLElement;

  gsap.registerPlugin(MotionPathPlugin, SplitText, InertiaPlugin, CustomEase, CustomWiggle);

  CustomWiggle.create('wirrr', { wiggles: 6, type: 'easeOut' });

  // sections.update(sectionDict);
  headerSections.update(sectionDict);

  const dispatch = createEventDispatcher();
  const iconImageOpacity = 1;
  const brandsCount = 5;
  const loadBrandsInterval = 15000;
  const CLOSED = 'closed';
  const DEFAULT = 'default';
  const OPEN = 'open';
  const EXTENDED = 'extended';
  const COMBINED = 'combined';
  const trackLib = {
    closed: { d: 'M0,-1 0,0', type: 'all' },
    default: { d: 'M0,-1 170,0', type: 'all' },
    open: { d: 'M0,-1 250,0', type: 'all' },
    extended: { d: 'M0,-1 750,0', type: 'all' },
    combined: { d: ['M-200,-1 0,-200', 'M0,-1 250,0'], type: 'combined' }
  };
  const menuDict = [CLOSED, DEFAULT, OPEN, EXTENDED, COMBINED];
  const converted = new Map() as Map<
    SVGPathElement,
    {
      menuItem3d: SVGGElement;
      image: SVGImageElement;
      bg: SVGCircleElement;
      point?: { x: number; y: number };
    }
  >;
  const restorePoint = new Map() as Map<
    SVGPathElement,
    { rotation: string | number; d: string; restored: boolean }
  >;

  let skipped;
  let currentPlaymodeIndex = 0;
  let app: HTMLElement;
  let main1: Element;
  let skipIntroBtn: Element;
  let replayIntroBtn: Element;
  let m1_cGroup: SVGGElement[];
  let menuTracks: SVGPathElement[];
  let menuItems3d: SVGGElement[];
  let menuItems: SVGGElement[];
  let menuImages: SVGImageElement[];
  let mainHeaderSection: HTMLElement;
  let image1;
  let image2;
  let image3;
  let pImage1;
  let pImage2;
  let pImage3;
  let splitTextTimeoutId;
  let timeoutId;
  let selectedItemId: number | undefined;
  let width;
  let height;
  let left;
  let top;
  let intervalId;
  let mainTl: GSAPTimeline;
  let menuTl: GSAPTimeline;
  let brandTl: GSAPTimeline;
  let interactiveTl: GSAPTimeline;

  $: activeDisplayMode = menuDict[currentPlaymodeIndex % menuDict.length];
  $: d =
    trackLib[activeDisplayMode]?.d === typeof 'object'
      ? trackLib[activeDisplayMode]?.d[0]
      : trackLib[activeDisplayMode]?.d;
  $: cx = width / 2;
  $: cy = height / 2;
  $: $brands.length && loadBrandImages();
  $: activeMenuTrack = gsap.utils
    .toArray(app?.querySelectorAll('.item-3d.menu'))
    .filter((el: SVGGElement) => parseInt(el.dataset.id) === selectedItemId)
    .map(
      (item: SVGGElement) => item.parentElement.querySelector('.track') as unknown as SVGPathElement
    );

  onMount(async () => {
    app = document.getElementById('app');
    window.addEventListener('resize', resize);
    main1 = document.getElementById('main1');
    skipIntroBtn = document.getElementById('skip-intro');
    replayIntroBtn = document.getElementById('replay-intro');
    // main1.addEventListener('mousemove', mousemoveHandler);
    main1.addEventListener('click', clickStageHandler);
    skipIntroBtn.addEventListener('click', skipIntroHandler);
    replayIntroBtn.addEventListener('click', replayIntroHandler);

    m1_cGroup = document.querySelectorAll('.m1_cGroup') as unknown as SVGGElement[];
    menuTracks = gsap.utils.toArray('.track') as unknown as SVGPathElement[];
    menuImages = gsap.utils.toArray('.menu-item-image') as unknown as SVGImageElement[];
    menuItems = gsap.utils.toArray('.menu-item') as unknown as SVGGElement[];
    menuItems3d = gsap.utils.toArray('.item-3d.menu') as unknown as SVGGElement[];
    mainHeaderSection = document.getElementById('main-logo');

    image1 = document.getElementById('image1');
    image2 = document.getElementById('image2');
    image3 = document.getElementById('image3');
    pImage1 = document.getElementById('pImage1');
    pImage2 = document.getElementById('pImage2');
    pImage3 = document.getElementById('pImage3');

    MotionPathPlugin.convertToPath('.c1_line');

    initElements();
    preloadImages();
    await initHeaderSections();
    // initMenuSections();
    // initCloseAction();
    resize();
    // initBrands();
    // initMenuTimeline();
  });

  function resize() {
    ({ width, height, left, top } = main1.getBoundingClientRect());
    gsap.set('#stage', { x: '0%', y: '0%' });

    // Split text again on resize
    clearTimeout(splitTextTimeoutId);
    splitTextTimeoutId = setTimeout(() => {
      splitText($sections);
    }, 1000);
    splitTextTimeoutId = setTimeout(() => {
      splitText($headerSections);
    }, 1000);
  }

  function splitText(sections) {
    sections.forEach((section) => {
      _splitText(section);
    });
  }

  function initBrands() {
    initBrandTimeline();
    fetchData('wbp_brands').then((res) => ($brands = res.brands));
  }

  function initElements() {
    gsap.set('#loading-spinner', {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%',
      stroke: '#000',
      scale: 3
    });
    gsap.set(skipIntroBtn, {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%',
      y: 230
    });
    gsap.set(replayIntroBtn, {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%',
      x: 300,
      y: 230
    });
    gsap.set('.m2_iGroup image', {
      transformOrigin: '50% 50%',
      opacity: 0
    });
    gsap.set('#logo-icon, #type', {
      xPercent: -50,
      yPercent: -50,
      transformOrigin: '50% 50%'
    });
    gsap.set('#icon', {
      y: '-60px'
    });
    gsap.set('#image1', {
      opacity: 1,
      x: MotionPathPlugin.convertCoordinates(pImage1, image1, { x: 0, y: 0 }).x,
      y: MotionPathPlugin.convertCoordinates(pImage1, image1, { x: 0, y: 0 }).y
    });
    gsap.set('#image2', {
      opacity: 1,
      x: MotionPathPlugin.convertCoordinates(pImage2, image2, { x: 800, y: 0 }).x,
      y: MotionPathPlugin.convertCoordinates(pImage2, image2, { x: 0, y: 0 }).y
    });
    gsap.set('#image3', {
      opacity: 1,
      x: MotionPathPlugin.convertCoordinates(pImage3, image3, { x: 0, y: 0 }).x,
      y: MotionPathPlugin.convertCoordinates(pImage3, image3, { x: 0, y: 0 }).y
    });
  }

  function preloadImages() {
    const images = gsap.utils.toArray('.m2_iGroup image, .m3_cGroup image');
    const onload = function (e: Event, i: number) {
      if (i === images.length - 1) {
        gsap
          .timeline()
          .to('#loading-spinner', {
            opacity: 0,
            delay: 0.2
          })
          .set('#loading-spinner', {
            display: 'none'
          })
          .add(() => initMainTimeline());
      }
    };
    images.forEach((image: SVGImageElement, i, arr) => (image.onload = (e) => onload(e, i)));
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

  async function animateItem(index?: number) {
    currentPlaymodeIndex = index;
    await tick();
    await _setTrackData();
  }

  function _setTrackData() {
    const { d, type } = trackLib[activeDisplayMode];
    menuTracks.forEach(async (track) => {
      if (type === 'combined') {
        gsap.set(track, {
          rotation: track === activeMenuTrack[0] ? 0 : restorePoint.get(track).rotation,
          attr: { d: track === activeMenuTrack[0] ? d[0] : d[1] },
          onUpdate: trackOnUpdateHandler,
          onComplete: () =>
            restorePoint.set(track, {
              ...restorePoint.get(track),
              restored: !restorePoint.get(track).restored
            })
        });
      } else {
        !restorePoint.has(track) &&
          restorePoint.set(track, {
            rotation: gsap.getProperty(track, 'rotation'),
            d: track.getAttribute('d'),
            restored: true
          });
        gsap.set(track, {
          rotation: restorePoint.get(track).rotation,
          attr: { d },
          onUpdate: trackOnUpdateHandler,
          onComplete: () => restorePoint.set(track, { ...restorePoint.get(track), restored: true })
        });
      }
    });
  }

  const getLabelPosition = (deg) => labelPosition.find(({ min, max }) => min <= deg && deg <= max);

  function trackOnCompleteRotationHandler() {
    const track = this.targets()[0];
    const rotation = gsap.getProperty(track, 'rotation');
    const parent = track.parentElement as unknown as SVGGElement;
    const label = parent.querySelector('.item-label') as unknown as SVGImageElement;
    const { xPercent, yPercent } = getLabelPosition(rotation);

    gsap.set(label, {
      xPercent,
      yPercent
    });
  }

  function trackOnStartRotationHandler() {
    const track = this.targets()[0] as unknown as SVGPathElement;
    const parent = track.parentElement as unknown as SVGGElement;
    const menuItem3d = parent.querySelector('.item-3d.menu') as unknown as SVGGElement;
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

  function clickStageHandler() {
    wobble();
    revertHeader();
  }

  const setMenuClasses = (item?: SVGGElement, force?: boolean) => {
    const activeMenus = menuItems3d.filter((itm) =>
      item === itm
        ? 'boolean' === typeof force
          ? itm.classList.toggle('menu-open', force)
          : itm.classList.toggle('menu-open')
        : itm.classList.remove('menu-open')
    );

    return app.classList.toggle('menu-open', 0 < activeMenus.length);
  };

  function clickSectionHandler(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const target = e.currentTarget as unknown as SVGGElement;
    const id = parseInt(target.dataset.iconId);
    if (id != selectedItemId) {
      animateHeader(id);
    }
    dispatch('click:item', { type: 'item', data: id });
  }

  function mouseoverHandler(e: MouseEvent) {
    const target = e.target as unknown as HTMLElement;
    const parent = target.closest('.item-3d') as unknown as HTMLElement;
    const image = parent.querySelector('image') as unknown as HTMLElement;
    parent.addEventListener('mouseleave', mouseleaveHandler);
    parent.addEventListener('click', clickSectionHandler);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const id = parseInt(parent.dataset.iconId);
      interactiveTl.clear();
      if (id != selectedItemId) {
        animateHeader(id);
      }
    }, 200);

    gsap.to(image, {
      opacity: 1,
      scale: 1.2
    });
  }

  function mouseleaveHandler(e: MouseEvent) {
    const target = e.target as unknown as HTMLElement;
    const image = target.parentElement.querySelector('image');

    interactiveTl.clear().add(revertHeader(5));

    gsap.to(image, {
      scale: (i, me: SVGGElement) =>
        me.closest('.item-3d').classList.contains('menu-open') ? 1.4 : 1,
      opacity: iconImageOpacity,
      onComplete: () => target.removeEventListener('mouseleave', mouseleaveHandler)
    });
  }

  function mousemoveHandler(e: MouseEvent) {
    const dx = e.clientX - left - cx;
    const dy = e.clientY - top - cy;

    gsap.to('.m1_cGroup', {
      x: (i) => -dx * (i + 1) * 0.003,
      y: (i) => -dy * (i + 1) * 0.003,
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
    return gsap
      .to(selector, {
        opacity
      })
      .then((tw) => tw);
  }

  function wobble() {
    if (gsap.getProperty('.m1_cGroup', 'scale') != 1) return; //prevent overlapping bouncy tweens
    if (app.classList.contains('menu-open')) return;
    clearInterval;

    for (var i = 0; i < m1_cGroup.length; i++) {
      gsap.fromTo(
        m1_cGroup[i],
        { transformOrigin: '50% 50%', scale: 1 },
        { duration: 0.7 - i * 0.04, scale: 0.9, ease: 'back.in(10)', yoyo: true, repeat: 1 }
      );
    }
  }

  async function initHeaderSections() {
    for (
      let nodes = document.querySelectorAll('section[data-header-section]'), i = 0;
      nodes.length > i;
      i++
    ) {
      const sectionEl = nodes[i] as unknown as HTMLElement;
      const id = parseInt(sectionEl.dataset.headerSection);

      headerSections.put({
        id,
        element: sectionEl,
        title: sectionEl.querySelector('.title')
      });

      await tick();

      // We can now add Icon & track since they're now rendered
      $headerSections.forEach((item, i) => {
        const icon = document.getElementById(`icon-item-${item.id}`) as unknown as SVGGElement;
        const track = icon.parentElement.querySelector('.track') as unknown as SVGPathElement;

        item.icon = icon;
        item.track = track;
      });
    }
  }

  function initMenuSections() {
    for (
      let nodes = document.querySelectorAll('section[data-section]'), i = 0;
      nodes.length > i;
      i++
    ) {
      const sectionEl = nodes[i] as unknown as HTMLElement;
      const id = parseInt(sectionEl.dataset.section);

      sections.put({
        id,
        element: sectionEl,
        title: sectionEl.querySelector('.title')
      });
    }
  }

  function _splitText(section) {
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

  function showSingleText(section: Section) {
    const tl = gsap.timeline({
      defaults: {
        duration: 1
      },
      onStart: () => {
        section.element.classList.add('active');
        appElement.classList.add('playing');
        selectedItemId = section.id;
        section.active = true;
      }
    });
    section.lines.forEach((line, i, lines) => {
      tl.fromTo(
        line,
        {
          y: '-100%'
        },
        {
          y: 0,
          stagger: {
            each: 0.03,
            amount: 0.2
          },
          duration: 0.7
        },
        '<.1'
      );
    });
    tl.add(() => section.element?.classList.add('textActive'), '>');
    return interactiveTl;
  }

  function showText(section: Section) {
    let tl = gsap.timeline({
      defaults: {
        duration: 1
      },
      onStart: () => {
        section.element.classList.add('active');
        appElement.classList.add('playing');
        selectedItemId = section.id;
        section.active = true;
      }
    });

    if (skipped) return tl.add(() => (skipped = false));

    section.lines.forEach((line, i, lines) => {
      tl.fromTo(
        line,
        {
          y: '-100%'
        },
        {
          y: 0,
          stagger: {
            each: 0.03,
            amount: 0.2
          },
          duration: 1
        },
        '<.1'
      );
    });
    return tl.add(() => section.element?.classList.add('textActive'), '>');
  }

  function removeText() {
    let tl;
    $headerSections.forEach((section) => {
      if (section.active) {
        // Ease out line by line on navigation by adding a new timeline at the beginning of the main timeline
        tl = gsap.timeline({
          defaults: {
            duration: 1
          },
          onStart: () => {
            section.element?.classList.remove('textActive');
            section.element?.classList.add('textNotActive');
          },
          onComplete: () => {
            section.element?.classList.remove('active', 'textNotActive');
            section.active = false;
          }
        });

        section.lines.forEach((line, i) => {
          tl.to(
            line,
            {
              y: '100%',
              stagger: {
                each: 0.02,
                amount: 0.2
              },
              duration: 0.5
            },
            '<.1'
          );
        });
      }
    });
    return tl;
  }

  function animateIcon(section: HeaderSection, duration = 0.4) {
    const { track, icon } = section;
    const image = icon?.querySelector('image');
    if (image) {
      const trackId = track.getAttribute('href');
      const rawPath = MotionPathPlugin.getRawPath(trackId);
      MotionPathPlugin.cacheRawPathMeasurements(rawPath);

      const startPoint = MotionPathPlugin.getPositionOnPath(rawPath, 0, true);
      const endPoint = MotionPathPlugin.getPositionOnPath(rawPath, 1, true);

      const tl = gsap
        .timeline({})
        .fromTo(
          icon,
          {
            x: startPoint.x,
            y: startPoint.y,
            opacity: 0,
            xPercent: -50,
            yPercent: -50,
            transformOrigin: '50% 50%'
          },
          {
            x: endPoint.x,
            y: endPoint.y,
            opacity: 1,
            duration,
            ease: 'elastic.out(1, 0.75)'
          }
        )
        .to(track, {
          opacity: 1
        });
      return tl;
    }
  }

  function animateHeader(id?: number) {
    if (typeof id === 'number') {
      const section = $headerSections.find((item) => item.id == id);
      return interactiveTl.add(removeText(), '>').add(showSingleText(section), '>.3');
    } else {
      const tl = gsap.timeline({ name: 'header-timeline' });
      $headerSections.forEach((section, i) => {
        section.tl = tl;
        tl.add(() => removeText())
          .add(() => showText(section))
          .add(animateIcon(section), '>1');
      });
      return tl.add(shake());
    }
  }

  function revertHeader(ph?: string | number) {
    const playhead = typeof ph === 'number' || typeof ph === 'string' ? ph : 0;
    return gsap
      .timeline()
      .add(removeText(), playhead)
      .add(() => appElement.classList.remove('playing'))
      .add(() => (selectedItemId = undefined));
  }

  function initMenuTimeline() {
    menuTl = gsap
      .timeline({ defaults: { duration: 1 } })
      .from('#main1', { duration: 0.5, autoAlpha: 0, ease: 'power1.inOut' }, 0)
      .fromTo('.m1_cGroup', { opacity: 0 }, { duration: 0.3, opacity: 1, stagger: -0.1 }, 0)
      .from('.m1_cGroup', { duration: 2.5, scale: -0.3, stagger: -0.05, ease: 'elastic' }, 0)
      .pause()
      .fromTo(
        menuTracks,
        {
          transformOrigin: '0% 100%',
          onComplete: trackOnStartRotationHandler
        },
        {
          rotate: (i) => (i * 360) / menuTracks.length,
          stagger: {
            each: 0,
            onUpdate: trackOnUpdateHandler,
            onComplete: trackOnCompleteRotationHandler
          },
          duration: 0
        },
        0
      )
      .to('#stage', { opacity: 1, duration: 0.5 }, 0);

    menuTl.play().then(() => animateItem(1));
  }

  function toggleIntro(intro) {
    appElement.classList.toggle('app-intro', intro);
    toggleIntroBtns(intro);
  }

  function skipIntroHandler(e) {
    e.stopPropagation();
    skipped = true;
    mainTl.progress(1);
  }

  function replayIntroHandler(e) {
    e.stopPropagation();
    mainTl.play('start');
  }

  const toggleIntroBtns = (show: boolean) =>
    gsap
      .timeline({ onStart: () => {} })
      .set(skipIntroBtn, {
        opacity: show ? 1 : 0
      })
      .set(replayIntroBtn, {
        opacity: show ? 0 : 1
      });

  function initMainTimeline() {
    interactiveTl = gsap.timeline({
      defaults: {
        duration: 1
      }
    });

    const getStartTl = () => gsap.timeline().from('#main1', { duration: 0.5, autoAlpha: 0 }, 0);

    const getCarsTl = () =>
      gsap
        .timeline({
          onStart: () => {},
          onComplete: () => {}
        })
        .fromTo(
          '#image3',
          {
            opacity: 0,
            scale: 0.6
          },
          {
            motionPath: '#pImage3',
            scale: 1,
            duration: 1.8
          },
          'move-image'
        )
        .to(
          '#image3',
          {
            opacity: 1,
            duration: 0.3
          },
          'move-image+=.3'
        )
        .fromTo(
          '#image1',
          {
            scale: 1
          },
          {
            motionPath: '#pImage1',
            scale: 1,
            duration: 1.3
          },
          'move-image+=.5'
        )
        .fromTo(
          '#image2',
          {
            scale: 0.6
          },
          {
            motionPath: '#pImage2',
            scale: 1,
            duration: 1.5
          },
          'move-image+=.7'
        )
        .to('#main-logo', {
          opacity: 1,
          duration: 1
        });

    return (mainTl = gsap
      .timeline({
        onComplete: () => {
          toggleIntro(false);
          revertHeader();
        }
      })
      .add(getStartTl())
      .to('#stage', { opacity: 1, duration: 0.5 })
      .add('start')
      .add(() => toggleIntro(true))
      .add(getCarsTl())
      .add(animateHeader(), 'start+=2'));
  }

  const shake = () => {
    return gsap.to('.item-3d.icon', {
      stagger: {
        each: 0.1,
        amount: 0.5
      },
      scale: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };

  function initBrandTimeline() {
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
  }
</script>

<svg id="main1" class={activeDisplayMode} width="100%" height="100%" viewBox="-400 -300 800 600">
  <symbol>
    <defs>
      <linearGradient id="grad_1" x1="50%" y1="50%" x2="50%" y2="100%">
        <stop offset="10%" style="stop-color: var(--grd1-stop1); stop-opacity: 0.4" />
        <stop offset="99%" style="stop-color: var(--grd1-stop2); stop-opacity: 0.1" />
      </linearGradient>
      <linearGradient id="grad_2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="25%" style="stop-color: var(--grd2-stop1); stop-opacity: 0.1" />
        <stop offset="99%" style="stop-color: var(--grd2-stop2); stop-opacity: 0.2" />
      </linearGradient>
      <linearGradient id="grad_3" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" style="stop-color: var(--white); stop-opacity: 0" />
        <stop offset="45%" style="stop-color: var(--white); stop-opacity: 0" />
        <stop offset="75%" style="stop-color: var(--white); stop-opacity: 0.2" />
        <stop offset="99%" style="stop-color: var(--white); stop-opacity: 0" />
      </linearGradient>
      <linearGradient id="grad_3_rev" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color: var(--white); stop-opacity: 0" />
        <stop offset="45%" style="stop-color: var(--white); stop-opacity: 0" />
        <stop offset="75%" style="stop-color: var(--white); stop-opacity: 0.2" />
        <stop offset="99%" style="stop-color: var(--white); stop-opacity: 0" />
      </linearGradient>
      <path id="pImage1" d="M-1100,50 -550,100" />
      <path id="pImage2" d="M400,0 100,0" />
      <path id="pImage3" d="M-230,50 -130,50" />

      <path id="pIcon0" d="M0,-1 -290,90" />
      <path id="pIcon1" d="M0,-1 -290,-30" />
      <path id="pIcon2" d="M0,-1 -230,-140" />
      <path id="pIcon3" d="M0,-1 -120,-230" />
      <path id="pIcon4" d="M0,-1 120,-230" />
      <path id="pIcon5" d="M0,-1 260,-140" />
      <path id="pIcon6" d="M0,-1 320,-30" />
      <path id="pIcon7" d="M0,-1 320,90" />
    </defs>
  </symbol>

  <g id="stage" style="opacity: 0;">
    <g class="m2_iGroup">
      <image id="image3" href={app_url.concat('mower.png')} />
    </g>
    <g class="m2_iGroup">
      <image id="image1" href={app_url.concat('car.png')} />
    </g>
    <g class="m2_iGroup">
      <image id="image2" href={app_url.concat('tractor.png')} />
    </g>
    <g class="m1_cGroup">
      <circle
        class="c1_line c1_line1"
        cx="0"
        cy="0"
        r="177"
        fill="none"
        stroke-width="3"
        stroke="url(#grad_1)"
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
        stroke="url(#grad_1)"
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
        stroke="url(#grad_1)"
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
        stroke="url(#grad_2)"
        opacity="0.2"
      />
      <g class="brand orb-brand-0">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={() => brandTl.pause()}
          on:mouseleave:brand={() => brandTl.play()}
          index="0"
          opacity={0.5}
          useFx
        />
      </g>
      <g class="brand orb-brand-1">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={() => brandTl.pause()}
          on:mouseleave:brand={() => brandTl.play()}
          index="1"
          opacity={0.5}
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
        stroke="url(#grad_1)"
        opacity="0.2"
      />
      <g class="brand orb-brand-2">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={() => brandTl.pause()}
          on:mouseleave:brand={() => brandTl.play()}
          index="2"
          opacity={0.5}
          useFx
        />
      </g>
      <g class="brand orb-brand-3">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={() => brandTl.pause()}
          on:mouseleave:brand={() => brandTl.play()}
          index="3"
          opacity={0.5}
          useFx
        />
      </g>
      <g class="brand orb-brand-4">
        <SvgImage
          on:click:brand
          on:mouseenter:brand={() => brandTl.pause()}
          on:mouseleave:brand={() => brandTl.play()}
          index="4"
          opacity={0.5}
          useFx
        />
      </g>
    </g>
    {#each $sections as { id, href, y, name }, i}
      <g class="m1_cGroup">
        <g>
          <path class="track" {d} stroke="url(#grad_3)" stroke-width="0" />
          <g class="item-3d menu" data-id={id}>
            <g class="item-label button" on:mouseover|stopPropagation={mouseoverHandler} on:focus>
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
                fill="var(--circle)"
                stroke="#ffffff"
                stroke-width="0"
              />
              <image class="menu-item-image" {y} href={app_url.concat(href)} />
            </g>
          </g>
        </g>
      </g>
    {/each}
    <g id="main-logo" style="opacity: 0;">
      <use id="icon" href="#logo-icon" />
      <use id="type" href="#logo-type" />
    </g>
    {#each $headerSections as { id, href, y, name, grad }, i}
      <g class="m3_cGroup">
        <g>
          <use
            class="track"
            href={`#pIcon${id}`}
            stroke={`url(#${grad})`}
            stroke-width="1"
            style="opacity: 0;"
          />
          <g
            class="item-3d icon"
            id={`icon-item-${id}`}
            data-icon-id={id}
            on:mouseover|stopPropagation={mouseoverHandler}
            on:focus
          >
            <g class="item-label button" y="0" on:focus>
              <rect
                x=".5"
                y=".5"
                width="180"
                height="41"
                rx="22"
                fill="#000000e0"
                stroke="#ffffffa8"
                stroke-miterlimit="10"
              />
              <text class="svg-text" text-anchor="middle" fill="#aaa" alignment-baseline="central">
                <tspan stroke-width="0" x="100" dy="23" style="font-size: .8em">
                  {name}
                </tspan>
              </text>
            </g>
            <g class="icon-item" on:focus>
              <image class="icon-item-image" href={app_url.concat(href)} x="-30" y="0" />
            </g>
          </g>
        </g>
      </g>
    {/each}
  </g>
  <use id="loading-spinner" href="#spinner" stroke="#000" />
  <g id="skip-intro" class="item-label button intro" y="0" on:focus>
    <rect
      x=".5"
      y=".5"
      width="120"
      height="31"
      rx="15"
      fill="#000000e0"
      stroke="#ffffffa8"
      stroke-width="1"
      stroke-miterlimit="10"
    />
    <text class="svg-text" text-anchor="middle" fill="#fff" alignment-baseline="central">
      <tspan stroke-width="0" x="62" dy="19" style="font-size: .6em"> Intro überspringen </tspan>
    </text>
  </g>
  <g id="replay-intro" class="item-label button intro" y="0" on:focus>
    <rect
      x=".5"
      y=".5"
      width="30"
      height="30"
      rx="15"
      fill="#000000e0"
      stroke="#ffffffa8"
      stroke-width="1"
      stroke-miterlimit="10"
    />
    <text class="svg-text" text-anchor="middle" fill="#fff" alignment-baseline="central">
      <tspan stroke-width="0" x="15" dy="18" style="font-size: .4em">Intro</tspan>
    </text>
  </g>
</svg>

<style lang="scss">
  svg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    *:focus {
      outline: none;
    }
    text {
      font-family: 'canada-type-gibson';
    }
    .m1_cGroup {
      display: none;
    }
    .intro.button {
      opacity: 0;
    }
    .item-label {
      transition: opacity 0.3s ease-in-out;
      cursor: pointer;
      text {
        pointer-events: none;
      }
      &.intro text {
        pointer-events: all;
      }
    }
    .item-3d {
      &.menu-open .menu-item {
        opacity: 1 !important;
      }
      &.menu-open .menu-item circle {
        opacity: 0.8 !important;
      }
      .icon-item,
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
      .track {
        fill: none;
        stroke-width: 1;
        stroke-miterlimit: 10;
        stroke-linecap: round;
        opacity: 0.2;
      }
    }
    &.closed .item-3d {
      opacity: 0;
    }
    &.default .item-3d {
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
    .icon-item-image {
      width: 80px;
      pointer-events: none;
    }
    #logo {
      width: 75px;
      height: 75px;
    }
    #main-logo {
      fill: var(--yellow);
      transition: all 0.8s ease-out;
      transform: translateY(-40px);
      #type {
        transition: all 0.9s ease-in 0.8s;
        opacity: 1;
      }
    }
    .m2_iGroup {
      transition: all 0.3s ease-out;
      opacity: 0.5;
      #image1 {
        width: 450px;
      }
      #image2 {
        width: 450px;
      }
      #image3 {
        width: 250px;
      }
    }
  }
</style>
