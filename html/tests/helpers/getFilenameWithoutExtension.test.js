import {expect} from '@open-wc/testing';
import {getFilenameWithoutExtension} from '../../js/helpers.js';


it('gets a contrasting text color', () => {
  expect(getFilenameWithoutExtension('radio.txt')).to.equal('radio');
  expect(getFilenameWithoutExtension('Should.web.development.need.a.build.step.mp3')).to.equal('Should.web.development.need.a.build.step');
  expect(getFilenameWithoutExtension('01 - Tell All The People.flac')).to.equal('01 - Tell All The People');
});