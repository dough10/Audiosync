import {qs, createRipple, hexToRgba, generateRandomString, parseCSS, getCSSVariableValue, objectToCSS, convertToHex} from './helpers.js';

class MenuButton extends HTMLElement {
  static get observedAttributes() {
    return ['disabled'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this.disabledColor = getCSSVariableValue('--disabled-color');

    const cssJSON = {
      ".menu-button": {
        "padding": "12px",
        "cursor": "pointer",
        "display": "flex",
        "color": "#333333",
        "justify-content": "space-between",
        "align-items": "center",
        "font-size": "16px",
        "border-bottom": "1px solid #3333333d",
        "position": "relative",
        "overflow": "hidden"
      },
      ".menu-button > *": {
        "pointer-events": "none"
      },
      ".menu-button div": {
        "width": "100%",
        "display": "flex",
        "justify-content": "center",
        "align-items": "center",
        "text-transform": "uppercase"
      },
      ".menu-button:hover": {
        "background-color": "var(--hover-color)"
      },
      ".menu-button[disabled]": {
        "background": "rgba(218, 218, 218, 0.4)",
        "color": "undefined",
        "cursor": "none",
        "pointer-events": "none"
      },
      ".menu-button[disabled]:active, .menu-button[disabled]:hover, .menu-button[disabled]:active:hover": {
        "background-color": "rgba(0, 0, 0, 0.178)"
      },
      "@keyframes ripple-animation": {
        "to": {
          "transform": "scale(4)",
          "opacity": "0"
        }
      },
      ".ripple-effect": {
        "position": "absolute",
        "border-radius": "50%",
        "background": "rgba(51, 51, 51, 0.4)",
        "animation": "ripple-animation 0.7s linear"
      }
    };

    const style = document.createElement('style');
    style.textContent = objectToCSS(cssJSON);

    const button = document.createElement('div');
    button.classList.add('menu-button');
    button.appendChild(document.createElement('slot'));
    button.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    });
    
    [
      style,
      button
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * element connected to DOM
   * 
   * modifys document css to fix style nested in the custom element
   */
  connectedCallback() {
    // capture document styles
    const styles = qs('style').textContent;

    // convert css string to an object
    const css = parseCSS(styles);

    css['audiosync-menu-button > div'] = {
      'width': '100%',
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'text-transform': 'uppercase'
    }

    qs('style').textContent = objectToCSS(css);
  }

  /**
   * set the color of the button icon
   * modifys styles for document and shadowRoot to fix ripple animation and icon color
   * 
   * @param {String} color 
   */
  iconColor(color) {
    if (!this.id) {
      this.id = generateRandomString();
    }

    // ensure the color is hex code
    color = convertToHex(color);

    // <body> change the icon color
    // parse string to object
    const css = parseCSS(qs('style').textContent);
    
    // create / update styles
    css[`#${this.id} > svg`] = {
      'color': color
    };
    css[`#${this.id}[disabled] > svg`] = {
      'color': this.disabledColor
    };
    
    // apply new styles
    qs('style').textContent = objectToCSS(css);
    
    // <custom-element> change the click ripple color
    //  capture styles
    const shadowCss = parseCSS(qs('style', this.shadowRoot).textContent);

    // update ripple styles
    shadowCss['.ripple-effect'].background = hexToRgba(color);

    // apply updated styles. 
    qs('style', this.shadowRoot).textContent = objectToCSS(shadowCss);
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
    }
  }
}
customElements.define('audiosync-menu-button', MenuButton);