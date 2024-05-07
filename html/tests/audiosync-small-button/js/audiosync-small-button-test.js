import {qs, svgIcon, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(icon => {
  const button = document.createElement('audiosync-small-button');
  svgIcon(icon.name).then(svg => button.appendChild(svg));
  button.color(generateRandomHexCode());
  qs('body').appendChild(button);
  button.onClick(_ => new Toast(`${icon.name} small button clicked`,1));

  setInterval(_ => {
    button.color(generateRandomHexCode());
  }, 5000);

  setInterval(_ => {
    button.toggleAttribute('disabled');
  }, 20000);
});
