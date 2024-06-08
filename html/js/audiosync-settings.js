import {ce, svgIcon, sleep, objectToCSS} from './helpers.js';

/**
 * application settings drawer
 */
class AudioSyncSettings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    const cssObj = {
      ".settings": {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
        "overflow-x": "hidden",
        position: "fixed",
        "will-change": "transform",
        "z-index": 10,
        transition:'transform 300ms cubic-bezier(.33,.17,.85,1.1)',
        transform: 'translateY(100%)',
        "background-color": "var(--background-color)"
      },
      '.opened':{
        transform: 'translateY(0)'
      },
      header: {
        height: "65px",
        "background-color": "var(--main-color)"
      },
      ".header-content": {
        "padding": "12px",
        "display": "flex",
        "justify-content": "right",
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
      },
      svg: {
        width: "24px",
        height: "24px"
      },
      ".wrapper": {
        position: "fixed",
        "will-change": "auto",
        top: "var(--header-height)",
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
        "overflow-x": "hidden",
        padding: "8px",
        "-webkit-overflow-scrolling": "touch",
        "text-align": "center",
        background: "var(--background-color)"
      },
      ".card": {
        color: "var(--text-color)",
        "max-width": "675px",
        "min-width": "280px",
        padding: "8px",
        background: "var(--main-color)",
        position: "relative",
        margin: "auto",
        "border-radius": "20px",
        "margin-bottom": "100px",
        "box-shadow": "0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)",
        "text-align": "center",
        overflow: 'hidden'
      }
    };

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    const close = ce('audiosync-small-button');
    svgIcon('close').then(svg => close.appendChild(svg));
    close.setAttribute('color', 'var(--close-red)');
    close.onClick(async _ => {
      await sleep(200);
      this.close();
    });

    const headerContent = ce('div');
    headerContent.classList.add('header-content');
    headerContent.appendChild(close);
    
    const header = ce('header');
    header.appendChild(headerContent);
    
    const headerShadow = ce('div');
    headerShadow.classList.add('header-shadow');
    
    const card = ce('div');
    card.classList.add('card');
    card.appendChild(ce('slot'));
    
    const wrapper = ce('div');
    wrapper.classList.add('wrapper');
    wrapper.appendChild(card);
    
    this.drawer = ce('div');
    this.drawer.classList.add('settings');
    this.drawer.addEventListener('transitionend', _ => this.toggleAttribute('opened'));

    [
      header,
      headerShadow,
      wrapper
    ].forEach(el => this.drawer.appendChild(el));

    [
      sheet,
      this.drawer
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * open the settings drawer
   */
  async open() {
    requestAnimationFrame(_ => this.drawer.classList.add('opened'));
    
  }

  /**
   * close the settings drawer
   */
  async close() {
    requestAnimationFrame(_ => this.drawer.classList.remove('opened'));   
  }
}
customElements.define('audiosync-settings', AudioSyncSettings);
