<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { gsap } from 'gsap';
  import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
  import { InertiaPlugin } from 'gsap/InertiaPlugin';
  import { SplitText } from 'gsap/SplitText';
  import { CustomWiggle } from 'gsap/CustomWiggle';
  import { CustomEase } from 'gsap/CustomEase';

  gsap.registerPlugin(MotionPathPlugin, SplitText, InertiaPlugin, CustomEase, CustomWiggle);
</script>