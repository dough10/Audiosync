import { fixture, expect } from '@open-wc/testing';
import '../../js/audiosync-small-button.js';


it('renders correctly', async _ => {
  this.timeout(5000);
  try {
    const dialog = await fixture('<audiosync-small-button></audiosync-small-button>');
    expect(dialog.shadowRoot).to.exist;
  } catch(error) {
    console.error('Error rendering component:', error);
    throw error;
  }
});
