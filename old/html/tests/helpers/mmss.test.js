import {expect} from '@open-wc/testing';
import {mmss} from '../../js/helpers.js';


it('convert seconds to readable', () => {
  expect(mmss(120)).to.equal('2:00');
});