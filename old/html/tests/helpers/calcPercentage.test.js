import {expect} from '@open-wc/testing';
import {calcPercentage} from '../../js/helpers.js';


it('calculates a percentage value', () => {
  expect(calcPercentage(33,100)).to.equal(33);
  expect(calcPercentage(3,100)).to.equal(3);
  expect(calcPercentage(66,100)).to.equal(66);
});