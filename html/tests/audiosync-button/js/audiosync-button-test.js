import {fillButton, generateRandomHexCode, Toast} from '../../../js/helpers.js';

const data = await fetch('./../../icons.json').then(res => res.json());

(_ => {

  window.onload = _ => {
    data.icons.forEach(icon => {
      const button = document.createElement('audiosync-button');
      button.appendChild(fillButton(icon.name, icon.name));
      button.setAttribute('color', generateRandomHexCode());
      button.onClick(_ => new Toast(`${icon.name} button clicked`,1));
      document.querySelector('body').appendChild(button);
  
      // color & shadow
      setInterval(_ => {
        button.setAttribute('color', generateRandomHexCode());
        button.toggleAttribute('noshadow');
      }, 5000);
  
      // disabled
      setInterval(_ => {
        button.toggleAttribute('disabled');
      }, 20000);
    });

  };
})()