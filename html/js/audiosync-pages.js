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
    const SLEEP_TIME = 20;
    
    // when run without lib_data.json one if not both values will be null
    // this gives music-library proirity 
    if (oldVal === null) {
      oldVal = 1;
      newVal = 0;
      await sleep(SLEEP_TIME);
    }
    
    qs('.card').setAttribute('page', newVal);

    if (qs('scroll-element')) qs('scroll-element').top();

    // elements in the customelement "slot"
    const PAGE_ELEMENTS = qs('slot', this.shadowRoot).assignedElements({flatten: true}).filter(node => node.nodeType === Node.ELEMENT_NODE);
    if (PAGE_ELEMENTS[newVal] && PAGE_ELEMENTS[oldVal]) {

      // transition to this page
      const TRANSITION_TO_PAGE = PAGE_ELEMENTS[newVal];

      // tansition from this page
      const TRANSITION_FROM_PAGE = PAGE_ELEMENTS[oldVal];

      // hide content we are animating from 
      await fadeOut(TRANSITION_FROM_PAGE, this.animationTime);
      await sleep(SLEEP_TIME);

      // enable display of content to be animated into view
      TRANSITION_TO_PAGE.style.display = 'block';

      // capture element heights
      const HEIGHT_OF_FROM_PAGE = elementHeight(TRANSITION_FROM_PAGE);
      const HEIGHT_OF_TO_PAGE = elementHeight(TRANSITION_TO_PAGE);

      const HEADER_HEIGHT = Number(getCSSVariableValue('--header-height').replace('px',''));
      const WINDOW_HEIGHT = window.innerHeight - HEADER_HEIGHT;

      // animate height if the content is small enough to see the bottom of the card
      if (HEIGHT_OF_TO_PAGE < WINDOW_HEIGHT || HEIGHT_OF_FROM_PAGE < WINDOW_HEIGHT) {

        // set height of new content before hiding old content
        TRANSITION_TO_PAGE.style.height = `${HEIGHT_OF_FROM_PAGE}px`;
        TRANSITION_FROM_PAGE.style.display = 'none';

        // let changes "settle" before triggering animations
        await sleep(SLEEP_TIME);

        // animate height of the element to new height
        await animateHeight(TRANSITION_TO_PAGE, `${HEIGHT_OF_TO_PAGE}px`, this.animationTime);
        await sleep(SLEEP_TIME);
        TRANSITION_TO_PAGE.style.removeProperty('height');
      } else {
        TRANSITION_FROM_PAGE.style.display = 'none';
      }
      await sleep(SLEEP_TIME);
      fadeIn(TRANSITION_TO_PAGE, this.animationTime);
    } else {
      console.error(newVal, oldVal);
    }
  }
}
customElements.define('audiosync-pages', AudioSyncPages);
