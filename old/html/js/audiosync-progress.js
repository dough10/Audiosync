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
    
    this.attachShadow({mode: "open"});
 
    const CSS_OBJECT = {
      ".label": {
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center",
        padding: '4px'
      },
      ".wrapper": {
        position: "relative",
        height: "12px",
        "background-color": "var(--background-color)",
        "margin-bottom": "4px",
        border: "1px solid rgb(51 51 51 / 10%)",
        overflow: "hidden"
      },
      ".bar": {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        "background-color": "var(--pop-color)",
        transform: "translateX(-100%)"
      }
    };

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    const LABEL = ce('div');
    LABEL.classList.add('label');
    LABEL.appendChild(ce('slot'));

    this.bar = ce('div');
    this.bar.classList.add('bar');

    const PROGRESS_WRAPPER = ce('div');
    PROGRESS_WRAPPER.classList.add('wrapper');
    PROGRESS_WRAPPER.appendChild(this.bar);

    [
      ELEMENT_STYLES,
      LABEL,
      PROGRESS_WRAPPER
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * element connected to the DOM
   */
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
    this.bar.style.transform = `translateX(-${100 - newVal}%)`;

    const CUSTOM_EVENT = new CustomEvent('percent-changed', {
      detail:{id: this.id, percent: Number(newVal)}
    });
    this.dispatchEvent(CUSTOM_EVENT);
  }
}
customElements.define('audiosync-progress', AudioSyncProgress);
