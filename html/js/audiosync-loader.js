import {
  elementHeight,
  animateElement
} from './helpers.js';

/**
 * application loading element
 */
class AudioSyncLoader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    
    this.loader = document.createElement('div');
    this.loader.classList.add('load')
    this.loader.appendChild(document.createElement('slot'))
    const sheet = document.createElement('style');
    sheet.textContent = `
      .load {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgb(182, 182, 182);
        justify-content: center;
        display: flex;
        align-items: center;
        z-index:3;
        text-transform: uppercase;
        pointer-events: all;
        overflow: hidden;
        font-size: 1.5em;
        z-index: 8;
        color: #333333;
      }
    `;
    [
      sheet,
      this.loader
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  async reveal() {
    // reveals the app interface
    await animateElement(this.loader, `translateY(-${elementHeight(this.loader)}px) `, 350);
    // fixes any height issues when resizing the window
    window.addEventListener('resize', _ => {
      this.loader.style.transform = `translateY(-${elementHeight(this.loader)}px)`;
    });
  }
}
customElements.define('audiosync-loader', AudioSyncLoader);
