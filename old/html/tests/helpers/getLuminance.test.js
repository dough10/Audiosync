import {expect} from '@open-wc/testing';
import {getLuminance} from '../../js/helpers.js';


it('gets a contrasting text color', () => {
  expect(getLuminance(0,0,0)).to.equal(0);
  expect(getLuminance(255,255,255)).to.equal(1);
});