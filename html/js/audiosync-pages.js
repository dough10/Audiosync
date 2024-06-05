import {qs, ce, sleep, fadeIn, fadeOut, getCSSVariableValue, elementHeight, animateHeight} from './helpers.js';

/**
 * pages
 */
class AudioSyncPages extends HTMLElement {
  static get observedAttributes() {
    return ["selected"];
  }
  constructor() {
    super();
    this.animationTime = 200;
    const shadow = this.attachShadow({mode: "open"});
    shadow.appendChild(ce('slot'));
  }

  /**
   * element connected to DOM
   */
  connectedCallback() {
    this.setAttribute('selected', 0);
  }

  /**
   * attribute has changed
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  async attributeChangedCallback(name, oldVal, newVal) {
    const sleepTime = 20;
    
    // when run without lib_data.json one if not both values will be null
    // this gives music-library proirity 
    if (oldVal === null) {
      oldVal = 1;
      newVal = 0;
      await sleep(sleepTime);
    }
    
    if (qs('scroll-element')) qs('scroll-element').top();

    // elements in the customelement "slot"
    const assignedElements = qs('slot', this.shadowRoot).assignedElements({flatten: true}).filter(node => node.nodeType === Node.ELEMENT_NODE);
    if (assignedElements[newVal] && assignedElements[oldVal]) {

      // transition to this page
      const to = assignedElements[newVal];

      // tansition from this page
      const from = assignedElements[oldVal];

      // hide content we are animating from 
      await fadeOut(from, this.animationTime);
      await sleep(sleepTime);

      // enable display of content to be animated into view
      to.style.display = 'block';

      // capture element heights
      const fromHeight = elementHeight(from);
      const toHeight = elementHeight(to);

      const headerHeight = Number(getCSSVariableValue('--header-height').replace('px',''));
      const windowHeight = window.innerHeight - headerHeight;

      // animate height if the content is small enough to see the bottom of the card
      if (toHeight < windowHeight || fromHeight < windowHeight) {

        // set height of new content before hiding old content
        to.style.height = `${fromHeight}px`;
        from.style.display = 'none';

        // let changes "settle" before triggering animations
        await sleep(sleepTime);

        // animate height of the element to new height
        await animateHeight(to, `${toHeight}px`, this.animationTime);
        await sleep(sleepTime);
        to.style.removeProperty('height');
      } else {
        from.style.display = 'none';
      }
      await sleep(sleepTime);
      fadeIn(to, this.animationTime);
    } else {
      console.error(newVal, oldVal);
    }
  }
}
customElements.define('audiosync-pages', AudioSyncPages);
