import {expect} from '@open-wc/testing';
import {getFileExtension} from '../../js/helpers.js';


it('gets a contrasting text color', () => {
  expect(getFileExtension('radio.txt')).to.equal('txt');
  expect(getFileExtension('Should.web.development.need.a.build.step.mp3')).to.equal('mp3');
  expect(getFileExtension('01 - Tell All The People.flac')).to.equal('flac');
});