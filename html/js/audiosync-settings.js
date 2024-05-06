import {
  elementHeight,
  animateElement,
  svgIcon,
  createRipple
} from './helpers.js';

/**
 * application settings drawer
 */
class AudioSyncSettings extends HTMLElement {
  constructor() {
    super();
    this.state = false;
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    const sheet = document.createElement('style');
    sheet.textContent = `
      .settings {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        overflow-x: hidden;
        position: fixed;
        will-change: auto;
        z-index: 10;
        background-color: var(--background-color);
      }
      header {
        height: 65px;
        background-color: #ffffff;
      }
      .header-content {
        padding: 12px;
        display: flex;
        justify-content: right;
        align-items: center;
      }
      .header-shadow {
        height: 6px;
        box-shadow: inset 0px 5px 6px -3px rgba(0,0,0,0.4);
        position: absolute;
        will-change: auto;
        top: var(--header-height);
        left: 0;
        right: 0;
        pointer-events: none;
        z-index: 1;
      }
      svg {
        width:24px;
        height:24px;
        display: flex;
      }
      .wrapper {
        position: fixed;
        will-change: auto;
        top: var(--header-height);
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        overflow-x: hidden;
        padding:8px;
        -webkit-overflow-scrolling: touch;
        text-align: center;
        background: var(--background-color);
      }
      .card {
        color: #333333;
        max-width: 675px;
        min-width: 280px;
        padding: 8px;
        background: #fff;
        position: relative;
        margin: auto;
        border-radius: 3px;
        margin-bottom: 8px;
        box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2);
        text-align: center;
        margin-bottom: 100px;
      }
      audiosync-small-button {
        color: red;
      }
    `;

    const close = document.createElement('audiosync-small-button');
    svgIcon('close').then(svg => close.appendChild(svg));
    close.onClick(e => {
      this.close();
    });

    const headerContent = document.createElement('div');
    headerContent.classList.add('header-content');
    headerContent.appendChild(close);
    
    const header = document.createElement('header');
    header.appendChild(headerContent);
    
    const headerShadow = document.createElement('div');
    headerShadow.classList.add('header-shadow');
    
    const card = document.createElement('div');
    card.classList.add('card');
    card.appendChild(document.createElement('slot'));
    
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    wrapper.appendChild(card);
    
    this.drawer = document.createElement('div');
    this.drawer.classList.add('settings');
    [
      header,
      headerShadow,
      wrapper
    ].forEach(el => this.drawer.appendChild(el));

    const shadow = this.attachShadow({mode: "open"});
    [
      sheet,
      this.drawer
    ].forEach(el => shadow.appendChild(el));

    window.addEventListener('resize', _ => {
      const opened = Number(this.getAttribute('opened'));
      if (!Boolean(opened)) this.drawer.style.transform = `translateY(${elementHeight(this.drawer)}px)`;
    });
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    this.setAttribute('opened', 0);
    this.drawer.style.transform = `translateY(${elementHeight(this.drawer)}px)`;
  }

  /**
   * open the settings drawer
   */
  async open() {
    await animateElement(this.drawer, `translateY(0px) `, 250);
    this.setAttribute('opened', 1);
  }

  /**
   * close the settings drawer
   */
  async close() {
    await animateElement(this.drawer, `translateY(${elementHeight(this.drawer)}px) `, 250);
    this.setAttribute('opened', 0);
  }
}
customElements.define('audiosync-settings', AudioSyncSettings);
