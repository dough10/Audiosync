import { fixture, expect } from '@open-wc/testing';
import '../../js/audiosync-dialog/audiosync-dialog.js'

describe('audiosync-dialog', _ => {
  it('renders correctly', async _ => {
    const dialog = await fixture('<audiosync-dialog></audiosync-dialog>');
    expect(dialog.shadowRoot).to.exist;
  });
});