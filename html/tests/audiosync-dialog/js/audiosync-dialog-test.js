import {qs, ce, sleep} from '../../../js/helpers.js';

const INPUT = ce('input');
INPUT.type = 'text';
INPUT.toggleAttribute('autoFocus');

const DIALOG = ce('audiosync-dialog');
qs('body').appendChild(DIALOG);
DIALOG.appendChild(INPUT);
await sleep(500);
DIALOG.open();
