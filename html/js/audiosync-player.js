import {qs, svgIcon, ce, animateElement, objectToCSS, sleep, getIcon, qsa, createRipple} from './helpers.js';

class AudioPlayer extends HTMLElement {
  constructor() {
    super();

    this.playlist = [];
    this.lastPlayed = '';

    this.popupHeight = 200;
    this.popupWidth = 350;

    this.attachShadow({mode: "open"});

    this.elapsedTime = true;

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
        background: 'rgba(51,51,51,0.2)'
      },
      '.button-wrapper': {
        position: 'fixed',
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'center',
        'align-items': "center"
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
        transform: 'translateX(-100%)'
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
      '.popup': {
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',
        height:`${this.popupHeight}px`,
        width: `${this.popupWidth}px`,
        background: 'rgba(255,255,255,0.9)',
        color: '#333333',
        'transform-origin': 'bottom right',
        transform: 'scale3d(0,0,0)',
        position: 'fixed',
        'overflow-y': 'auto'
      },
      '.popup > div': {
        cursor: "pointer",
        display: 'flex',
        'flex-direction': 'row',
        padding: '8px',
        "text-transform": "uppercase",
        "border-bottom": "1px solid #3333333d"
      },
      '.popup > div > div:first-child': {
        'margin-left': '8px'
      },
      '.popup > div > div:nth-child(2)': {
        width: "100%"
      },
      '.popup > div:hover': {
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
      }
    };

    // pause timer
    // hide ui if paused for period of time
    this._pauseTimer = 0;

    this.nowPlaying = {};

    // cache svg icon data strings
    getIcon('play').then(svg => this.playIcon = svg.d);
    getIcon('pause').then(svg => this.pauseIcon = svg.d);

    // bind this
    this._showMini = this._showMini.bind(this);
    this._pauseTimeOut = this._pauseTimeOut.bind(this);

    // get stylish
    const styles = ce('style');
    styles.textContent = objectToCSS(cssObj);

    // why we are here after all
    this.player = new Audio();

    // bind all the things
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

