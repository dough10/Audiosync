import {objectToCSS, ce} from './helpers.js';

/**
 * progress bar
 */
class AudioSyncProgress extends HTMLElement {
  static get observedAttributes() {
    return ["percent"];
  }
  constructor() {
    super();

    this.lastRan = 0;

    const cssObj = {
      ".label": {
        "display": "flex",
        "justify-content": "space-between",
        "align-items": "center",
        "max-width": "600px"
      },
      ".wrapper": {
        "position": "relative",
        "height": "12px",
        "width": "100%",
        "background-color": "var(--background-color)",
        "margin-top": "4px",
        "margin-bottom": "4px",
        "border": "1px solid rgb(51 51 51 / 10%)",
        "overflow": "hidden",
        "max-width": "600px"
      },
      ".bar": {
        "position": "absolute",
        "top": 0,
        "bottom": 0,
        "left": 0,
        "right": 0,
        "background-color": "var(--main-color)",
        "transform": "translateX(-100%)"
      }
    };

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    const label = ce('div');
    label.classList.add('label');
    label.appendChild(ce('slot'));

    this.bar = ce('div');
    this.bar.classList.add('bar');

    const wrapper = ce('div');
    wrapper.classList.add('wrapper');
    wrapper.appendChild(this.bar);

    const shadow = this.attachShadow({mode: "open"});
    [
      sheet,
      label,
      wrapper
    ].forEach(el => shadow.appendChild(el));
  }

  connectedCallback() {
    this.setAttribute('percent', 0);
  }

  /**
   * percent value has changed
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (newVal == oldVal) return;
    const now = new Date().getTime();
    if ((now - this.lastRan) < 16) return; 
    requestAnimationFrame(_ =>{
      this.bar.style.transform = `translateX(-${100 - newVal}%)`;
    });
    this.lastRan = now;
  }
}
customElements.define('audiosync-progress', AudioSyncProgress);
