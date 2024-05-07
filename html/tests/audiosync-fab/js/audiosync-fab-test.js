import {qs, svgIcon, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());


data.icons.forEach(icon => {
  const fab = document.createElement('audiosync-fab');
  svgIcon(icon.name).then(svg => fab.appendChild(svg));
  fab.setAttribute('color', generateRandomHexCode());
  fab.onClick(_ => new Toast(`${icon.name} fab clicked`,1));
  qs('body').appendChild(fab);

  setInterval(_ => {
    fab.setAttribute('color', generateRandomHexCode());
    fab.toggleAttribute('noshadow');
  }, 5000);

  setInterval(_ => {
    fab.toggleAttribute('disabled');
  }, 20000);
});
