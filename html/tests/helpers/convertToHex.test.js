import {expect} from '@open-wc/testing';
import {convertToHex} from '../../js/helpers.js';


it('converts input to hex', () => {
  expect(convertToHex('white')).to.equal('#ffffff');
  expect(convertToHex('white')).to.equal('#ffffff');
  expect(convertToHex('rgb(255,0,0)')).to.equal('#ff0000');
});