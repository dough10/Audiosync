import {expect} from '@open-wc/testing';
import {formatDownloadSpeed} from '../../js/helpers.js'


it('converts download speed to a readable form', () => {
  expect(formatDownloadSpeed(1000)).to.equal('1.00 kbps');
  expect(formatDownloadSpeed(1)).to.equal('1.00 bps');
  expect(formatDownloadSpeed(1500000)).to.equal('1.50 Mbps');
});