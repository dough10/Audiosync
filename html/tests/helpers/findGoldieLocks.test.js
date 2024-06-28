import {expect} from '@open-wc/testing';
import {findGoldieLocksColor} from '../../js/helpers.js';

const colors = [
  [166, 136, 250],[255,0,0],[255,255,255],[51,51,51],[166, 136, 200],[0,0,0]
]


it('finds a color', () => {
  const skip = findGoldieLocksColor(colors);
  const selected = findGoldieLocksColor(colors, skip);
  expect(selected).to.equal(4);
});