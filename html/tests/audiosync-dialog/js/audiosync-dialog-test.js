import {qs, ce, sleep} from '../../../js/helpers.js';

const button = ce('button');
button.textContent = 'OPEN';

const INPUT = ce('input');
INPUT.type = 'text';
INPUT.toggleAttribute('autoFocus');

const DIALOG = ce('audiosync-dialog');
DIALOG.appendChild(INPUT);

button.addEventListener('click', _ => DIALOG.open());

[
  DIALOG,
  button
].forEach(el => qs('body').appendChild(el));