import {
  objectToCSS,
  ce
} from './helpers.js';


/**
 * material design switch
 */
class AudioSyncSwitch extends HTMLElement {
  constructor() {
    super();

    const cssObj = {
      ".audiosync-switch": {
        "z-index": 0,
        "position": "relative",
        "display": "inline-block",
        "color": "rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.87)",
        "font-family": "var(--font-family)",
        "font-size": "16px",
        "line-height": 1.5,
        "width": "95%",
        "margin": "8px"
      },
      ".audiosync-switch > input": {
        "appearance": "none",
        "-moz-appearance": "none",
        "-webkit-appearance": "none",
        "z-index": -1,
        "position": "absolute",
        "right": "6px",
        "top": "-8px",
        "display": "block",
        "margin": 0,
        "border-radius": "50%",
        "width": "40px",
        "height": "40px",
        "background-color": "rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38)",
        "outline": "none",
        "opacity": 0,
        "transform": "scale(1)",
        "pointer-events": "none",
        "transition": "opacity 0.3s 0.1s, transform 0.2s 0.1s"
      },
      ".audiosync-switch > span": {
        "display": "inline-block",
        "width": "100%",
        "cursor": "pointer",
        "text-transform": "uppercase"
      },
      ".audiosync-switch > span::before": {
        "content": "\"\"",
        "float": "right",
        "display": "inline-block",
        "margin": "5px 0 5px 10px",
        "border-radius": "7px",
        "width": "36px",
        "height": "14px",
        "background-color": "rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38)",
        "vertical-align": "top",
        "transition": "background-color 0.2s, opacity 0.2s"
      },
      ".audiosync-switch > span::after": {
        "content": "\"\"",
        "position": "absolute",
        "top": "2px",
        "right": "16px",
        "border-radius": "50%",
        "width": "20px",
        "height": "20px",
        "background-color": "rgb(var(--pure-material-onprimary-rgb, 255, 255, 255))",
        "box-shadow": "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
        "transition": "background-color 0.2s, transform 0.2s"
      },
      ".audiosync-switch > input:checked": {
        "right": "-10px",
        "background-color": "rgb(var(--switch-rgb, 33, 150, 243))"
      },
      ".audiosync-switch > input:checked + span::before": {
        "background-color": "rgba(var(--switch-rgb, 33, 150, 243), 0.6)"
      },
      ".audiosync-switch > input:checked + span::after": {
        "background-color": "rgb(var(--switch-rgb, 33, 150, 243))",
        "transform": "translateX(16px)"
      },
      ".audiosync-switch:hover > input": {
        "opacity": 0.04
      },
      ".audiosync-switch > input:focus": {
        "opacity": 0.12
      },
      ".audiosync-switch:hover > input:focus": {
        "opacity": 0.16
      },
      ".audiosync-switch > input:active": {
        "opacity": 1,
        "transform": "scale(0)",
        "transition": "transform 0s, opacity 0s"
      },
      ".audiosync-switch > input:active + span::before": {
        "background-color": "rgba(var(--switch-rgb, 33, 150, 243), 0.6)"
      },
      ".audiosync-switch > input:checked:active + span::before": {
        "background-color": "rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38)"
      },
      ".audiosync-switch > input:disabled": {
        "opacity": 0
      },
      ".audiosync-switch > input:disabled + span": {
        "color": "rgb(var(--pure-material-onsurface-rgb, 0, 0, 0))",
        "opacity": 0.38,
        "cursor": "default"
      },
      ".audiosync-switch > input:disabled + span::before": {
        "background-color": "rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38)"
      },
      ".audiosync-switch > input:checked:disabled + span::before": {
        "background-color": "rgba(var(--switch-rgb, 33, 150, 243), 0.6)"
      }
    };

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    this.input = ce('input');
    this.input.type = 'checkbox';

    const span = ce('span');
    span.appendChild(ce('slot'));

    const label = ce('label');
    label.classList.add('audiosync-switch');
    [
      this.input,
      span
    ].forEach(el => label.appendChild(el));
    
    this.attachShadow({mode: "open"});
    [
      sheet,
      label
    ].forEach(el => this.shadowRoot.appendChild(el));

    this.input.onchange = async _ => {

      this.setAttribute(this.input.checked, Number(this.input.checked));

      const ev = new CustomEvent('statechange', {
        detail:{id: this.id, state: Number(this.input.checked)}
      });
      this.dispatchEvent(ev);

    };
  }

  /**
   * set the state of the input element
   * 
   * @param {Number} newState
   */
  setState(newState) {
    this.input.checked = Boolean(newState);
    this.setAttribute('state', Number(newState));
  }

  /**
   * gets the state of the input element
   */
  state() {
    return Number(this.input.checked);
  }
}
customElements.define('audiosync-switch', AudioSyncSwitch);
