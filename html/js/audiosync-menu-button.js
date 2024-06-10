import {qs, ce, createRipple, hexToRgba, generateRandomString, parseCSS, getCSSVariableValue, objectToCSS, convertToHex} from './helpers.js';

class MenuButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled','color','percent'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    const CSS_OBJECT = {
      ".menu-button": {
        padding: "12px",
        cursor: "pointer",
        display: "flex",
        color: "var(--text-color)",
        "justify-content": "space-between",
        "align-items": "center",
        "font-size": "16px",
        "border-bottom": "var(--seperator-line)",
        position: "relative",
        overflow: "hidden",
        'will-change': 'background',
        transition: 'var(--button-bg-animation)',
        'max-width': '350px'
      },
      ".menu-button > *": {
        "pointer-events": "none"
      },
      ".menu-button div": {
        width: "100%",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        "text-transform": "uppercase"
      },
      ".menu-button:hover": {
        "background-color": "var(--hover-color)"
      },
      ".menu-button[disabled]": {
        background: "rgba(218, 218, 218, 0.2)",
        color: 'var(--disabled-color)',
        cursor: "none",
        "pointer-events": "none"
      },
      ".menu-button[disabled]:active, .menu-button[disabled]:hover, .menu-button[disabled]:active:hover": {
        "background-color": "rgba(0, 0, 0, 0.178)"
      },
      "@keyframes ripple-animation": {
        to: {
          transform: "scale(4)",
          opacity: 0
        }
      },
      ".ripple-effect": {
        position: "absolute",
        "border-radius": "50%",
        background: "rgba(var(--pop-rgb), 0.4)",
        animation: "ripple-animation 0.7s linear"
      },
      '.prog_wrapper': {
        position: 'absolute',
        bottom: 0,
        left:0,
        right:0,
        height: '5px'
      },
      '.prog_bar': {
        position: 'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        background: 'var(--pop-color)',
        transform: 'translateX(-100%)'
      },
      '.menu-button[disabled] .prog_bar': {
        background: 'var(--disabled-color)'
      }
    };

    this.bar = ce('div');
    this.bar.classList.add('prog_bar');

    const PROGRESS_WRAPPER = ce('div');
    PROGRESS_WRAPPER.classList.add('prog_wrapper');
    PROGRESS_WRAPPER.appendChild(this.bar);

    const BUTTON_ELEMENT = ce('div');
    BUTTON_ELEMENT.classList.add('menu-button');
    BUTTON_ELEMENT.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    });
    [
      ce('slot'),
      PROGRESS_WRAPPER
    ].forEach(el => BUTTON_ELEMENT.appendChild(el));
    
    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    [
      ELEMENT_STYLES,
      BUTTON_ELEMENT
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * element connected to DOM
   * 
   * modifys document css to fix style of elements nested in the custom element
   */
  connectedCallback() {
    const DOCUMENT_STYLES = parseCSS(qs('style').textContent);

    DOCUMENT_STYLES['audiosync-menu-button > div'] = {
      width: '100%',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'text-transform': 'uppercase'
    };

    qs('style').textContent = objectToCSS(DOCUMENT_STYLES);
  }

  /**
   * set the color of the button icon
   * modifys styles for document and shadowRoot to fix ripple animation and icon color
   * 
   * @param {String} color 
   */
  _iconColor(color) {
    if (!this.id) {
      this.id = generateRandomString();
    }

    // ensure the color is hex code
    const HEX_COLOR = convertToHex(color);

    // <body> change the icon color
    // parse string to object
    const DOCUMENT_STYLES = parseCSS(qs('style').textContent);
    
    // create / update styles
    DOCUMENT_STYLES[`#${this.id} > svg`] = {
      color: HEX_COLOR
    };
    DOCUMENT_STYLES[`#${this.id}[disabled] > svg`] = {
      color: 'var(--disabled-color)'
    };
    
    // apply new styles
    qs('style').textContent = objectToCSS(DOCUMENT_STYLES);
    
    // <custom-element> change the click ripple color
    //  capture styles
    const SHADOW_STYLES = parseCSS(qs('style', this.shadowRoot).textContent);

    // update ripple styles
    SHADOW_STYLES['.ripple-effect'].background = hexToRgba(HEX_COLOR);
    SHADOW_STYLES['.prog_bar'].background = HEX_COLOR;

    // apply updated styles. 
    qs('style', this.shadowRoot).textContent = objectToCSS(SHADOW_STYLES);
  }

  /**
   * add's an click event listener
   * 
   * @param {Function} cb callback function
   */
  onClick(cb) {
    qs('.menu-button', this.shadowRoot).addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      cb(e);
    });
  }

  /**
   * attribute has changed 
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (name == 'disabled') {
      // reflect attribute changes to the button element
      if (this.hasAttribute(name)) {
        qs('.menu-button', this.shadowRoot).setAttribute(name, '');
      } else {
        qs('.menu-button', this.shadowRoot).removeAttribute(name);
      }
    } else if (name === 'color') {
      this._iconColor(newVal);
    } else if (name === 'percent') {
      this.bar.style.transform = `translateX(-${100 - newVal}%)`;
    }
  }
}
customElements.define('audiosync-menu-button', MenuButton);