    // always checking buffered
    setInterval(_ => {
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
        requestAnimationFrame(_ => {
          bufferBar.style.transform = `translateX(-${100 - bufferedPercent}%)`;
        });
      } else {
        bufferBar.style.transform = `translateX(-100%)`;
      }
    }, 100);

    [
      styles,
      this.player
    ].forEach(el => this.shadowRoot.appendChild(el));
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

    // click location for scrobbeling through a track **broken**
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
      if (this.playing <= 0) return;
      // incriment this.playing index
      this.playing--;

      // toggle button display
      if (!this.playlist[this.playing - 1]) {
        back.style.display = 'none';
      } else {
        back.style.removeProperty('display');
      }

      // update playlist UI 
      this._updatePlaylistUI();

      // set src
      qs('#info', this.shadowRoot).textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;
      this.player.src = `music${this.playlist[this.playing].path}`;
      // load and play the file
      this.player.load();
      this.player.play();
    });

    // play svg
    const playSVG = await svgIcon('pause');
    
    // play button
    const play = ce('audiosync-small-button');
    play.id = 'play';
    play.appendChild(playSVG);
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
      if (this.playing >= this.playlist.length) return;
      // incriment this.playing index
      this.playing++;

      // toggle button display
      if (!this.playlist[this.playing + 1]) {
        next.style.display = 'none';
      } else {
        next.style.removeProperty('display');
      }

      // update playlist UI 
      this._updatePlaylistUI();

      // set src
      qs('#info', this.shadowRoot).textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;
      this.player.src = `music${this.playlist[this.playing].path}`;
      // load and play the file
      this.player.load();
      this.player.play();
    });

    // container for buttons
    const buttonWrapper = ce('div');
    buttonWrapper.classList.add('button-wrapper');
    [
      back,
      play,
      next
    ].forEach(el => buttonWrapper.appendChild(el));

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
      buttonWrapper
    ].forEach(el => bg.appendChild(el));
    return bg;
  }

  async _playlistPopup(ev) {
    if (qs('.popup', this.shadowRoot)) return;

    // creaate playlist popup
    const x = ev.pageX - this.popupWidth;
    const y = ev.pageY - this.popupHeight;
    const popup = ce('div');
    popup.classList.add('popup');
    popup.style.top = `${y - 65}px`;
    popup.style.left = `${x}px`;
    for (let i = 0; i < this.playlist.length; i++) {
      const div = ce('div');
      if (this.playing === i) {
        div.toggleAttribute('playing');
      }
      // track number
      const tnum = ce('div');
      tnum.textContent = `(${this.playlist[i].track})`;
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
        this._updatePlaylistUI();
        qs('#info', this.shadowRoot).textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;
        this.player.src = `music${this.playlist[this.playing].path}`;
        this.player.play();
      }); 
      popup.appendChild(div);
    }

    // push to DOM
    const bg = qs('#fbg', this.shadowRoot);
    bg.appendChild(popup);
    await sleep(100);

    // animate into view
    animateElement(popup, 'scale3d(1,1,1)', 100);

    // close and remove popup
    const clicked = async _ => {
      await animateElement(popup, 'scale3d(0,0,0)', 100);
      popup.remove();
    };
    popup.addEventListener('mouseleave', clicked);
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

    // if scoll animation fab is onscrool remove it
    const fab = qs('audiosync-fab', qs('scroll-element').shadowRoot);
    if (fab.hasAttribute('onscreen')) {
      fab.offScreen();
    }

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
    listButton.position({bottom: '55px', right: '10px'});
    listButton.onClick(ev => this._playlistPopup(ev));
    listButton.setAttribute('color', this.palette[0]);

    // push to dom
    [
      img,
      listButton
    ].forEach(el => bg.appendChild(el));
    this.shadowRoot.appendChild(bg);
    
    // animate onscreen
    await sleep(100);
    await animateElement(bg, 'translateY(0%)', 300);
    this.toggleAttribute('fullscreen');
    listButton.onScreen();
  }

  /**
   * minimize the album art overlay
   * 
   * @returns {void}
   */
  async minimize() {
    const bg = qs('#fbg', this.shadowRoot);
    if (!bg) return;
    const popup = qs('.popup', this.shadowRoot);
    if (popup) {
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
  addPlaylist(playlist) {
    // art url
    const folder = playlist.folder.replace(/\\/g, '/');
    this.art = `music${folder}/cover.jpg`;
    this._cacheImage(this.art);
    this.playlist = playlist.tracks;
    // reset index
    this.playing = 0;
    if (!this.playlist.length) return;
    // load URL
    if (qs('#info', this.shadowRoot)) qs('#info', this.shadowRoot).textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;
    this.player.src = `music${this.playlist[this.playing].path}`;
    this.player.play();
  }

  async _updatePlaylistUI() {
    const popup = qs('.popup', this.shadowRoot);
    if (!popup) return;
    const divs = qsa('div', popup);
    divs.forEach(div => div.removeAttribute('playing'));
    await sleep(100);
    divs[this.playing].toggleAttribute('playing');
  }

  /**
   * fetches an image and gets a palette from the image to use later
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
      this.palette = [
        `rgb(${c[0][0]},${c[0][1]},${c[0][2]})`, // fab / accent color
        `rgba(${c[1][0]},${c[1][1]},${c[1][2]},0.9)` // player art background color
      ];


      // set --pop-color elements the new accent color
      let luminance = (0.2126 * c[0][0] + 0.7152 * c[0][1] + 0.0722 * c[0][2]) / 255;

      // if to white use contrasting color
      if (luminance > 0.8) {
        qsa('audiosync-menu-button').forEach(button => button.iconColor('#333333'));
        document.documentElement.style.setProperty('--switch-rgb', `51,51,51`);
      } else {
        document.documentElement.style.setProperty('--switch-rgb', `${c[0][0]},${c[0][1]},${c[0][2]}`);
        qsa('audiosync-menu-button').forEach(button => button.iconColor(this.palette[0]));
      }
      qs('audiosync-button', qs('sync-ui').shadowRoot).setAttribute('color', this.palette[0]);
      qs('audiosync-fab', qs('scroll-element').shadowRoot).setAttribute('color', this.palette[0]);

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
    if (!this.elapsedTime) {
      const duration = player.duration - ct;
      const dmins = Math.floor(duration / 60);
      const dsecs = Math.floor(duration % 60).toString().padStart(2, '0');
      qs('#duration', this.shadowRoot).textContent = `${dmins}:${dsecs}`;
    } else {
      qs('#duration', this.shadowRoot).textContent = `${mins}:${secs}`;
    }
    progBar.style.transform = `translateX(-${100 - progress}%)`;
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

    // update playlist UI 
    this._updatePlaylistUI();

    // set src
    qs('#info', this.shadowRoot).textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;
    this.player.src = `music${this.playlist[this.playing].path}`;
    // load and play the file
    this.player.load();
    this.player.play();
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
    await this.minimize();
    const bg = qs('.background', this.shadowRoot);
    await animateElement(bg, 'translateY(100%)', 150);
    bg.remove();
    this.removeAttribute('playing');
    this.nowPlaying = {};
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