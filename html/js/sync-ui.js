import {qs, Toast, sleep, fadeIn} from './helpers.js'

/**
 * sync ui 
 */
class SyncUI extends HTMLElement {
  constructor() {
    super();

    const sheet = document.createElement('style');
    sheet.textContent = `
      .console-output {
        height: 150px;
        font-size: 15px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin-top: 8px;
        margin-bottom: 8px;
      }
      .console-output div {
        margin-bottom: 4px;
      }
      .summary {
        margin-top:16px;
        margin-bottom:24px;
        height: 50px;
        font-size: 16px;
      }
    `;

    this._closeDialog = this._closeDialog.bind(this);

    const bars = [
      {id:"files", text: "Copying Files"},
      {id:"podcasts", text: "Copying Podcasts"},
      {id:"playlists", text: "Copying Playlists"}
    ]

    this.output = document.createElement('div');
    this.output.classList.add('console-output');

    this.summary = document.createElement('div');
    this.summary.classList.add('summary');
    
    this.button = document.createElement('audiosync-button');
    this.button.textContent = 'close';
    this.button.toggleAttribute('disabled');
    this.button.onClick(e => {
      this._closeDialog(e);
    });
    
    this.dialog = document.createElement('audiosync-dialog');
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
    const label = document.createElement('div');
    label.textContent = obj.text;

    const percent = document.createElement('div');
    percent.textContent = '0%';
    percent.id = `${obj.id}-bar-text`;

    const bar = document.createElement('audiosync-progress');
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
   * update the UI of sync dialog
   * 
   * @param {Object} obj
   */
  async syncUpdate(obj) {
    const div = document.createElement('div');
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
   * 
   */
  async _closeDialog() {
    const ml = qs('music-library');
    await ml.go();
    qs('audiosync-menu').footElement(ml.libSize);
    await this.dialog.close();
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
    ].forEach(id => {
      qs(id, this.shadowRoot).setAttribute('percent', 0);
      qs(`${id}-text`, this.shadowRoot).textContent = '0%';
    });
  }
}
customElements.define('sync-ui', SyncUI);
