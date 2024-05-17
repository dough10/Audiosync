import {qs, generateRandomHexCode, fillButton, parseCSS, objectToCSS, generateRandomString} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());


data.icons.forEach(icon => {
  const className = generateRandomString()

  const color = generateRandomHexCode()
  const style = parseCSS(qs('style').textContent);
  style[`.${className}`] = {
    'color': color,
    'display': 'flex',
    'flex-direction': 'row',
    'margin-right':'16px'
  };
  style[`.${className} > :first-child`] = {
    'margin-right': '16px'
  };
  style[`.${className} > :nth-child(2)`] = {
    'display': 'flex',
    'align-items': 'center',
    'margin-right':'8px'
  };
  qs('style').textContent = objectToCSS(style);
  const el = fillButton(icon.name, icon.name);
  el.classList.add(className);
  qs('body').appendChild(el);
});
