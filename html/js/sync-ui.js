import {qs, qsa, ce, sleep, fadeIn, fillButton, objectToCSS, calcPercentage} from './helpers.js';
import { Toast } from './Toast/Toast.js';

/**
 * sync ui 
 */
class SyncUI extends HTMLElement {
  constructor() {
    super();

    const CSS_OBJECT = {
      ".console-output": {
        height: "150px",
        "font-size": "15px",
        display: "flex",
        "flex-direction": "column",
        "justify-content": "flex-end",
        "margin-top": "8px",
        "margin-bottom": "8px"
      },
      ".console-output div": {
        "margin-bottom": "4px"
      },
      ".summary": {
        "margin-top": "16px",
        "margin-bottom": "24px",
        height: "75px",
        "font-size": "16px",
        'max-width': '457px',
        'text-wrap': 'pretty'
      },
      'audiosync-button > div': {
        display: 'flex',
        'flex-direction': 'row'
      },
      'audiosync-button > div > :first-child': {
        'margin-right': '16px'
      },
      'audiosync-button > div > :nth-child(2)': {
        display: 'flex',
        'align-items': 'center',
        'margin-right': '16px'
      },
      svg: {
        height: "24px",
        width: "24px"
      }
    };

    this.source = false;
    this.syncing = false;

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this._closeDialog = this._closeDialog.bind(this);

    const PROGRESS_BAR_LIST = [
      {id:"files", text: "Copying Files"},
      {id:"podcasts", text: "Copying Podcasts"},
      {id:"playlists", text: "Creating Playlists"}
    ];

    this.output = ce('div');
    this.output.classList.add('console-output');

    this.summary = ce('div');
    this.summary.classList.add('summary');
    
    const buttonContents = fillButton('close', "reset");
    
    this.button = ce('audiosync-button');
    this.button.appendChild(buttonContents);
    this.button.toggleAttribute('disabled');
    this.button.onClick(async _ => {
      await sleep(200); // maybe give time for ripple animation
      this._closeDialog();
    });
    
    this.dialog = ce('audiosync-dialog'); 
    this.dialog.style.setProperty('--min-width', '445px');

    [
      this.output,
      this._progressBar(PROGRESS_BAR_LIST[0]),
      this._progressBar(PROGRESS_BAR_LIST[1]),
      this._progressBar(PROGRESS_BAR_LIST[2]),
      this.summary,
      this.button
    ].forEach(el => this.dialog.appendChild(el));

    const shadow = this.attachShadow({mode: "open"});
    [
      ELEMENT_STYLES,
      this.dialog
    ].forEach(el => shadow.appendChild(el));
  }

  /**
   * generates a progressbar and nested elements
   * 
   * @param {Object} obj id and text 
   * 
   * @returns {HTMLElement} 
   */
  _progressBar(obj) {
    const LABEL = ce('div');
    LABEL.textContent = obj.text;

    const PERCENT_TEXT = ce('div');
    PERCENT_TEXT.textContent = '0%';
    PERCENT_TEXT.id = `${obj.id}-bar-text`;

    const PROGRESS_BAR_ELEMENT = ce('audiosync-progress');
    PROGRESS_BAR_ELEMENT.id = `${obj.id}-bar`;
    [
      LABEL,
      PERCENT_TEXT
    ].forEach(el => PROGRESS_BAR_ELEMENT.appendChild(el));
    return PROGRESS_BAR_ELEMENT;
  }

  /**
   * hides a progress bar with the name provided
   * 
   * @param {String} name
   */
  hideBar(name) {
    if (!qs(name, this.shadowRoot)) return;
    qs(name, this.shadowRoot).style.display = 'none';
  }

  /**
   * displays the hidden bar
   * 
   * @param {String} name
   */
  showBar(name) {
    if (!qs(name, this.shadowRoot)) return;
    qs(name, this.shadowRoot).style.display = 'block';
  }

  /**
   * opens the sync ui dialog
   */
  open() {
    this.dialog.open();
  }

  /**
   * starts the sync progress
   */
  startSync() {
    this.syncing = true;

    let values = {};
    
    // Query all elements with class "audiosync-progress" within the shadow root
    const PROGRESS_ELEMENTS = Array.from(qsa('audiosync-progress', this.shadowRoot));
    
    // Function to calculate and print average percent
    const PRINT_AVERAGE_PERCENTAGE = () => {
      const VISIBLE_PROGRESS_ELEMENTS = PROGRESS_ELEMENTS.filter(el => el.style.display !== 'none');
      const TOTAL_PERCENTAGE = Object.values(values).reduce((acc, percent) => acc + percent, 0);
      
      const ev = new CustomEvent('total-progress', {
        detail:{percent: (TOTAL_PERCENTAGE / VISIBLE_PROGRESS_ELEMENTS.length)}
      });
      this.dispatchEvent(ev);
    };
    
    // Event listener for "percent-changed" event
    const PERCENT_CHANGED = (e) => {
      values[e.detail.id] = e.detail.percent;
      PRINT_AVERAGE_PERCENTAGE();
    };
    
    // Add event listener to each progress element
    PROGRESS_ELEMENTS.forEach(el => el.addEventListener('percent-changed', PERCENT_CHANGED));
  }

  /**
   * update the UI of sync dialog
   * 
   * @param {Object} obj
   */
  async syncUpdate(obj) {
    const DIV = ce('div');
    DIV.style.opacity = 0;
    DIV.textContent = obj.text;
    if (!obj.summary) {
      this.output.appendChild(DIV);
    } else {
      new Toast('Sync Complete');
      this.summary.appendChild(DIV);
      this.button.removeAttribute('disabled');
    }
    if (obj.toast) {
      new Toast(obj.text);
    } else {
      console.log(obj.text);
    }
    await sleep(10);
    fadeIn(DIV, 150);
  }

  /**
   * update data of progress bars
   * 
   * @param {String} name
   * @param {Number} ndx
   * @param {Number} length
   */
  updateBar(name, ndx, length) {
    const PERCENT = calcPercentage((ndx + 1), length);
    qs(name, this.shadowRoot).setAttribute('percent', PERCENT);
    qs(`${name}-text`, this.shadowRoot).textContent = PERCENT.toFixed(1) + '%';
  }

  /**
   * transfer dialog close button clicked
   */
  async _closeDialog() {
    this.syncing = false;
    await this.dialog.close();
    qs('music-library').go();
    this.button.toggleAttribute('disabled');
    [
      this.output,
      this.summary
    ].forEach(id => {
      id.innerHTML = '';
    });
    [
      '#files-bar', 
      '#podcasts-bar', 
      '#playlists-bar'
    ].forEach(async id => {
      await sleep(200);
      qs(id, this.shadowRoot).setAttribute('percent', 0);
      qs(`${id}-text`, this.shadowRoot).textContent = '0%';
      qs('#sync-text').textContent = 'sync';
    });
    qs('#scan').removeAttribute('disabled');
  }
}
customElements.define('sync-ui', SyncUI);
