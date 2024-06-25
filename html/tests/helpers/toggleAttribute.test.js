import {fixture, expect, html} from '@open-wc/testing';
import {toggleAttribute} from '../../js/helpers.js';


it('sets attribute true', async () => {

  const element = await fixture(html`<div></div>`);
  toggleAttribute(element, 'disabled');
  expect(element.hasAttribute('disabled')).to.equal(true);

  const alreadyDisabled = await fixture(html`<div disabled></div>`);
  toggleAttribute(alreadyDisabled, 'disabled');
  expect(alreadyDisabled.hasAttribute('disabled')).to.equal(true);
});