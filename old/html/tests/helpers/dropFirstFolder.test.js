import { expect } from '@open-wc/testing';
import { dropFirstFolder } from '../../js/helpers.js';


it('removes forst folder and returns array', () => {
    expect(dropFirstFolder('this/folder/is/gone.txt').join('/')).to.equal('folder/is/gone.txt');
});