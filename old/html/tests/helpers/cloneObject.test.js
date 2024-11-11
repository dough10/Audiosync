import { expect } from '@open-wc/testing';
import { cloneObject } from '../../js/helpers.js';


it('clones object', () => {
  const obj1 = {key: 1};
  const obj2 = cloneObject(obj1);
  obj2.key++;
  expect(obj2.key).to.equal(2);
  expect(obj1.key).to.equal(1);
});