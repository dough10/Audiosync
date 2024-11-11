import {qs, ce, createRipple, convertToHex, getContrastColor, objectToCSS} from './helpers.js';

/**
 * pages
 */
class FloatingActionButton extends HTMLElement {
  static get observedAttributes() {
    return ['color', 'disabled', 'noshadow'];
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    const CSS_OBJECT = {
      '.fab': {
        overflow: 'hidden',
        color: 'var(--contrast-color)',
        background: 'var(--pop-color)',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        'border-radius': '50%',
        'box-sizing': 'border-box',
        cursor: 'pointer',
        height: '56px',
        'min-width': 0,
        outline: 'none',
        padding: '16px',
        width: '56px',
        '-webkit-tap-highlight-color': 'transparent',
        'box-shadow': '0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12),0 2px 4px -1px rgba(0,0,0,0.4)',
        transition: 'var(--button-bg-animation)'
      },
      '.fab > *': {
        'pointer-events': 'none'
      },
      '.fab:after': {
        display: 'inline-block',
        'z-index': -1,
        width: '100%',
        height: '100%',
        opacity: 0,
        'border-radius': '50%',
        transition: 'opacity 150ms cubic-bezier(.33,.17,.85,1.1)',
        'box-shadow': '0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.4)',
        content: '" "',
        position: 'absolute',
        top: 0,
        left: 0
      },
      '.fab:hover:after': {
        opacity: 1
      },
      '.fab:hover:active:after': {
        opacity: 0
      },
      '.fab[disabled]': {
        background: 'rgba(84, 84, 84, 0.4)',
        color: '#ffffff',
        'box-shadow': 'none',
        cursor: 'none',
        'pointer-events': 'none'
      },
      '.fab[disabled]:active, .fab[disabled]:hover, .fab[disabled]:active:hover': {
        'box-shadow': 'none',
        'background-color': 'rgba(0, 0, 0, 0.178)'
      },
      '.fab[noshadow], .fab[noshadow]:hover, .fab[noshadow]:hover:after, .fab[noshadow]:after': {
        'box-shadow': 'none'
      },
      '.fab[noshadow]:active': {
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)'
      },
      '@keyframes ripple-animation': {
        to: {
          transform: 'scale(4)',
          opacity: 0
        }
      },
      '.ripple-effect': {
        position: 'absolute',
        'border-radius': '50%',
        background: 'var(--contrast-color)',
        animation: 'ripple-animation 0.7s linear'
      }
    };

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);
    
    this._fab = ce('div');
    this._fab.classList.add('fab');
    this._fab.appendChild(ce('slot'));
    this._fab.addEventListener('transitionend', _ => {
      if (this._fab.classList.contains('onscreen')) {
        this.toggleAttribute('onscreen');
        return;
      }
      this.removeAttribute('onscreen');
    })
    this._fab.addEventListener('click', e => {
      if (this.hasAttribute('disabled')) return;
      createRipple(e);
    });
    
    [
      ELEMENT_STYLES,
      this._fab
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * attribute has changed
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  async attributeChangedCallback(name, oldVal, newVal) {
    if (['disabled','noshadow'].includes(name)) {
      // reflect attribute changes to the button element
      if (this.hasAttribute(name)) {
        this._fab.setAttribute(name, '');
      } else {
        this._fab.removeAttribute(name);
      }
    } else if (name === 'color') {
      const color = convertToHex(newVal);
      const contrast = getContrastColor(color);
      this.style.setProperty('--pop-color', color);
      this.style.setProperty('--contrast-color', contrast);
    }
  }

  /**
   * add's an click event listener
   * @function
   * @public
   * 
   * @param {Function} cb callback function
   */
  onClick(cb) {
    const CALLBACK = e => {
      if (this.hasAttribute('disabled')) return;
      cb(e);
    }
    this._fab.addEventListener('click', CALLBACK);
  }

}
customElements.define('audiosync-fab', FloatingActionButton);
