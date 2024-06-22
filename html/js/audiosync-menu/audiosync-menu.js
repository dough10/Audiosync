import {sleep, svgIcon, ce} from '../helpers.js';

/**
 * menu drawer element
 */
class AudioSyncMenu extends HTMLElement {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    this.attachShadow({mode: "open"});

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", "./js/audiosync-menu/audiosync-menu.css");

    // blocks clicks from background elements
    this.backdrop = ce('div');
    this.backdrop.classList.add('backdrop');
    this.backdrop.addEventListener('click', _ => this.close());

    //  menu header
    const HEADER_CONTENT = ce('div');
    HEADER_CONTENT.classList.add('header-content');
    
    const HEADER = ce('header'); 
    HEADER.appendChild(HEADER_CONTENT);
    
    const HEADER_SHADOW = ce('div');
    HEADER_SHADOW.classList.add('header-shadow');

    //  scrollable section 
    const MENU_CONTENT = ce('div');
    MENU_CONTENT.classList.add('wrapper');
    MENU_CONTENT.appendChild(ce('slot'));
    
    this.foot = ce('div');
    this.foot.classList.add('menu-foot');
    
    this.menu = ce('nav');
    this.menu.classList.add('menu');

    [
      HEADER,
      HEADER_SHADOW,
      MENU_CONTENT,
      this.foot
    ].forEach(el => this.menu.appendChild(el));

    [
      elementStyles,
      this.menu,
      this.backdrop
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * open menu drawer
   */
  async open() {
    await sleep(100);
    requestAnimationFrame(_ => {
      if (!this.menu.hasAttribute('open')) this.menu.toggleAttribute('open');
    });
  }

  /**
   * close menu drawer
   */
  async close() {
    requestAnimationFrame( _ => this.menu.removeAttribute('open'));
  }

  /**
   * adds a elements to footer of 
   * 
   * @param {String} text 
   */
  async footElement(text) {
    // empty the footer
    this.foot.innerHTML = '';
    
    const FILESIZE_TEXT = ce('div');
    FILESIZE_TEXT.textContent = `music: ${text}`;
    
    const ICON = await svgIcon('data');

    const DUMMY_BUTTON = ce('div');
    DUMMY_BUTTON.classList.add('menu-button');
    [
      ICON,
      FILESIZE_TEXT
    ].forEach(el => DUMMY_BUTTON.appendChild(el));
              
    this.foot.appendChild(DUMMY_BUTTON);
  }
}
customElements.define('audiosync-menu', AudioSyncMenu);
