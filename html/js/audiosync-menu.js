import {
  animateElement,
  fadeIn,
  fadeOut,
  svgIcon
} from './helpers.js';

/**
 * menu drawer element
 */
class AudioSyncMenu extends HTMLElement {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    const sheet = document.createElement('style');
    sheet.textContent = `
      .allow-clicks {
        pointer-events: none;
        display: none;
      }
      #click-blocker {
        position: absolute;
        top:0;
        bottom:0;
        left:0;
        right:0;
        background-color: rgba(0, 0, 0, 0.2);
        pointer-events: all;
        z-index:1;
      }
      .wrapper {
        position: fixed;
        will-change: auto;
        top:128px;
        left:0;
        right:0;
        height: 100%;
        overflow: auto;
        overflow-x: hidden;
        padding: 0px;
        -webkit-overflow-scrolling: touch;
        text-align: center;
        height: 595px;
      }
      header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 128px;
        background-color: var(--main-color);
        color: var(--text-color);
        will-change: auto;
      }
      .header-content {
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header-shadow {
        height: 6px;
        box-shadow: inset 0px 5px 6px -3px rgba(0,0,0,0.4);
        position: absolute;
        will-change: auto;
        top: 128px;
        left: 0;
        right: 0;
        pointer-events: none;
        z-index: 1;
      }
      .menu {
        position: absolute;
        top:0;
        bottom:0;
        left:0;
        width: 300px;
        background-color: #ffffff;
        color: var(--text-color);
        z-index: 2;
        transform: translateX(-320px);
        box-shadow: 10px 0 0px rgba(0, 1, 0, 0.1);
      }
      .menu-foot {
        bottom: 0;
        left:0;
        right:0;
        position: absolute;
      }
      .menu-button {
        padding: 12px;
        display: flex;
        color: #333333;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        border-top: 1px solid #3333333d;
        position: relative;
        overflow: hidden;
      }
      .menu-button div {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
      }
      svg {
        width:24px;
        height:24px;
        display: flex;
      }
    `;
    // blocks clicks from background elements
    this.blocker = document.createElement('div');
    this.blocker.id = 'click-blocker';
    this.blocker.classList.add('allow-clicks');
    this.blocker.addEventListener('click', _ => this.close());

    //  menu header
    const headerContent = document.createElement('div');
    headerContent.classList.add('header-content');
    
    const header = document.createElement('header'); 
    header.appendChild(headerContent);
    
    const headerShadow = document.createElement('div');
    headerShadow.classList.add('header-shadow')
    
    //  scrollable section 
    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    wrapper.appendChild(document.createElement('slot'));
    
    this.foot = document.createElement('div');
    this.foot.classList.add('menu-foot');
    
    this.menu = document.createElement('div');
    this.menu.classList.add('menu');
    [
      header,
      headerShadow,
      wrapper,
      this.foot
    ].forEach(el => this.menu.appendChild(el));

    const shadow = this.attachShadow({
      mode: "open"
    });
    [
      sheet,
      this.blocker,
      this.menu
    ].forEach(el => shadow.appendChild(el));
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    this.setAttribute('opened', 0);
  }

  /**
   * open menu drawer
   */
  async open() {
    fadeIn(this.blocker);
    this.blocker.classList.remove('allow-clicks');
    await animateElement(this.menu, `translateX(0px)`, 250);
    this.setAttribute('opened', 1);
  }

  /**
   * close menu drawer
   */
  async close() {
    fadeOut(this.blocker);
    await animateElement(this.menu, `translateX(-320px)`, 250);
    this.blocker.classList.add('allow-clicks');
    this.setAttribute('opened', 0);
  }

  /**
   * adds a elements to footer of 
   * 
   * @param {String} text 
   */
  async footElement(text) {
    // empty the footer
    this.foot.innerHTML = '';
    
    const fsText = document.createElement('div');
    fsText.textContent = `music: ${text}`;
    
    const dummyButton = document.createElement('div');
    [
      await svgIcon('data'),
      fsText
    ].forEach(el => dummyButton.appendChild(el));
    dummyButton.classList.add('menu-button');
              
    this.foot.appendChild(dummyButton);
  }
}
customElements.define('audiosync-menu', AudioSyncMenu);