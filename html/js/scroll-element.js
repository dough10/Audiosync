import {
  animateElement,
  qs,
  svgIcon,
  createRipple
} from './helpers.js';

/**
 * scroll area with a back to top action button
 */
class ScrollElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.animateScroll = this.animateScroll.bind(this)
    const sheet = document.createElement('style');
    sheet.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        animation: ripple-animation 0.7s linear;
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
        scroll-behavior: smooth;
      }
      .wrapper::-webkit-scrollbar {
        width: 0; /* Hide scrollbar */
      }
      audiosync-fab {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 2;
      }
      svg {
        width:24px;
        height:24px;
        display: flex;
      }
    `;
    // action button animation time
    const animateTime = 200;

    // scroll position memory
    let last_top = 0;

    // fab positions
    const onScreen = "translateY(0px)";
    const offScreen = "translateY(88px)";

    // floating action button
    const fab = document.createElement('audiosync-fab');
    svgIcon("up").then(svg => fab.appendChild(svg));
    fab.style.transform = offScreen;
    fab.onClick(this.animateScroll);

    // content body
    this.content = document.createElement('div');
    this.content.appendChild(document.createElement('slot'));

    // scrollable content container
    this.container = document.createElement('div');
    this.container.classList.add('wrapper');
    this.container.onscroll = _ => {
      // no action button on podcasts (animation bug)
      const currentPage = qs('audiosync-pages').getAttribute('selected');
      if (currentPage > 0 ) return;

      // control action button
      const scrollTop = this.container.scrollTop;
      if (scrollTop < last_top) {
        animateElement(fab, offScreen, animateTime);
      } else if (scrollTop != 0) {
        animateElement(fab, onScreen, animateTime);
      } else {
        animateElement(fab, offScreen, animateTime);
      }
      last_top = scrollTop;
    };

    // fill container
    [
      this.content,
      fab
    ].forEach(el => this.container.appendChild(el));

    // fill shadow dom
    [
      sheet,
      this.container
    ].forEach(el => this.shadowRoot.appendChild(el));
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
    return new Promise(async resolve => {
      const maxScrollTop = Math.max(
        this.container.scrollHeight - this.container.clientHeight,
        0
      );
      // set animation time based on distance scrolled down the page
      const time = this._mapRange((this.container.scrollTop / maxScrollTop), 0, 1, 100, 600);
      await animateElement(this.content, `translateY(${this.container.scrollTop}px)`, time);
      this.content.style.removeProperty('transform');
      this.container.scrollTop = 0;
      resolve();
    });
  }
}
customElements.define('scroll-element', ScrollElement);
