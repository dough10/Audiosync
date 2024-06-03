import {objectToCSS, svgIcon, ce} from './helpers.js';

/**
 * menu drawer element
 */
class AudioSyncMenu extends HTMLElement {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    this.attachShadow({mode: "open"});

    const cssObj = {
      ".allow-clicks": {
        "pointer-events": "none",
        opacity:0
      },
      "#click-blocker": {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        'will-change': 'opacity',
        transition: 'opacity 300ms cubic-bezier(.33,.17,.85,1.1)',
        "background-color": "rgba(0, 0, 0, 0.2)",
        "pointer-events": "all",
        "z-index": 1
      },
      ".wrapper": {
        position: "fixed",
        "will-change": "auto",
        top: "128px",
        left: 0,
        right: 0,
        height: "595px",
        overflow: "auto",
        "overflow-x": "hidden",
        padding: "0px",
        "-webkit-overflow-scrolling": "touch",
        "text-align": "center"
      },
      "header": {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "128px",
        "background-color": "var(--main-color)",
        color: "var(--text-color)",
        "box-shadow": "0px 5px 6px 0px rgba(0,0,0,0.4)"
      },
      ".header-content": {
        padding: "12px",
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center"
      },
      ".menu": {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: "300px",
        "background-color": "var(--background-color)",
        color: "var(--text-color)",
        "z-index": 2,
        'will-change': 'transform',
        transition: 'transform 300ms cubic-bezier(.33,.17,.85,1.1)',
        transform: "translateX(-110%)",
        "box-shadow": "10px 0 0px rgba(0, 1, 0, 0.1)"
      },
      '.open': {
        transform: "translateX(0)"
      },
      ".menu-foot": {
        bottom: 0,
        left: 0,
        right: 0,
        position: "absolute"
      },
      ".menu-button": {
        padding: "12px",
        display: "flex",
        color: "var(--text-color)",
        "justify-content": "space-between",
        "align-items": "center",
        "font-size": "16px",
        "border-top": "var(--seperator-line)",
        position: "relative",
        overflow: "hidden"
      },
      ".menu-button div": {
        width: "100%",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        "text-transform": "uppercase"
      },
      svg: {
        width: "24px",
        height: "24px"
      }
    };

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    // blocks clicks from background elements
    this.blocker = ce('div');
    this.blocker.id = 'click-blocker';
    this.blocker.classList.add('allow-clicks');
    this.blocker.style.display = 'none';
    this.blocker.addEventListener('click', _ => this.close());

    //  menu header
    const headerContent = ce('div');
    headerContent.classList.add('header-content');
    
    const header = ce('header'); 
    header.appendChild(headerContent);
    
    //  scrollable section 
    const wrapper = ce('div');
    wrapper.classList.add('wrapper');
    wrapper.appendChild(ce('slot'));
    
    this.foot = ce('div');
    this.foot.classList.add('menu-foot');
    
    this.menu = ce('div');
    this.menu.classList.add('menu');
    this.menu.addEventListener('transitionend', _ => this.toggleAttribute('open'));

    [
      header,
      wrapper,
      this.foot
    ].forEach(el => this.menu.appendChild(el));

    [
      sheet,
      this.blocker,
      this.menu
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * open menu drawer
   */
  async open() {
    const tend = _ => {
      this.blocker.removeEventListener('transitionend', tend);
    };
    this.blocker.addEventListener('transitionend', tend);
    requestAnimationFrame(_ => {
      this.menu.classList.add('open');
      this.blocker.classList.remove('allow-clicks');
      this.blocker.style.removeProperty('display');
    });
  }

  /**
   * close menu drawer
   */
  async close() {
    const tend = _ => {
      this.blocker.removeEventListener('transitionend', tend);
      this.blocker.style.display = 'none';
    };
    this.blocker.addEventListener('transitionend', tend);
    requestAnimationFrame(_ => {
      this.menu.classList.remove('open');
      this.blocker.classList.add('allow-clicks');
    });
  }

  /**
   * adds a elements to footer of 
   * 
   * @param {String} text 
   */
  async footElement(text) {
    // empty the footer
    this.foot.innerHTML = '';
    
    const fsText = ce('div');
    fsText.textContent = `music: ${text}`;
    
    const icon = await svgIcon('data');

    const dummyButton = ce('div');
    dummyButton.classList.add('menu-button');
    [
      icon,
      fsText
    ].forEach(el => dummyButton.appendChild(el));
              
    this.foot.appendChild(dummyButton);
  }
}
customElements.define('audiosync-menu', AudioSyncMenu);
