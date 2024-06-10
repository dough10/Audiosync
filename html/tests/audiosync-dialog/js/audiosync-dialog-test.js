import {qs, ce, sleep} from '../../../js/helpers.js';


const DIALOG = ce('audiosync-dialog');
qs('body').appendChild(DIALOG);
await sleep(5000);
DIALOG.open();
