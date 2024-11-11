import {expect} from '@open-wc/testing';
import {rgbToHex} from '../../js/helpers.js';


it('converts rgb value to hex', () => {
  expect(rgbToHex(255,255,255)).to.equal('#ffffff');
  expect(rgbToHex(255,0,0)).to.equal('#ff0000');
});