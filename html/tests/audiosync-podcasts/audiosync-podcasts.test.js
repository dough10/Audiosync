import {fixture, expect, html} from '@open-wc/testing';
import '../../js/audiosync-podcasts/audiosync-podcasts.js';



it('element has shadowDom', async () => {
  const element = await fixture(html`<audiosync-podcasts></audiosync-podcasts>`);
  expect(element.shadowRoot).to.exist;
});

// it('has content container', async _ => {
//   const element = await fixture(html`<audiosync-podcasts></audiosync-podcasts>`);
//   expect(element.container).to.exist;
// });