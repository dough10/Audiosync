import {qs, svgIcon, fillButton, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(async icon => {
  const buttonGuts = document.createElement('div');
  buttonGuts.textContent = icon.name
  const button = document.createElement('audiosync-menu-button');
  button.onClick(_ => {
    new Toast(`${icon.name} menu button clicked`,1);
  });
  [
    await svgIcon(icon.name),
    buttonGuts
  ].forEach(el => button.appendChild(el));
  qs('.menu').appendChild(button); 

  setInterval(_ => {
    button.toggleAttribute('disabled');
  }, 10000)
});