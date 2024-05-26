import {ce, objectToCSS} from './helpers.js';
/**
 * application header
 */
class AudioSyncHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    const cssObj = {
      "header": {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--header-height)",
        "background-color": "var(--main-color)",
        color: "var(--text-color)",
        "will-change": "auto"
      },
      ".header-content": {
        padding: "12px",
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center"
      },
      ".header-shadow": {
        height: "6px",
        "box-shadow": "inset 0px 5px 6px -3px rgba(0,0,0,0.4)",
        position: "absolute",
        "will-change": "auto",
        top: "var(--header-height)",
        left: 0,
        right: 0,
        "pointer-events": "none",
        "z-index": 1
      }
    };

    const headerContent = ce('div');
    headerContent.classList.add('header-content');
    headerContent.appendChild(ce('slot'));

    const header = ce('header'); 
    header.appendChild(headerContent);

    const headerShadow = ce('div');
    headerShadow.classList.add('header-shadow')

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);
    
    [
      sheet, 
      header,
      headerShadow
    ].forEach(el => this.shadowRoot.appendChild(el));
  }
}
customElements.define('audiosync-header', AudioSyncHeader);
