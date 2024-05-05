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
    this.animateScroll = this.animateScroll.bind(this)
    const sheet = document.createElement('style');
    sheet.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      .ripple {
        position: relative;
        overflow: hidden;
        transform: translate3d(0, 0, 0);
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
      .fab {
        overflow: hidden;
        background: var(--main-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-sizing: border-box;
        color: var(--text-color);
        cursor: pointer;
        height: 56px;
        min-width: 0;
        outline: none;
        padding: 16px;
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 56px;
        -webkit-tap-highlight-color: transparent;
        box-shadow:0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12),0 2px 4px -1px rgba(0,0,0,0.4);
        z-index: 2;
      }
      .fab:after {
        display: inline-block;
        z-index: -1;
        width: 100%;
        height: 100%;
        opacity: 0;
        border-radius: 50%;
        transition: opacity 150ms cubic-bezier(.33,.17,.85,1.1);
        box-shadow: 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12), 0 5px 5px -3px rgba(0,0,0,.4);
        content:' ';
        position: absolute;
        top: 0;
        left: 0;
      }
      .fab:hover:after {
        opacity: 1;
      }
      .fab:hover:active:after {
        opacity: 0;
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

    // floating action button
    const svg = svgIcon(
      "M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z", 
      false
    );

    const fab = document.createElement('div');
    fab.appendChild(svg);
    fab.classList.add('fab');
    fab.style.transform = 'translateY(80px)';
    fab.onClick(e => {
      createRipple(e);
      this.animateScroll();
    });

    // content body
    this.content = document.createElement('div');
    this.content.appendChild(document.createElement('slot'));

    // scrollable content container
    this.container = document.createElement('div');
    this.container.classList.add('wrapper');
    this.container.onscroll = e => {
      // no action button on podcasts (animation bug)
      const currentPage = qs('audiosync-pages').getAttribute('selected');
      if (currentPage > 0 ) return;

      // control action button
      const scrollTop = this.container.scrollTop;
      if (scrollTop < last_top) {
        animateElement(fab, "translateY(80px)", animateTime);
      } else if (scrollTop != 0) {
        animateElement(fab, "translateY(0px)", animateTime);
      } else {
        animateElement(fab, "translateY(80px)", animateTime);
      }
      last_top = scrollTop;
    };
    [
      this.content,
      fab
    ].forEach(el => this.container.appendChild(el));
    const shadow = this.attachShadow({mode: "open"});
    [
      sheet,
      this.container
    ].forEach(el => shadow.appendChild(el));
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
