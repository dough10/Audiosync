import {qs, svgIcon, generateRandomHexCode} from '../../../js/helpers.js';


window.onload = _ => {
  const button = document.createElement('audiosync-small-button');
  svgIcon('add').then(svg => button.appendChild(svg));
  qs('body').appendChild(button);
  button.onClick(console.log);

  setInterval(_ => {
    button.color(generateRandomHexCode());
  }, 5000);

  setInterval(_ => {
    button.toggleAttribute('disabled');
  }, 20000);
};