import {qs, svgIcon, generateRandomHexCode} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(async icon => {
  const svg = await svgIcon(icon.name, generateRandomHexCode())
  qs('body').appendChild(svg);
});