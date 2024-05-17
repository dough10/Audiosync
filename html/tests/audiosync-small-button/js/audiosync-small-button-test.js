import {qs, qsa, svgIcon, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(icon => {
  const button = document.createElement('audiosync-small-button');
  button.id = icon.name;
  svgIcon(icon.name).then(svg => button.appendChild(svg));
  button.color(generateRandomHexCode());
  qs('body').appendChild(button);
  button.onClick(_ => new Toast(`${icon.name} small button clicked`,1));
});

let last;
setInterval(_ => {
  const buttons = qsa('audiosync-small-button');
  const ndx = Math.floor(Math.random() * data.icons.length);
  buttons[ndx].toggleAttribute('disabled');
  new Toast(`${buttons[ndx].id} button is disabled`)
  if (buttons[last]) buttons[last].removeAttribute('disabled');
  last = ndx;
}, 15000);