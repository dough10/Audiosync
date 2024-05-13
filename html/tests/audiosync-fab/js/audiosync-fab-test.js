import {qs, qsa, svgIcon, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

data.icons.forEach(icon => {
  const fab = document.createElement('audiosync-fab');
  fab.id = icon.name;
  svgIcon(icon.name).then(svg => fab.appendChild(svg));
  fab.setAttribute('color', generateRandomHexCode());
  fab.onClick(_ => {
    if (fab.hasAttribute('noshadow')) {
      new Toast(`${icon.name} fab has no shadow`,1);
      return;
    }
    new Toast(`${icon.name} fab has a shadow`,1);
  });
  qs('body').appendChild(fab);
});

// cycle through showing / hiding each fab
function iterateAndReset(maxValue) {
  let number = 0;
  let increment = 1;
  let last;
  
  const fabs = qsa('audiosync-fab');
  fabs[number].onScreen();

  async function iterate() {
    if (document.hidden) return;

    await fabs[number].offScreen();

    const ndx = Math.floor(Math.random() * maxValue);
    if (fabs[last]) {
      fabs[last].removeAttribute('disabled');
    }
    fabs[ndx].toggleAttribute('disabled');
    last = ndx;

    fabs.forEach(fab => fab.toggleAttribute('noshadow'));

    number += increment;
    if (number >= maxValue) {
      number = 0;
      fabs.forEach(fab => fab.setAttribute('color', generateRandomHexCode()));
    }

    await fabs[number].onScreen();

    if (fabs[number].hasAttribute('disabled') && fabs[number].hasAttribute('onScreen')) {
      new Toast(`${fabs[number].id} fab is diabled`,4);
    }
  }
  setInterval(iterate, 5000); 
}

iterateAndReset(data.icons.length);