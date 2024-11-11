import { fixture, html, expect } from '@open-wc/testing';
import { nameToIndex } from '../../js/app.js'; // Adjust the path to your function

// Mock functions
window.qsa = (selector, element) => element.querySelectorAll(selector);
window.qs = (selector) => document.querySelector(selector);
window.getFilenameWithoutExtension = (filename) => filename.replace(/\.[^/.]+$/, '');

describe('nameToIndex', () => {
  it('should return the index of the option with the given name', async () => {
    const dropdown = await fixture(html`
      <select id="dropdown">
        <option value="theme1.txt">Theme 1</option>
        <option value="theme2.txt">Theme 2</option>
        <option value="theme3.txt">Theme 3</option>
      </select>
    `);

    document.body.appendChild(dropdown);

    const index = nameToIndex('#dropdown', 'theme2');
    expect(index).to.equal(1);

    document.body.removeChild(dropdown);
  });

  it('should return -1 if the name does not match any option', async () => {
    const dropdown = await fixture(html`
      <select id="dropdown">
        <option value="theme1.txt">Theme 1</option>
        <option value="theme2.txt">Theme 2</option>
        <option value="theme3.txt">Theme 3</option>
      </select>
    `);

    document.body.appendChild(dropdown);

    const index = nameToIndex('#dropdown', 'theme4');
    expect(index).to.equal(-1);

    document.body.removeChild(dropdown);
  });

  it('should return -1 if the dropdown is empty', async () => {
    const dropdown = await fixture(html`
      <select id="dropdown"></select>
    `);

    document.body.appendChild(dropdown);

    const index = nameToIndex('#dropdown', 'theme1');
    expect(index).to.equal(-1);

    document.body.removeChild(dropdown);
  });
});
