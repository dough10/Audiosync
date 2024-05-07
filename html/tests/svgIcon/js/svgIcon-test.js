import {qs, generateRandomHexCode, fillButton} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());


data.icons.forEach(async icon => {
  const color = generateRandomHexCode()
  const css = `
  .${icon.name} {
    color: ${color};
    display: flex;
    flex-direction: row;
    margin-right:16px;
  }
  .${icon.name} > :first-child {
    margin-right: 16px;
  }
  .${icon.name} > :nth-child(2) {
    display: flex;
    align-items: center;
    margin-right:8px;
  }
  `;
  const style = qs('style').textContent;
  qs('style').textContent = style + css;
  const svg = fillButton(icon.name, icon.name);
  svg.classList.add(icon.name);
  qs('body').appendChild(svg);
});
