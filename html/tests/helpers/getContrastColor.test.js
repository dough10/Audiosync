import {expect} from '@open-wc/testing';
import {getContrastColor} from '../../js/helpers.js';


it('gets a contrasting text color', () => {
  expect(getContrastColor('#000000')).to.equal('#FFFFFF');
  expect(getContrastColor('#ff0000')).to.equal('#FFFFFF');
  expect(getContrastColor('#FFFFFF')).to.equal('#333333');

});