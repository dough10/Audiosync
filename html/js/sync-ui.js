import {qs, qsa, ce, Toast, sleep, fadeIn, fillButton, objectToCSS, parseCSS} from './helpers.js'

/**
 * sync ui 
 */
class SyncUI extends HTMLElement {
  constructor() {
    super();

    const cssObj = {
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
        'max-width': '457px'
      },
      svg: {
        height: "24px",
        width: "24px"
      }
    };

    this.syncing = false;

    const sheet = ce('style');
    sheet.textContent = objectToCSS(cssObj);

    this._closeDialog = this._closeDialog.bind(this);

    const bars = [
      {id:"files", text: "Copying Files"},
      {id:"podcasts", text: "Copying Podcasts"},
      {id:"playlists", text: "Creating Playlists"}
    ]

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
    this.dialog.blocker.addEventListener('click', _ => this.dialog.close());

    // style the dialog wider the normal 
    const dstyles = parseCSS(qs('style', this.dialog.shadowRoot).textContent);
    dstyles[".dialog"]['min-width'] = '445px';
    qs('style', this.dialog.shadowRoot).textContent = objectToCSS(dstyles);

    [
      this.output,
      this._progressBar(bars[0]),
      this._progressBar(bars[1]),
      this._progressBar(bars[2]),
      this.summary,
      this.button
    ].forEach(el => this.dialog.appendChild(el));

    const shadow = this.attachShadow({mode: "open"});
    [
      sheet,
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
    const label = ce('div');
    label.textContent = obj.text;

    const percent = ce('div');
    percent.textContent = '0%';
    percent.id = `${obj.id}-bar-text`;

    const bar = ce('audiosync-progress');
    bar.id = `${obj.id}-bar`;
    [
      label,
      percent
    ].forEach(el => bar.appendChild(el));
    return bar;
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
    const progressElements = Array.from(qsa('audiosync-progress', this.shadowRoot));
    
    // Function to calculate and print average percent
    const printAveragePercent = () => {
      const visibleProgressElements = progressElements.filter(el => el.style.display !== 'none');
      const totalPercent = Object.values(values).reduce((acc, percent) => acc + percent, 0);
      
      const ev = new CustomEvent('total-progress', {
        detail:{percent: (totalPercent / visibleProgressElements.length)}
      });
      this.dispatchEvent(ev);
    };
    
    // Event listener for "percent-changed" event
    const percentChangedHandler = (e) => {
      values[e.detail.id] = e.detail.percent;
      printAveragePercent();
    };
    
    // Add event listener to each progress element
    progressElements.forEach(el => {
      el.addEventListener('percent-changed', percentChangedHandler);
    });
  }

  /**
   * update the UI of sync dialog
   * 
   * @param {Object} obj
   */
  async syncUpdate(obj) {
    const div = ce('div');
    div.style.opacity = 0;
    div.textContent = obj.text;
    if (!obj.summary) {
      this.output.appendChild(div);
    } else {
      new Toast('Sync Complete');
      this.summary.appendChild(div);
      this.button.removeAttribute('disabled');
    }
    if (obj.toast) {
      new Toast(obj.text);
    } else {
      console.log(obj.text);
    }
    await sleep(10);
    fadeIn(div, 150);
  }

  /**
   * update data of progress bars
   * 
   * @param {String} name
   * @param {Number} ndx
   * @param {Number} length
   */
  updateBar(name, ndx, length) {
    const percent = ((ndx + 1) / length) * 100;
    qs(name, this.shadowRoot).setAttribute('percent', percent);
    qs(`${name}-text`, this.shadowRoot).textContent = percent.toFixed(1) + '%';
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
    });
  }
}
customElements.define('sync-ui', SyncUI);
