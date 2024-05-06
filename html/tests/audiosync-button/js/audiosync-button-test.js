import {fillButton, generateRandomHexCode} from '../../../js/helpers.js';

(_ => {

  window.onload = _ => {

    const button = document.createElement('audiosync-button');
    button.appendChild(fillButton('check', 'click me'));
    document.querySelector('body').appendChild(button);
    
    button.onClick(e => console.log(e));

    // color & shadow
    setInterval(_ => {
      button.setAttribute('color', generateRandomHexCode());
      button.toggleAttribute('noshadow');
    }, 5000);

    // disabled
    setInterval(_ => {
      button.toggleAttribute('disabled');
    }, 20000);

  };
})()