import {fixture, expect, html} from '@open-wc/testing';
import '../../js/audiosync-dialog/audiosync-dialog.js';



it('element has shadowDom', async () => {
  const element = await fixture(html`<audiosync-dialog alt-css="../../../html/js/audiosync-dialog/audiosync-dialog.css"></audiosync-dialog>`);
  expect(element.shadowRoot).to.exist;
});
