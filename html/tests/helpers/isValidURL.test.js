import {expect} from '@open-wc/testing';
import {isValidURL} from '../../js/helpers.js';


it('regEx URL', () => {
  expect(isValidURL('https://google.com')).to.equal(true);
  expect(isValidURL('http://google.com')).to.equal(true);
  expect(isValidURL('htps://google.com')).to.equal(false);
  expect(isValidURL('https//google.com')).to.equal(false);
  expect(isValidURL('htttps://google.com')).to.equal(false);
  expect(isValidURL('https:/google.com')).to.equal(false);
});