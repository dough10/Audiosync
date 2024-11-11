import {expect} from '@open-wc/testing';
import {hexToRgba} from '../../js/helpers.js';


it('converts hex color to rgba value', () => {
  expect(hexToRgba('#ffffff')).to.equal('rgba(255,255,255, 0.4)');
  expect(hexToRgba('#ff0000')).to.equal('rgba(255,0,0, 0.4)');
});