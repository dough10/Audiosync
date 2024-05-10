import {qs, qsa, svgIcon, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());


data.icons.forEach(icon => {
  const fab = document.createElement('audiosync-fab');
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
    fab.toggleAttribute('noshadow');
  },5000);
});



function iterateAndReset(maxValue) {
  let number = 0;
  let increment = 1;
  
  const fabs = qsa('audiosync-fab');
  fabs[0].onScreen();

  async function iterate() {

    await fabs[number].offScreen();

    number += increment;
    if (number >= maxValue) {
      number = 0;
    }

    await fabs[number].onScreen();
  }
  setInterval(iterate, 5000); 
}

iterateAndReset(data.icons.length);