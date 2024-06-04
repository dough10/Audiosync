import {
  qs,
  svgIcon,
  objectToCSS,
  ce
} from './helpers.js';

/**
 * scroll area with a back to top action button
 */
class ScrollElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this._lastTop = 0;

    this.animateScroll = this.animateScroll.bind(this);

    const cssObj = {
      "@keyframes ripple-animation": {
        to: {
          transform: "scale(2)",
          opacity: 0
        }
      },
      ".ripple-effect": {
        position: "absolute",
        "border-radius": "50%",
        background: "rgba(255, 255, 255, 0.4)",
        animation: "ripple-animation 0.7s linear"
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
        background: "var(--background-color)",
        "scroll-behavior": "smooth"
      },
      '@media screen and (min-width: 1200px)': {
        '.wrapper': {
          left: "300px"
        }
      },
      ".wrapper::-webkit-scrollbar": {
        width: 0
      },
      svg: {
        width: "24px",
        height: "24px",
        display: "flex"
      },
      'audiosync-fab': {
        transition: 'transform 300ms cubic-bezier(.33,.17,.85,1.1)',
        position: 'fixed',
        bottom: '25px',
        right: '20px',
        'z-index': 1,
        transform: 'translateY(85px)'
      },
      '.onscreen': {
        transform: 'translateY(0)'
      }
    };

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    // floating action button
    this.fab = ce('audiosync-fab');
    svgIcon("up").then(svg => this.fab.appendChild(svg));
    this.fab.onClick(this.animateScroll);

    // content body
    this.content = ce('div');
    this.content.appendChild(ce('slot'));

    // scrollable content container
    this.container = ce('div');
    this.container.classList.add('wrapper');
    this.container.onscroll = this._containerScrolled.bind(this);
  
    const scrollTarget = ce('div');
    scrollTarget.id = 'top';

    // fill container
    [
      scrollTarget,
      this.content
    ].forEach(el => this.container.appendChild(el));
    
    // fill shadow dom
    [
      sheet,
      this.fab,
      this.container
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * animate action button visable on screen
   */
  onScreen() {
    return new Promise(resolve => {
      const tend = _ => {
        this.fab.removeEventListener('transitionend', tend);
        resolve();
      }
      this.fab.addEventListener('transitionend', tend);
      requestAnimationFrame(_ => this.fab.classList.add('onscreen'));
    });
  }
  
  /**
   * animate action button off screen
   */
  offScreen() {
    return new Promise(resolve => {
      const tend = _ => {
        this.fab.removeEventListener('transitionend', tend);
        resolve();
      }
      this.fab.addEventListener('transitionend', tend);
      requestAnimationFrame(_ => this.fab.classList.remove('onscreen'));
    });
  }

  /**
   * container scrolled
   * 
   * @returns {void}
   */
  _containerScrolled() {
    const fab = qs('audiosync-fab', this.shadowRoot);
    // no action button on podcasts (animation bug)
    const currentPage = qs('audiosync-pages').getAttribute('selected');
    if (currentPage > 0 ) return;

    // control action button
    const scrollTop = this.container.scrollTop;
    if (scrollTop < this._lastTop) {
      this.offScreen();
    } else if (scrollTop != 0) {
      this.onScreen();
    } else {
      this.offScreen();
    }
      this._lastTop = scrollTop;
  }

  /**
   * converts 1 number range to be in another number's range
   * 
   * @param {Number} value
   * @param {Number} low1
   * @param {Number} low2
   * @param {Number} high1
   * @param {Number} high2
   * 
   * @returns {Number} number in the new range
   */
  _mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  /**
   * animate scroll to top of the page
   * moves content down the page and when content reaches what would be the top position the page snaps back into original position
   * 
   * @returns {Promise<Void>} Nothing
   */
  animateScroll() {
    const target= qs('#top', this.shadowRoot);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
customElements.define('scroll-element', ScrollElement);
