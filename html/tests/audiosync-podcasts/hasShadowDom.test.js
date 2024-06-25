import {fixture, expect, html} from '@open-wc/testing';
import '../../js/audiosync-podcasts/audiosync-podcasts.js';



it('element has shadowDom', async () => {
  const element = await fixture(html`<audiosync-podcasts alt-css="../../../html/js/audiosync-podcasts/audiosync-podcasts.css"></audiosync-podcasts>`);
  expect(element.shadowRoot).to.exist;
});
