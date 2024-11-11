import {expect} from '@open-wc/testing';
import {containsNumber} from '../../js/helpers.js';


it('converts input to hex', () => {
  const ar1 = [
    'this', '1', 'is', 'a', 'number'
  ]
  const ar2 = [
    'this', 'one', 'has', 'no', 'number'
  ]
  expect(containsNumber(ar1)).to.equal(true);
  expect(containsNumber(ar2)).to.equal(false);
});