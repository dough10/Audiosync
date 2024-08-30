import {
  objectToCSS,
  ce
} from './helpers.js';


/**
 * material design switch
 */
class AudioSyncSwitch extends HTMLElement {
  constructor() {
    super();

    const CSS_OBJECT = {
      '.audiosync-switch': {
        'z-index': 0,
        'position': 'relative',
        'display': 'inline-block',
        'color': 'var(--text-color)',
        'font-family': 'var(--font-family)',
        'font-size': '16px',
        'line-height': 1.5,
        'width': '450px',
        'margin': '48px auto 0px'
      },
      '.audiosync-switch > input': {
        'appearance': 'none',
        '-moz-appearance': 'none',
        '-webkit-appearance': 'none',
        'z-index': -1,
        'position': 'absolute',
        'right': '6px',
        'top': '-8px',
        'display': 'block',
        'margin': 0,
        'border-radius': '50%',
        'width': '40px',
        'height': '40px',
        'background-color': 'rgba(0, 0, 0, 0.38)',
        'outline': 'none',
        'opacity': 0,
        'transform': 'scale(1)',
        'pointer-events': 'none',
        'transition': 'opacity 0.3s 0.1s, transform 0.2s 0.1s'
      },
      '.audiosync-switch > span': {
        'display': 'inline-block',
        'width': '100%',
        'cursor': 'pointer',
        'text-transform': 'uppercase',
        'text-align': 'justify'
      },
      '.audiosync-switch > span::before': {
        'content': '\'\'',
        'float': 'right',
        'display': 'inline-block',
        'margin': '5px 0 5px 10px',
        'border-radius': '7px',
        'width': '36px',
        'height': '14px',
        'background-color': 'rgba(0, 0, 0, 0.38)',
        'vertical-align': 'top',
        'transition': 'background-color 0.2s, opacity 0.2s'
      },
      '.audiosync-switch > span::after': {
        'content': '\'\'',
        'position': 'absolute',
        'top': '2px',
        'right': '16px',
        'border-radius': '50%',
        'width': '20px',
        'height': '20px',
        'background-color': 'rgb(var(--main-rgb))',
        'box-shadow': '0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',
        'transition': 'background-color 0.2s, transform 0.2s'
      },
      '.audiosync-switch > input:checked': {
        'right': '-10px',
        'background-color': 'rgb(var(--pop-rgb, 33, 150, 243))'
      },
      '.audiosync-switch > input:checked + span::before': {
        'background-color': 'rgba(var(--pop-rgb), 0.6)'
      },
      '.audiosync-switch > input:checked + span::after': {
        'background-color': 'rgb(var(--pop-rgb, 33, 150, 243))',
        'transform': 'translateX(16px)'
      },
      '.audiosync-switch:hover > input': {
        'opacity': 0.04
      },
      '.audiosync-switch > input:focus': {
        'opacity': 0.12
      },
      '.audiosync-switch:hover > input:focus': {
        'opacity': 0.16
      },
      '.audiosync-switch > input:active': {
        'opacity': 1,
        'transform': 'scale(0)',
        'transition': 'transform 0s, opacity 0s'
      },
      '.audiosync-switch > input:active + span::before': {
        'background-color': 'rgba(var(--pop-rgb), 0.6)'
      },
      '.audiosync-switch > input:checked:active + span::before': {
        'background-color': 'rgba(0, 0, 0, 0.38)'
      },
      '.audiosync-switch > input:disabled': {
        'opacity': 0
      },
      '.audiosync-switch > input:disabled + span': {
        'color': 'rgb(var(--pure-material-onsurface-rgb, 0, 0, 0))',
        'opacity': 0.38,
        'cursor': 'default'
      },
      '.audiosync-switch > input:disabled + span::before': {
        'background-color': 'rgba(0, 0, 0, 0.38)'
      },
      '.audiosync-switch > input:checked:disabled + span::before': {
        'background-color': 'rgba(var(--pop-rgb), 0.6)'
      }
    };

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.input = ce('input');
    this.input.type = 'checkbox';

    const SPAN_ELEMENT = ce('span');
    SPAN_ELEMENT.appendChild(ce('slot'));

    const LABEL_TEXT = ce('label');
    LABEL_TEXT.classList.add('audiosync-switch');
    [
      this.input,
      SPAN_ELEMENT
    ].forEach(el => LABEL_TEXT.appendChild(el));
    
    this.attachShadow({mode: 'open'});
    [
      ELEMENT_STYLES,
      LABEL_TEXT
    ].forEach(el => this.shadowRoot.appendChild(el));

    this.input.onchange = async _ => {

      this.setAttribute(this.input.checked, Number(this.input.checked));

      const CUSTOM_EVENT = new CustomEvent('statechange', {
        detail:{id: this.id, state: Number(this.input.checked)}
      });
      this.dispatchEvent(CUSTOM_EVENT);

    };
  }

  /**
   * set the state of the input element
   * 
   * @param {Number} newState
   */
  setState(newState) {
    this.input.checked = Boolean(newState);
    this.setAttribute('state', Number(newState));
  }

  /**
   * gets the state of the input element
   */
  state() {
    return Number(this.input.checked);
  }
}
customElements.define('audiosync-switch', AudioSyncSwitch);
