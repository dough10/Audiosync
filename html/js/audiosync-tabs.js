import {qs, createRipple} from './helpers.js';

/**
 * tabs
 */
class AudioSyncTabs extends HTMLElement {
  static get observedAttributes() {
    return ["selected"];
  }
  constructor() {
    super();
    const sheet = document.createElement('style');
    sheet.textContent = `
      slot {
        display: flex;
        flex-direction: row;
        position: relative;
        background-color: var(--background-color);
      }
    `;
    const shadow = this.attachShadow({mode: "open"});
    [
      sheet,
      document.createElement('slot')
    ].forEach(el => shadow.appendChild(el));
    qs('slot', this.shadowRoot).addEventListener('slotchange', this.handleSlotChange.bind(this));
  }

  /**
   * connected to DOM callbback
   */
  connectedCallback() {
    this.setAttribute('selected', 0);

    const styles = qs('style').textContent;

    const css = `
    audiosync-tabs[disabled] .tab {
      cursor: auto;
    }`;

    if (styles.includes(css)) return;
    qs('style').textContent = styles + css;
  }

  /**
   * attribute has changed 
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (newVal == oldVal) return;
    const pages = qs('audiosync-pages');
    if (pages) pages.setAttribute('selected', newVal);
  }

  /**
   * things added to the slot
   * 
   * @param {Event} event
   */
  handleSlotChange(event) {
    const assignedElements = event.target.assignedElements({flatten: true}).filter(node => node.nodeType === Node.ELEMENT_NODE);
    assignedElements[Number(this.getAttribute('selected'))].classList.add('selected');
    assignedElements.forEach((el, i) => {
      el.onClick(e => {
        if (Boolean(this.getAttribute('disabled'))) return;
        createRipple(e);
        assignedElements.forEach(ele => ele.classList.remove('selected'));
        this.setAttribute('selected', i);
        el.classList.add('selected');
      });
    });
  }
}
customElements.define('audiosync-tabs', AudioSyncTabs);
