import {generateRandomHexCode, qs, qsa, svgIcon, sleep, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(async (icon, i) => {
  const color = generateRandomHexCode();

  const buttonGuts = document.createElement('div');
  buttonGuts.textContent = icon.name

  const button = document.createElement('audiosync-menu-button');
  // button.id = icon.name;
  button.iconColor(color);
  button.onClick(_ => {
    new Toast(`${icon.name} menu button clicked`,1);
  });
  [
    await svgIcon(icon.name),
    buttonGuts
  ].forEach(el => button.appendChild(el));
  qs('.menu').appendChild(button); 
});


let last;
setInterval(_ => {
  const buttons = qsa('audiosync-menu-button');
  const ndx = Math.floor(Math.random() * data.icons.length);

  buttons[ndx].toggleAttribute('disabled');
  if (buttons[last]) {
    buttons[last].removeAttribute('disabled');
  }
  last = ndx;

}, 5000)

setInterval(_ => {
  qsa('audiosync-menu-button').forEach(button => button.iconColor(generateRandomHexCode()));
}, 15000)
