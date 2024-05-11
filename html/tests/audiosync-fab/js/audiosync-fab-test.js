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
  
  setInterval(_ => {
    if (document.hidden) return;
    fab.toggleAttribute('noshadow');
  },5000);

  setInterval(_ => {
    if (document.hidden) return;
    fab.setAttribute('color', generateRandomHexCode());
  }, 65000);
});

// testing disabled attribute
function randomLowerThan(maxValue) {
  return Math.floor(Math.random() * maxValue);
}

let last;
setInterval(_ =>  {
  if (document.hidden) return;
  const fabs = qsa('audiosync-fab');
  const ndx = randomLowerThan(data.icons.length);
  if (fabs[last]) {
    fabs[last].removeAttribute('disabled');
  }
  fabs[ndx].toggleAttribute('disabled');
  last = ndx;
}, 5000);

// cycle through showing / hiding each fab
function iterateAndReset(maxValue) {
  let number = 0;
  let increment = 1;
  
  const fabs = qsa('audiosync-fab');
  fabs[0].onScreen();

  async function iterate() {
    if (document.hidden) return;

    await fabs[number].offScreen();

    number += increment;
    if (number >= maxValue) {
      number = 0;
    }

    await fabs[number].onScreen();

    if (fabs[number].hasAttribute('disabled') && fabs[number].hasAttribute('onScreen')) {
      new Toast(`${fabs[number].id} fab is diabled`,4);
    }
  }
  setInterval(iterate, 5000); 
}

iterateAndReset(data.icons.length);