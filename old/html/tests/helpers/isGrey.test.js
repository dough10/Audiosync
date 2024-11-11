import {expect} from '@open-wc/testing';
import {isGrey} from '../../js/helpers.js';


it('color is grey', () => {
  expect(isGrey(51,51,51)).to.equal(true);
  expect(isGrey(51,41,61)).to.equal(false);
});