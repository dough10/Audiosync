import {ce, objectToCSS} from './helpers.js';
/**
 * application header
 */
class AudioSyncHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    const CSS_OBJECT = {
      "header": {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--header-height)",
        color: "var(--text-color)",
        'z-index': 1
      },
      ".header-content": {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom:0,
        padding: "12px",
        display: "flex",
        "background-color": "var(--main-color)",
        "justify-content": "space-between",
        "align-items": "center"
      },
      ".header-shadow": {
        transition: 'left 300ms cubic-bezier(.33,.17,.85,1.1)',
        height: "6px",
        "box-shadow": "inset 0px 5px 6px -3px rgba(0,0,0,0.4)",
        position: "absolute",
        "will-change": "auto",
        top: "var(--header-height)",
        left: 0,
        right: 0,
        "pointer-events": "none",
        "z-index": 1
      },
      '@media screen and (min-width: 1200px)': {
        'header': {
          left: "300px"
        },
        ".header-content": {
          "justify-content": "right"
        },
        ".header-shadow": {
          left: '300px'
        }
      }
    };

    const HEADER_CONTENT = ce('div');
    HEADER_CONTENT.classList.add('header-content');
    HEADER_CONTENT.appendChild(ce('slot'));

    const HEADER = ce('header'); 
    HEADER.appendChild(HEADER_CONTENT);

    const HEADER_SHADOW = ce('div');
    HEADER_SHADOW.classList.add('header-shadow')

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);
    
    [
      ELEMENT_STYLES, 
      HEADER,
      HEADER_SHADOW
    ].forEach(el => this.shadowRoot.appendChild(el));
  }
}
customElements.define('audiosync-header', AudioSyncHeader);
