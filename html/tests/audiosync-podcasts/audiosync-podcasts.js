import {fixture, expect, html} from '@open-wc/testing';
import '../../js/audiosync-podcasts/audiosync-podcasts.js';



it('element has shadowDom', async () => {
  const element = await fixture(html`<audiosync-podcasts css_src="../../js/audiosync-podcasts/audiosync-podcasts.css"></audiosync-podcasts>`);
  expect(element.shadowRoot).to.exist;
});

// it('has content container', async _ => {
//   expect(element.container).to.exist;
// });