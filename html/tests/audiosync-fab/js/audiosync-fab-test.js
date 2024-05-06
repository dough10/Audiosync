import {qs, svgIcon, generateRandomHexCode} from '../../../js/helpers.js';

window.onload = _ => {
  const fab = document.createElement('audiosync-fab');
  svgIcon('settings').then(svg => fab.appendChild(svg));
  qs('body').appendChild(fab);
  fab.onClick(console.log);

  setInterval(_ => {
    fab.setAttribute('color', generateRandomHexCode());
    fab.toggleAttribute('noshadow');
  }, 5000);

  setInterval(_ => {
    fab.toggleAttribute('disabled');
  }, 20000);
};