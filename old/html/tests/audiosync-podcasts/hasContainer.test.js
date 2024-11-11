import {fixture, expect, html} from '@open-wc/testing';
import '../../js/audiosync-podcasts/audiosync-podcasts.js';



it('has content container', async () => {
  const element = await fixture(html`<audiosync-podcasts alt-css="../../../html/js/audiosync-podcasts/audiosync-podcasts.css"></audiosync-podcasts>`);
  expect(element._container).to.exist;
});