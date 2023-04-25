<script lang="ts">
  import { onMount } from 'svelte';

  let style;
  let main;

  onMount(() => {
    style = document.defaultView.getComputedStyle(main).backgroundImage;
  });
</script>

<main bind:this={main}>
  <section data-section="0">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Reifenservice</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </p>
        </div>
      </div>
    </div>
  </section>
  <section data-section="1">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Ersatzteile</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet. 
          </p>
          <a class="read-more" href="#ersatzteile" target="_self" role="button">Mehr erfahren</a>
        </div>
      </div>
    </div>
  </section>
  <section data-section="2">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Werkstatt</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
        </div>
      </div>
    </div>
  </section>
  <section data-section="3">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Mietfahrzeuge</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet. 
          </p>
          <a class="read-more" href="/product-category/mieten/" target="_self" role="button"
            >Mehr erfahren</a
          >
        </div>
      </div>
    </div>
  </section>
  <section data-section="4">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Angebote</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </p>
          <a class="read-more" href="/showromm/" target="_self" role="button">Mehr erfahren</a>
        </div>
      </div>
    </div>
  </section>
  <section data-section="5">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Neufahrzeuge</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
            invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
            sanctus est Lorem ipsum dolor sit amet.
          </p>
          <a class="read-more" href="#neufahrzeuge" target="_self" role="button">Mehr erfahren</a>
        </div>
      </div>
    </div>
  </section>
  <section data-section="6">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">TYM</div>
          <div class="lineTxt">Werksvertretung</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no
            sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
          <a class="read-more" href="/brands/tym/" target="_self" role="button">Mehr erfahren</a>
        </div>
      </div>
    </div>
  </section>
  <section data-section="7">
    <div class="section-inner">
      <div class="align-center">
        <h1>
          <div class="lineTxt">Abschlepp-</div>
          <div class="lineTxt">service</div>
        </h1>
        <div class="content">
          <p>Lorem ipsum dolor sit amet <em>gubergren</em></p>
          <p class="line">
            At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no
            sea takimata sanctus est Lorem ipsum dolor sit amet. 
          </p>
        </div>
      </div>
    </div>
  </section>
</main>
<slot />

<style>
  main {
    background-image: var(--background);
    background-size: cover;
    background-position: 50% 50%;
  }
</style>
