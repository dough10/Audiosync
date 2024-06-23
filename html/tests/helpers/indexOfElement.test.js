import {expect} from '@open-wc/testing';
import {indexOfElement} from '../../js/helpers.js';


it('converts hex color to rgba value', () => {
  const ar = [
    0,1,2,3,4,5,6,7,8,9
  ]
  expect(indexOfElement(ar,10)).to.equal(-1);
  expect(indexOfElement(ar,0)).to.equal(0);
  expect(indexOfElement(ar,1)).to.equal(1);
  expect(indexOfElement(ar,2)).to.equal(2);
  expect(indexOfElement(ar,4)).to.equal(4);
  expect(indexOfElement(ar,8)).to.equal(8);
});