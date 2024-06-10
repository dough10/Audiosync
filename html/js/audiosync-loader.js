import {objectToCSS, ce} from './helpers.js';

/**
 * application loading element
 */
class AudioSyncLoader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    
    const CSS_OBJECT = {
      ".load": {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgb(182, 182, 182)",
        "justify-content": "center",
        display: "flex",
        "align-items": "center",
        "z-index": 1000,
        "text-transform": "uppercase",
        "pointer-events": "all",
        overflow: "hidden",
        "font-size": "1.5em",
        color: "#333333",
        'will-change': 'transform',
        transition: 'transform 300ms cubic-bezier(.33,.17,.85,1.1)'
      },
      '.offscreen': {
        transform: 'translateY(-100%)'
      }
    }
    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.loader = ce('div');
    this.loader.classList.add('load')
    this.loader.appendChild(ce('slot'));
    this.loader.addEventListener('transitionend', _ => this.remove());


    [
      ELEMENT_STYLES,
      this.loader
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  reveal() {
    requestAnimationFrame(_ => this.loader.classList.add('offscreen'));
  }
}
customElements.define('audiosync-loader', AudioSyncLoader);
