import {expect} from '@open-wc/testing';
import {getIcon} from '../../js/getIcon/getIcon.js';


it('get icon data from icons.json', async () => {
  expect(getIcon('download')).to.have.property('name', 'download');
  expect(getIcon('list')).to.have.property('name', 'list');
  expect(getIcon('check')).to.have.property('name', 'check');
});