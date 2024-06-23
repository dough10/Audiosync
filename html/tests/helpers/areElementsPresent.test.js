import {expect} from '@open-wc/testing';
import {areElementsPresent} from '../../js/helpers.js';


it('test if elements in array 1 are present in array 2', () => {
  const ar1 = [
    1,2,3
  ];
  const ar2 = [
    1,2,3,4,5,6,7,8,9,0
  ];
  const ar3 = [
    2,4,6
  ];
  const ar4 = [
    5,6,7,8
  ];
  expect(areElementsPresent(ar1,ar2)).to.equal(true);
  expect(areElementsPresent(ar3,ar2)).to.equal(true);
  expect(areElementsPresent(ar4,ar2)).to.equal(true);
  expect(areElementsPresent(ar2,ar1)).to.equal(false);
  expect(areElementsPresent(ar4,ar3)).to.equal(false);

});