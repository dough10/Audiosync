import {
  Timer,
  Toast,
  fadeIn,
  fadeOut,
  qs,
  qsa,
  sleep,
  createRipple,
  alertUser
} from './helpers.js';

/**
 * displays the music library in a selectable form
 */
class MusicLibrary extends HTMLElement {
  constructor() {
    super();
    this._makeSelection = this._makeSelection.bind(this);
    this._displayArtist = this._displayArtist.bind(this);
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(125, 125, 125, 0.4);
        animation: ripple-animation 0.7s linear;
      }
      div:first-child {
        border-top: none;
      }
      .artist {
        position: relative;
        border-top: 1px solid #3333333d;
        cursor: pointer;
        padding: 8px;
        font-size: 17px;
        font-weight: bold;
        overflow: hidden;
      }
      .artist:hover {
        background-color: var(--hover-color);
      }
      .album {
        position: relative;
        border-top: 1px solid #3333333d;
        cursor: pointer;
        padding: 4px;
        font-size: 13px;
        overflow: hidden;
      }
      .album:hover {
        background-color: var(--hover-color);
      }
      .album.selected {
        background-color: rgba(100, 100, 100, 0.582);
      }
      .album.selected:hover {
        background-color: #00000044;
      }
      .blank {
        height: 550px;
        display: flex;
        align-items: center;
        justify-content: center;
      } 
    `;
    this.content = document.createElement('div');
    this.shadow = this.attachShadow({mode: "open"});
    [
      style, 
      this.content
    ].forEach(el => this.shadow.appendChild(el));
  }

  /**
   * fetch data
   */
  async go() {
    await fadeOut(this.content);
    this.content.innerHTML = '';
    const library = await pywebview.api.lib_data();
    this.libSize = library.lib_size || '0 b';
    delete library.lib_size;
    this._displayData(library);
    const syncData = await pywebview.api.sync_file()
    this._compareData(syncData);
    fadeIn(this.content);
  }

  /**
   * fill in page with data
   * 
   * @param {Object} data artists and albums list from lib_data.json *required*
   */
  _displayData(data) {
    if (Object.keys(data).length === 0) {
      this._emptyLib();
      return;
    }
    for (const artist in data) {
      this._displayArtist(artist);
      for (let i = 0; i < data[artist].length; i++) {
        this._displayAlbum(artist, data[artist][i]);
      }
    }
  }

  /**
   * fired when ther is no lib_data.json file
   */
  _emptyLib() {
    // empty library notification
    alertUser('Click the Scan button to load library');
    
    // UI buttons that will be disabled
    const buttons = [
      '#menu-button',
      '#settings',
      'audiosync-tabs'
    ]
    buttons.forEach(id => qs(id).setAttribute('disabled', 1));
      
    // scan library button
    const button = document.createElement('audiosync-button');
    button.textContent = 'Scan Music';
    
    // wrapper to place content
    const wrapper = document.createElement('div');
    wrapper.classList.add('blank');
    wrapper.appendChild(button);

    button.onClick(async _ => {

      new Toast('Scan can take some time to complete', 10);
      // hide the button
      await fadeOut(button);

      // remove the button once hidden
      wrapper.innerHTML = '';

      // progress bar label
      const label = document.createElement('div');
      label.textContent = 'Building Library';

      //  progress percentage text
      const percent = document.createElement('div');
      percent.textContent = '0%';

      // create progress bar
      this.bar = document.createElement('audiosync-progress');
      this.bar.style.opacity = 0;
      this.bar.style.width = '90%';
      [
        label,
        percent
      ].forEach(el => this.bar.appendChild(el));

      // add the bar to the UI in a hidden state
      wrapper.appendChild(this.bar);
      this.percent = percent;
      await sleep(10);

      //  uphide the progress bar
      await fadeIn(this.bar);
      const t = new Timer('Initial Scan');

      // do the scan actual in python
      await pywebview.api.create_json();

      // scan finished
      buttons.forEach(id => qs(id).removeAttribute('disabled'));
      const s = t.endString();
      new Toast(s);
    });
    this.content.appendChild(wrapper);
  }

  /**
   * update library scan progress bar
   * 
   * @param {Number} ndx - current position
   * @param {Number} length - total 
   */
  async updateBar(ndx, length) {
    const percent = ((ndx + 1) / length) * 100;
    this.bar.setAttribute('percent', percent);
    this.percent.textContent = `${percent.toFixed(1)}%`;
    if (percent === 100) {
      await fadeOut(this.bar);
      await sleep(100);
      await this.go();
      qs('audiosync-menu').footElement(this.libSize);
    }
  }

  /**
   * album element
   * 
   * @param {String} artist
   * @param {String} album
   */
  _displayAlbum(artist, album) {
    let albumContainer = document.createElement('div');
    albumContainer.dataset.artist = artist;
    albumContainer.dataset.album = album;
    albumContainer.classList.add('album');
    albumContainer.textContent = album;
    albumContainer.addEventListener('click', this._makeSelection);
    this.content.appendChild(albumContainer);
  }

  /**
   * artist element
   * 
   * @param {String} artist
   */
  _displayArtist(artist) {
    let artistContainer = document.createElement('div');
    artistContainer.dataset.artist = artist;
    artistContainer.classList.add('artist');
    artistContainer.textContent = artist;
    artistContainer.addEventListener('click', this._makeSelection);
    this.content.appendChild(artistContainer);
  }

  /**
   * compares sync.json data to lib_data.json data selects all elements listed in sync.json
   * 
   * @param {Object} data
   */
  _compareData(data) {
    if (Object.keys(data).length === 0) {
      const s = 'No sync file... Running sync now will sync all music';
      console.log(s);
      alertUser(s);
      return;
    }
    for (const artist in data) {
      const m = qsa(`[data-artist="${artist}"].artist`, this.shadow);
      m.forEach(el => el.classList.add('selected'));
      for (let i=0; i < data[artist].length; i++) {
        const s = qsa(`[data-album="${data[artist][i]}"]`, this.shadow);
        s.forEach(el => el.classList.add('selected'));
      }
    }
  }

  /**
   * creates a new object from selected elements to be saved as sync.json
   */
  buildObject() {
    const artistAlbums = {};
    // Select all elements with the data-artist attribute
    const artistElements = qsa('.selected', this.shadow);
    // Iterate over each artist element
    artistElements.forEach(artistElement => {
      const artistName = artistElement.dataset.artist;
      // If the artist name is not in the object, initialize an empty array for their albums
      if (!(artistName in artistAlbums)) {
        artistAlbums[artistName] = [];
      }
      const albumName = artistElement.dataset.album;
      if (!(albumName in artistAlbums[artistName]) && albumName != null) {
        artistAlbums[artistName].push(albumName);
      }
    });
    return artistAlbums;
  }

  /**
   * element has been clicked on
   * 
   * @param {Event} e
   */
  _makeSelection(e) {
    createRipple(e);
    const target = e.target;
    target.classList.toggle('selected');
    if (target.classList.contains('artist')) {
      const matchingArtist = qsa(`[data-artist="${target.dataset.artist}"]`, this.shadow);
      matchingArtist.forEach(el => {
        if (target.classList.contains('selected')) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        } 
      });
    }
    if (target.classList.contains('album')) {
      const matchingArtist = qsa(`[data-artist="${target.dataset.artist}"].artist`, this.shadow);
      matchingArtist.forEach(el => {
        if (target.classList.contains('selected')) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        } 
      });
    }
  }
}
customElements.define('music-library', MusicLibrary);
