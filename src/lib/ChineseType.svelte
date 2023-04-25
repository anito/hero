<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
  import SvgGroup from './SvgGroup.svelte';


  gsap.registerPlugin(DrawSVGPlugin);

  const backgroundColors = ['#565659', '#3D5741', '#4C4F79', '#55C2CB', '#D7B4B2', '#FFFFFF'];
  const strokeColors = ['#F2F2F2', '#84AC7F', '#C4AA7B', '#F3E7CA', '#014574', '#014574'];


  let index = -1;
  let ch_strokes = [];
  let wrapperEl;

  onMount(() => {
    init();
  });

  function init() {
    initElements();
    drawChineseType();
  }

  function initElements() {
    gsap.set('.stroke', { drawSVG: 0 });
  }

  function setColors(idx?: number) {
    index = (index + 1) % backgroundColors.length;
    gsap.set('.draw.stroke', { drawSVG: 0, stroke: strokeColors[idx || index] });
    gsap.to('.wrapper', { backgroundColor: backgroundColors[idx || index], ease: 'none' });
  }

  async function drawChineseType() {
    setColors(4);
    ch_strokes = Array.from(document.querySelectorAll('#chinese-type .stroke'));

    gsap
      .timeline({
        defaults: { ease: 'none' },
        repeat: 0,
        repeatDelay: 5
      })
      .to(ch_strokes[0], {
        drawSVG: true,
        ease: 'sine.in',
        duration: 1.5
      })
      .to(
        [ch_strokes[1]],
        {
          drawSVG: true,
          ease: 'sine.inOut',
          duration: 0.4,
          stagger: 0.3
        },
        '<1.2'
      )
      .to(ch_strokes[3], {
        drawSVG: true,
        ease: 'sine.in',
        duration: 0.6
      })
      .to(
        ch_strokes[4],
        {
          drawSVG: true,
          ease: 'sine.in',
          duration: 0.5
        },
        '+=0.5'
      )
      .to(
        ch_strokes[5],
        {
          drawSVG: true,
          ease: 'sine.inout',
          duration: 1.5
        },
        '<0.4'
      )
      .to(
        ch_strokes[6],
        {
          drawSVG: true,
          ease: 'sine.in',
          duration: 1
        },
        '<0.6'
      )
      .to(
        ch_strokes[7],
        {
          drawSVG: true,
          ease: 'sine.in',
          duration: 0.5
        },
        '+=0.3'
      )
      .to(ch_strokes[8], {
        drawSVG: true,
        ease: 'sine.in',
        duration: 0.6
      })
      .to(
        ch_strokes[9],
        {
          drawSVG: true,
          ease: 'sine.inout',
          duration: 1.1
        },
        '<0.5'
      )
      .to(
        [ch_strokes[10], ch_strokes[11]],
        {
          drawSVG: true,
          ease: 'sine.in',
          duration: 0.4,
          stagger: 0.3
        },
        '+=0.2'
      )
      .to(
        ch_strokes[12],
        {
          drawSVG: true,
          ease: 'power3.inout',
          duration: 0.8
        },
        '+=0.3'
      )
      .to(
        ch_strokes[13],
        {
          drawSVG: true,
          ease: 'power3.inout',
          duration: 0.8
        },
        '+=0.3'
      )
      .to(
        ch_strokes[14],
        {
          drawSVG: true,
          ease: 'sine.in',
          duration: 0.3
        },
        '+=0.6'
      )
      .to(
        ch_strokes[15],
        {
          drawSVG: true,
          ease: 'power2.inout',
          duration: 1.3
        },
        '-=0.1'
      );
  }

</script>

<div
  class="wrapper"
  bind:this={wrapperEl}
>

  {#if ch_strokes.length}
    <SvgGroup name={'chinese-type'} strokeWidth={45} />
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    height: 100%;
  }
</style>
