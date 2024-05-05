import {svgIcon} from '../../../js/helpers.js';

(_ => {

  /**
   * creates elemets to text spacing in the button
   * 
   * @param {String} d
   * @param {String} txt
   * 
   * @returns {HTMLElement}
   */
  function fillButton(d, txt) {
    const div = document.createElement('div');

    const text = document.createElement('div');
    text.textContent = txt;

    [svgIcon(d,false),text].forEach(el => div.appendChild(el)); 
    return div;
  }


  const ic = "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z";

  window.onload = _ => {

    const button = document.createElement('audiosync-button');
    button.appendChild(fillButton(ic, 'click me'));
    document.querySelector('body').appendChild(button);
    
    button.onClick(e => console.log(e));

    // color
    setInterval(_ => {
      button.setAttribute('color', button.generateRandomHexCode());
    }, 5000);

    // noshadow
    setInterval(_ => {
      button.toggleAttribute('disabled');
    }, 20000);

  };
})()