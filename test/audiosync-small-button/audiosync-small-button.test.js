import { fixture, expect } from '@open-wc/testing';
import '../../html/js/audiosync-small-button.js'


it('renders correctly', async _ => {
  const dialog = await fixture('<audiosync-small-button></audiosync-small-button>');
  expect(dialog.shadowRoot).to.exist;
});
