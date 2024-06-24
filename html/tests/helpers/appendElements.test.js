import {fixture, expect, html} from '@open-wc/testing';
import {appendElements} from '../../js/helpers.js';

async function createElements(num) {
  const ar = [];
  for (let i = 0; i < num; i++) {
    const el =  await fixture(html`<div>${i + 1}</div>`);
    ar.push(el);
  }
  return ar;
}

it('elements were properly appended to a parent element', async () => {
  const num = 5;
  const elements = await createElements(num);
  const parent = await fixture(html`<div></div>`);

  appendElements(parent, elements);

  const lastChild = parent.children[parent.children.length - 1];

  expect(parent.children.length).to.equal(num);
  expect(lastChild).to.have.text(String(num));
});