import {qs, qsa, ce, fillButton, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(icon => {
  const button = ce('audiosync-button');
  button.appendChild(fillButton(icon.name, icon.name));
  button.setAttribute('color', generateRandomHexCode());
  button.onClick(_ => {
    new Toast(`${icon.name} button clicked`,1);
  });
  qs('body').appendChild(button);
});

let last;
setInterval(_ => {
  const buttons = qsa('audiosync-button');
  const ndx = Math.floor(Math.random() * data.icons.length);
  buttons[ndx].toggleAttribute('disabled');
  if (buttons[last]) {
    buttons[last].removeAttribute('disabled');
  }
  last = ndx;
}, 5000);