import {qs, svgIcon, ce, animateElement, objectToCSS, sleep, getIcon, fadeOut, fadeIn, parseCSS} from './helpers.js';

class AudioPlayer extends HTMLElement {
  constructor() {
    super();

    this.playlist = [];
    this.lastPlayed = '';

    this.attachShadow({mode: "open"});

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
        'background-color': 'var(--main-color)',
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
        position: 'fixed',
        bottom:'5px',
        left: '10px',
        'font-size': '11px'
      },
      '#expand': {
        position: 'fixed',
        left: '20px',
      },
      img: {
        border: "1px solid rgba(51,51,51,0.2)"
      }
    };

    // pause timer
    // hide ui if paused for period of time
    this._pauseTimer = 0;

    this._nowPlaying = {};

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
        bufferBar.style.transform = `translateX(-${100 - bufferedPercent}%)`;
      } else {
        bufferBar.style.transform = `translateX(-100%)`;
      }
    }, 17);

    // setInterval(_ => console.log(this._nowPlaying),5000)

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
    back.appendChild(await svgIcon('previous'));
    back.onClick(_ => {
      if (this.playing <= 0) return;
      // incriment this.playing index
      this.playing--;
      // set src
      this.player.src = this.playlist[this.playing];
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
      // set src
      this.player.src = this.playlist[this.playing];
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

    // artist / title
    const info = ce('div');
    info.id = 'info';
    info.textContent = 'Loading..'

    // mini player UI background
    const bg = ce('div');
    bg.classList.add('background');
    [
      clickStrip,
      buff,
      progress,
      fsButton,
      duration,
      info,
      buttonWrapper
    ].forEach(el => bg.appendChild(el));
    return bg;
  }

  async fullScreen() {
    if (qs('#fbg', this.shadowRoot)) return;
    // new background 
    const bg = ce('div');
    bg.id = 'fbg';
    // push to dom
    this.shadowRoot.appendChild(bg);
    //  clone styles from mini player .background class
    const bgstyles = parseCSS(qs('style', this.shadowRoot).textContent)['.background'];
    // unneeded height property
    delete bgstyles.height;
    delete bgstyles['z-index'];
    // apply closned styles
    for (const property in bgstyles) {
      bg.style[property] = bgstyles[property];
    }
    // shorter then header
    bg.style.top = '65px';
    if (this.art) {
      const img = ce('img');
      img.src = this.art;
      img.width = 500;
      img.height = 500;
      img.onload = _ => {
        const thief = new ColorThief();
        const c = thief.getColor(img);
        bg.style.backgroundColor = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
      };
      bg.appendChild(img);
    }
    await sleep(100);
    await animateElement(bg, 'translateY(0%)', 300);
    this.toggleAttribute('fullscreen');
  }

  async minimize() {
    const bg = qs('#fbg', this.shadowRoot);
    if (!bg) return;
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
    this.art = `music${playlist.folder}/cover.jpg`;
    this.playlist = [];
    for (let i = 0; i < playlist.tracks.length; i++) {
      this.playlist.push(`music${playlist.folder}/${playlist.tracks[i]}`);
    } 
    this.playing = 0;
    this.player.src = this.playlist[this.playing];
    this.player.play();
  }

  ID3(src) {
    const self = this;
    if (qs('#info', self.shadowRoot)) qs('#info', self.shadowRoot).textContent = 'Loading..';
    jsmediatags.read(`http://localhost:8000/${src}`, {
      onSuccess: function(tag) {
        self.nowPlaying = tag.tags;
        if (tag.tags.artist === undefined) {
          qs('#info', self.shadowRoot).textContent = tag.tags.title;
          return;
        }
        qs('#info', self.shadowRoot).textContent = `${tag.tags.artist} - ${tag.tags.title}`;
      },
      onError: function(error) {
        qs('#info', self.shadowRoot).textContent = 'Error loading data.';
      }
    });
  }

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
    const player = ev.target;
    const ct = player.currentTime;
    const mins = Math.floor(ct / 60);
    const secs = Math.floor(ct % 60).toString().padStart(2, '0');
    const progress = (ct / player.duration) * 100;
    const progBar = qs('.progress', this.shadowRoot);
    if (!progBar) return;
    qs('#duration', this.shadowRoot).textContent = `${mins}:${secs}`;
    progBar.style.transform = `translateX(-${100 - progress}%)`;
  }

  /**
   * The metadata has been loaded.
   * 
   * @param {Event} ev 
   */
  async _onMetaData() {
    this.ID3(this.playlist[this.playing]);
    await this._showMini();
  }

  _onLoadedData(ev) {

  }

  /**
   * Playback has stopped because the end of the media was reached.
   * 
   * @param {Event} ev 
   */
  _onEnd(ev) {
    if (this.playing >= this.playlist.length) {
      this._pauseTimeOut()
    }
    // incriment this.playing index
    this.playing++;
    // set src
    this.player.src = this.playlist[this.playing];
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

  async _pauseTimeOut() {
    await this.minimize();
    const bg = qs('.background', this.shadowRoot);
    await animateElement(bg, 'translateY(100%)', 150);
    bg.remove();
    this.removeAttribute('playing');
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
    this._pauseTimer = setTimeout(this._pauseTimeOut, 60000)
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