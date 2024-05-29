import {qs, svgIcon, ce, animateElement, getContrastColor, objectToCSS, sleep, getIcon, qsa, createRipple, convertToHex} from './helpers.js';

class AudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    // currently playing playlist
    this.playlist = [];

    // count up or count down
    this.elapsedTime = true;

    // CSS object (will be converted to CSS string by objectToCSS())
    const cssObj = {
      '.background': {
        position: 'fixed',
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'center',
        'align-items': "center",
        bottom: 0,
        left: 0,
        right: 0,
        height: '72px',
        transform: 'translateY(100%)',
        'background-color': '#ffffff',
        color: '#333333',
        'z-index': 1
      },
      '#fbg': {
        position: 'fixed',
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'center',
        'align-items': "center",
        bottom: '72px',
        left: 0,
        right: 0,
        top: '65px',
        transform: 'translateY(100%)',
        'background-color': 'rgba(255,255,255,0.9)',
        color: '#333333'
      },
      '#fbg > img': {
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',        
        border: "4px solid rgba(51,51,51,0.2)",
        background: 'rgba(51,51,51,0.2)',
        overflow: 'hidden',
        'border-radius': '24px',
        transition: 'var(--button-bg-animation)'
      },
      '.buffered': {
        height: '5px',
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        'background-color': 'rgba(51,51,51,0.2)',
        transform: 'translateX(-100%)'
      },
      '.progress': {
        height: '5px',
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        'background-color': 'var(--pop-color)',
        transform: 'translateX(-100%)',
        transition: 'var(--button-bg-animation)'
      },
      '.click-strip': {
        "border-bottom": "1px solid rgba(51,51,51,0.05)",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        'z-index': 1,
        cursor: 'pointer'
      },
      ".popup::-webkit-scrollbar": {
        width: 0
      },
      '.popup': {
        height:`450px`,
        width: `450px`,
        background: 'rgba(255,255,255,0.6)',
        color: '#333333',
        'transform-origin': 'bottom right',
        transform: 'scale3d(0,0,0)',
        position: 'fixed',
        'overflow-y': 'auto',
        'border-radius': '24px'
      },
      '.popup > .track': {
        cursor: "pointer",
        display: 'flex',
        'flex-direction': 'row',
        "text-transform": "uppercase",
        "border-bottom": "1px solid #3333333d",
        'will-change': 'background',
        transition: 'var(--button-bg-animation)'
      },
      '.popup > .track > div:first-child': {
        'margin-left': '8px',
        padding: '8px',
        'margin-right': '16px'
      },
      '.popup > .track > div:nth-child(2)': {
        padding: '8px',
        width: "100%",
        overflow: 'hidden',
        transform: 'translateX(-15px)'
      },
      '.popup > .track:hover': {
        background: 'var(--hover-color)'
      },
      '.popup > div[playing]': {
        background: 'rgba(100, 100, 100, 0.582)',
        cursor:'auto'
      },
      svg: {
        height: '24px',
        width: '24px'
      },
      '#play': {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      },
      '#play > svg': {
        height:'40px',
        width: '40px'
      },
      '#next': {
        position: 'fixed',
        top: '50%',
        right: '50%',
        transform: 'translate(-50%, -50%) translateX(85px)'
      },
      '#back': {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) translateX(-50px)'
      },
      "#duration": {
        position: 'fixed',
        bottom: '5px',
        right: '10px',
        'font-size': '11px'
      },
      '#info': {
        "text-transform": "uppercase",
        position: 'fixed',
        bottom:'5px',
        left: '10px',
        'font-size': '11px'
      },
      '#expand': {
        position: 'fixed',
        left: '20px',
        bottom: '20px'
      },
      '#favorite': {
        position:'fixed',
        top: '20px',
        right: '20px',
        transition: 'color 500ms ease'
      }
    };

    // pause timer
    // hide ui if paused for period of time
    this._pauseTimer = 0;

    // cache svg icon data strings
    getIcon('play').then(svg => this.playIcon = svg.d);
    getIcon('pause').then(svg => this.pauseIcon = svg.d);

    // bind this
    this._showMini = this._showMini.bind(this);
    this._pauseTimeOut = this._pauseTimeOut.bind(this);
    this._checkBuffered = this._checkBuffered.bind(this);

    // push styles to <style> element
    const styles = ce('style');
    styles.textContent = objectToCSS(cssObj);

    // Audio player (why we are here after all)
    this.player = new Audio();

    // bind all the callbacks
    this.player.onloadedmetadata = this._onMetaData.bind(this);
    this.player.onplay = this._onPlay.bind(this);
    this.player.onplaying = this._onPlaying.bind(this);
    this.player.onstalled = this._onStalled.bind(this);
    this.player.onwaiting = this._onWaiting.bind(this);
    this.player.ondurationchange = this._onDurationChange.bind(this);
    this.player.ontimeupdate = this._onTime.bind(this);
    this.player.onpause = this._onPause.bind(this);
    this.player.onended = this._onEnd.bind(this);
    this.player.oncanplaythrough = this._canPlayThrough.bind(this);
    this.player.onloadeddata = this._onLoadedData.bind(this);

    // always check buffered ammount
    setInterval(this._checkBuffered, 100);

    // populate shadow DOM
    [
      styles,
      this.player
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * move buffered progress car
   * 
   * @returns {void}
   */
  _checkBuffered() {
    // do nothing if no file is loaded
    if (!this.player.src) return;

    // bar may not exist no mini player created until needed
    const bufferBar = qs('.buffered', this.shadowRoot);
    if (!bufferBar) return;

    // buffered data
    if (this.player.buffered.length > 0) {
      let buffered = 0;
      for (let i = 0; i < this.player.buffered.length; i++) {
        buffered = Math.max(buffered, this.player.buffered.end(i));
      }
      const bufferedPercent = (buffered / this.player.duration) * 100;
      bufferBar.style.transform = `translateX(-${100 - bufferedPercent}%)`;
    } else {
      bufferBar.style.transform = `translateX(-100%)`;
    }
  }

  /**
   * animates mini player ui onto screen
   * 
   * @returns {Promise}
   */
  async _showMini() {
    if (qs('.background', this.shadowRoot)) return;
    const ui = await this._miniUI();
    this.shadowRoot.appendChild(ui);
    await sleep(20);
    this.toggleAttribute('playing');
    animateElement(ui, 'translateY(0)', 150);
  }

  /**
   * generates the mini player ui
   * 
   * @returns {HTMLElement}
   */
  async _miniUI() {
    // play progress bar
    const progress = ce('div');
    progress.classList.add('progress');
 
    // buffered amount bar
    const buff = ce('div');
    buff.classList.add('buffered');

    // click location for scrobbeling through a track **broken on windows**
    const clickStrip = ce('div');
    clickStrip.classList.add('click-strip');
    clickStrip.addEventListener('click', e => {
      // time left
      const duration = this.player.duration;
      // window data
      const rect = clickStrip.getBoundingClientRect();
      // click x
      const relativeX = e.clientX - rect.left;
      // time in seconds to set player.currentTime
      const newPosition = (relativeX / rect.width) * duration;
      // set time
      this.player.currentTime = newPosition;
    });

    // fullscreen toggle
    const fsButton = ce('audiosync-small-button');
    fsButton.id = 'expand';
    fsButton.appendChild(await svgIcon('expand'));
    fsButton.onClick(_ => {
      if (this.hasAttribute('fullscreen')) {
        this.minimize();
        animateElement(fsButton, 'rotate(0deg)', 300);
        return;
      }
      this.fullScreen();
      animateElement(fsButton, 'rotate(180deg)', 300);
    });

    // previous track button 
    const back = ce('audiosync-small-button');
    back.id = 'back';
    back.style.display = 'none';
    back.appendChild(await svgIcon('previous'));
    back.onClick(_ => {
      // block back if beginning of playlist
      if (this.playing <= 0) return;
      // incriment this.playing index
      this.playing--;
      // update src attribute
      this._chanceSrc();
    });
    
    // play button
    const play = ce('audiosync-small-button');
    play.id = 'play';
    play.appendChild(await svgIcon('pause'));
    play.onClick(_ => {
      // toggle playback
      if (this.player.paused) {
        this.player.play();
      } else {
        this.player.pause();
      }
    });

    // next track button
    const next = ce('audiosync-small-button');
    next.id = 'next';
    next.appendChild(await svgIcon('next'));
    next.onClick(_ => {
      // block next if end of playlist
      if (this.playing >= this.playlist.length) return;
      // incriment this.playing index
      this.playing++;
      // change src attribute
      this._chanceSrc();
    });

    // elapsed time
    const duration = ce('div');
    duration.id = 'duration';
    duration.textContent = '0:00';
    duration.addEventListener('click', _ => {
      this.elapsedTime = !this.elapsedTime;
    });

    // artist / title
    const info = ce('div');
    info.id = 'info';
    info.textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;

    // mini player UI background
    const bg = ce('div');
    bg.classList.add('background');
    [
      clickStrip,
      buff,
      progress,
      fsButton,
      info,
      duration,
      back,
      play,
      next
    ].forEach(el => bg.appendChild(el));
    return bg;
  }

  /**
   * update playlist ui, cache art, change <audio> src attribute and call play()
   */
  _chanceSrc() {
    // update playlist UI 
    this._updatePlaylistUI();

    // cache art
    this.art = this.playlist[this.playing].art;
    this._cacheImage(this.art);

    const playingArt = qs('img', qs('#fbg', this.shadowRoot));
    if (playingArt) playingArt.src = this.art;

    const info = qs('#info', this.shadowRoot)
    if (info) info.textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;
    
    // set src
    this.player.src = this.playlist[this.playing].path;
    // load and play the file
    this.player.load();
    this.player.play();
    const ev = new CustomEvent('now-playing', {
      detail:{artist: this.artist, album: this.title}
    });
    this.dispatchEvent(ev);
  }

  /**
   * creates a popup option dialog with track information
   * 
   * @returns {void}
   */
  async _playlistPopup() {
    if (qs('.popup', this.shadowRoot)) return;

    // create playlist popup
    const popup = ce('div');
    popup.classList.add('popup');
    for (let i = 0; i < this.playlist.length; i++) {
      const div = ce('div');
      div.classList.add('track');
      if (this.playing === i) {
        div.toggleAttribute('playing');
      }
      // track number
      const tnum = ce('div');
      tnum.textContent = this.playlist[i].track;
      // track title
      const ttitle = ce('div');
      ttitle.textContent = this.playlist[i].title;
      [
        tnum,
        ttitle
      ].forEach(el => div.appendChild(el));

      // clicked on a track in playlist
      div.addEventListener('click', eve => {
        if (i === this.playing) return;
        createRipple(eve)
        this.playing = i;
        this._chanceSrc();
      }); 
      popup.appendChild(div);
    }

    // push to DOM
    const bg = qs('#fbg', this.shadowRoot);
    bg.appendChild(popup);
    await sleep(100);

    
    // animate into view
    await animateElement(popup, 'scale3d(1,1,1)', 150);
    qs('img', this.shadowRoot).style.filter = 'blur(5px)';

    // close and remove popup
    const clicked = async _ => {
      qs('img', this.shadowRoot).style.removeProperty('filter');
      await animateElement(popup, 'scale3d(0,0,0)', 150);
      popup.remove();
    };
    // popup.addEventListener('mouseleave', clicked);
    bg.addEventListener('click', clicked);
    await sleep(50);

    // ensure currently playing is in view
    const playing = qs('div[playing]', popup);
    playing.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * opens the album art overlay
   * 
   * @returns {void}
   */
  async fullScreen() {
    if (qs('#fbg', this.shadowRoot)) return;
    
    const ev = new CustomEvent('player-fullscreen', {
      detail:{fullscreen: true}
    });
    this.dispatchEvent(ev);

    // art
    const img = ce('img');
    img.src = this.art;
    img.width = 450;
    img.height = 450;
    
    // background 
    const bg = ce('div');
    bg.id = 'fbg';
    bg.style.backgroundColor = this.palette[1];

    // playlist fab
    const listButton = ce('audiosync-fab');
    listButton.appendChild(await svgIcon('list'));
    listButton.position({bottom: '60px', right: '15px'});
    listButton.onClick(ev => this._playlistPopup(ev));
    listButton.setAttribute('color', this.palette[0]);
    listButton.title = 'Playlist';
    
    
    const favButton = ce('audiosync-small-button');
    favButton.setButtonColor = _ => {
      if (this.isFavorite) {
        favButton.title = 'Unfavorite';
        favButton.style.opacity = 1;
      } else {  
        favButton.title = 'Favorite';
        favButton.style.opacity = 0.2;
      }
      const hex = convertToHex(this.palette[1]);
      favButton.setAttribute('color', getContrastColor(hex));
    };
    favButton.id = 'favorite';
    favButton.setButtonColor()
    favButton.appendChild(await svgIcon('favorite'));
    favButton.onClick(_ => {
      this.isFavorite = !this.isFavorite;
      favButton.setButtonColor();
      const ev = new CustomEvent('fav-album', {
        detail:{artist: this.artist, title: this.title, favorite: this.isFavorite}
      });
      this.dispatchEvent(ev);
    });

    // push to dom
    [
      img,
      listButton,
      favButton
    ].forEach(el => bg.appendChild(el));
    this.shadowRoot.appendChild(bg);
    
    // animate onscreen
    await sleep(100);
    await animateElement(bg, 'translateY(0%)', 300);
    this.toggleAttribute('fullscreen');
    listButton.onScreen();
  }

  /**
   * callback for <music-library> favorite added event
   * 
   * @param {Object} data 
   * @returns {void}
   */
  favorite(data) {
    // if favorited album is the currently playing ablum
    if (this.artist === data.artist && this.title === data.title) {
      // toggle state
      this.isFavorite = data.favorite;

      // update UI
      const favButton = qs('#favorite', this.shadowRoot);
      if (!favButton) return;
      if (this.isFavorite) {
        favButton.title = 'Unfavorite';
        favButton.style.opacity = 1;
      } else {  
        favButton.title = 'Favorite';
        favButton.style.opacity = 0.2;
      }
    }
  }

  /**
   * minimize the album art overlay
   * 
   * @returns {void}
   */
  async minimize() {
    const bg = qs('#fbg', this.shadowRoot);
    if (!bg) return;
    const fullscreenEvent = new CustomEvent('player-fullscreen', {
      detail:{fullscreen: false}
    });
    this.dispatchEvent(fullscreenEvent);
    const popup = qs('.popup', this.shadowRoot);
    if (popup) {
      qs('img', this.shadowRoot).style.removeProperty('filter');
      await animateElement(popup, 'scale3d(0,0,0)', 50);
      popup.remove();
    }
    const fab = qs('audiosync-fab', qs('#fbg', this.shadowRoot));
    await fab.offScreen();
    await animateElement(bg, 'translateY(100%)', 300);
    await sleep(100);
    bg.remove();
    this.removeAttribute('fullscreen');
  }

  /**
   * add tracks to playlist
   * 
   * @param {Array} playlist 
   */
  addPlaylist(albumInfo) {
    // reset index
    this.playing = 0;
    // set playing info
    this.artist = albumInfo.artist;
    this.title = albumInfo.title;
    this.isFavorite = albumInfo.favorite;
    // set playlist
    this.playlist = albumInfo.tracks;
    if (!this.playlist.length) return;
    this._chanceSrc();
  }

  /**
   * updates the playlist ui with now playing indicator
   * 
   * @returns {void}
   */
  async _updatePlaylistUI() {
    const popup = qs('.popup', this.shadowRoot);
    if (!popup) return;
    const divs = qsa('.track', popup);
    divs.forEach(div => div.removeAttribute('playing'));
    await sleep(100);
    divs[this.playing].toggleAttribute('playing');
    divs[this.playing].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * loads an image and gets a palette from the image
   * 
   * @param {String} url 
   */
  _cacheImage(url) {
    // cache image & color;
    const img = ce('img');
    img.src = url;
    img.onload = _ => {
      const thief = new ColorThief();
      const c = thief.getPalette(img);

      // default to the first color in returned palette
      let r = c[0][0];
      let g = c[0][1];
      let b = c[0][2];

      // loop through colors for goldie locks
      for (let i = 0; i < c.length; i++) {
        if (i !== 1) { // 1 is the color used in background 
          const luminence = (0.2126 * c[i][0] + 0.7152 * c[i][1] + 0.0722 * c[i][2]) / 255;
          if (luminence < 0.75 && luminence > 0.2) {
            r = c[i][0];
            g = c[i][1]; 
            b = c[i][2];
            break;
          }
        }
      }

      this.palette = [
        `rgb(${r},${g},${b})`, // fab / accent color
        `rgba(${c[1][0]},${c[1][1]},${c[1][2]},0.97)`, // player art background color
        `${r},${g},${b}`
      ];

      // update colors if fullscreen
      const fullscreen = qs('#fbg', this.shadowRoot);
      if (fullscreen) {
        fullscreen.style.backgroundColor = this.palette[1];
        qs('audiosync-fab', fullscreen).setAttribute('color', this.palette[0]);
        const hex = convertToHex(this.palette[1]);
        qs('#favorite', fullscreen).setAttribute('color', getContrastColor(hex));
      }

      // fire event to update app ui element with new color
      const ev = new CustomEvent('image-loaded', {
        detail:{palette: this.palette}
      });
      this.dispatchEvent(ev);

      // destroy img element.  URL cached additional <img> elements with this url should load instant
      img.remove();
      // maybe im wrong /shrug it seems to work
    };
  }

  /**
   * The browser estimates it can play the media up to its end without stopping for content buffering.
   * 
   * @param {Event} ev 
   */
  _canPlayThrough(ev) {
    // console.log(ev);
  }

  /**
   * The duration attribute has been updated.
   * 
   * @param {Event} ev 
   * @returns {Promise}
   */
  _onDurationChange(ev) {
    const bar = qs('.progress', this.shadowRoot);
    if (!bar) return;
    bar.style.transform = `translateX(-100%)`;
  }

  /**
   * The time indicated by the currentTime attribute has been updated.
   * 
   * @param {Event} ev 
   * @returns {Promise}
   */
  _onTime(ev) {
    // hide / show previous button 
    const back = qs('#back', this.shadowRoot);
    if (back) {
      if (!this.playlist[this.playing - 1]) {
        back.style.display = 'none';
      } else {
        back.style.removeProperty('display');
      }
    }

    // hide / show next button
    const next = qs('#next', this.shadowRoot);
    if (next) {
      if (!this.playlist[this.playing + 1]) {
        next.style.display = 'none';
      } else {
        next.style.removeProperty('display');
      }
    }

    const player = ev.target;
    const ct = player.currentTime;
    const mins = Math.floor(ct / 60);
    const secs = Math.floor(ct % 60).toString().padStart(2, '0');
    const progress = (ct / player.duration) * 100;
    const progBar = qs('.progress', this.shadowRoot);
    if (!progBar) return;
    progBar.style.transform = `translateX(-${100 - progress}%)`;
    if (!this.elapsedTime) {
      const duration = player.duration - ct;
      const dmins = Math.floor(duration / 60);
      const dsecs = Math.floor(duration % 60).toString().padStart(2, '0');
      qs('#duration', this.shadowRoot).textContent = `${dmins}:${dsecs}`;
    } else {
      qs('#duration', this.shadowRoot).textContent = `${mins}:${secs}`;
    }
  }

  /**
   * The metadata has been loaded.
   * 
   * @param {Event} ev 
   */
  async _onMetaData() {
    await this._showMini();
  }

  /**
   * The first frame of the media has finished loading.
   * 
   * @param {Event} ev 
   */
  _onLoadedData(ev) {

  }

  /**
   * Playback has stopped because the end of the media was reached.
   * 
   * @param {Event} ev 
   */
  _onEnd(ev) {
    // check if end if playlist
    if (!this.playlist[this.playing + 1]) {
      this._pauseTimeOut();
      return;
    }
    // incriment this.playing index
    this.playing++;
    this._chanceSrc();
  }

  /**
   * Playback has begun.
   * 
   * @returns {Promise}
   */
  async _onPlay() {
    if (this._pauseTimer) {
      clearTimeout(this._pauseTimer);
      this._pauseTimer = 0;
    }
  }

  /**
   * close player UI
   */
  async _pauseTimeOut() {
    const playingEvent = new CustomEvent('now-playing', {
      detail:undefined
    });
    this.dispatchEvent(playingEvent);
    await this.minimize();
    const bg = qs('.background', this.shadowRoot);
    await animateElement(bg, 'translateY(100%)', 150);
    bg.remove();
    this.removeAttribute('playing');
    this.player.src = '';
    this.playlist = [];
    this.playing = 0;
  }

  /**
   * Playback has been paused.
   * 
   * @returns {Promise}
   */
  async _onPause() {
    const icon = qs('path', qs('#play', this.shadowRoot));
    // wants to change menu icon when first loading a playlist
    if (icon.getAttribute('d') === "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z") return;
    icon.setAttribute('d', this.playIcon);
    this._pauseTimer = setTimeout(this._pauseTimeOut, 30000)
  }

  /**
   * Playback is ready to start after having been paused or delayed due to lack of data.
   * 
   * @param {Event} ev 
   */
  _onPlaying(ev) {
    const icon = qs('path', qs('#play', this.shadowRoot));
    // wants to change menu icon when first loading a playlist
    if (icon.getAttribute('d') === "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z") return;
    icon.setAttribute('d', this.pauseIcon);
  }

  /**
   * The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
   * 
   * @param {Event} ev 
   */
  _onStalled(ev) {
    // error notification toast and close player window
    // console.log(ev, this.player);
  }

  /**
   * Playback has stopped because of a temporary lack of data
   * 
   * @param {*} ev 
   */
  _onWaiting(ev) {
    // some kind of loading animation
    // console.log(ev, this.player);
  }
}
customElements.define('audiosync-player', AudioPlayer);