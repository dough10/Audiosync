import {ce, svgIcon, sleep, objectToCSS} from './helpers.js';

/**
 * application settings drawer
 */
class AudioSyncSettings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    const CSS_OBJECT = {
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
        padding: "8px 8px 60px 8px",
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

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    const CLOSE_BUTTON = ce('audiosync-small-button');
    CLOSE_BUTTON.appendChild(svgIcon('close'));
    CLOSE_BUTTON.setAttribute('color', 'var(--close-red)');
    CLOSE_BUTTON.onClick(async _ => {
      await sleep(200);
      this.close();
    });

    const HEADER_CONTENT = ce('div');
    HEADER_CONTENT.classList.add('header-content');
    HEADER_CONTENT.appendChild(CLOSE_BUTTON);
    
    const HEADER = ce('header');
    HEADER.appendChild(HEADER_CONTENT);
    
    const HEADER_SHADOW = ce('div');
    HEADER_SHADOW.classList.add('header-shadow');
    
    const CARD_BACKGROUND = ce('div');
    CARD_BACKGROUND.classList.add('card');
    CARD_BACKGROUND.appendChild(ce('slot'));
    
    const CONTENT_WRAPPER = ce('div');
    CONTENT_WRAPPER.classList.add('wrapper');
    CONTENT_WRAPPER.appendChild(CARD_BACKGROUND);
    
    this.drawer = ce('div');
    this.drawer.classList.add('settings');
    this.drawer.addEventListener('transitionend', _ => this.toggleAttribute('opened'));

    [
      HEADER,
      HEADER_SHADOW,
      CONTENT_WRAPPER
    ].forEach(el => this.drawer.appendChild(el));

    [
      ELEMENT_STYLES,
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
