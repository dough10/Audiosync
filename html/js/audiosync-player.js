import {qs, svgIcon, ce, animateElement, objectToCSS, sleep, fadeOut, fadeIn, Timer} from './helpers.js';

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
        height: '110px',
        transform: 'translateY(100%)',
        'background-color': '#ffffff',
        color: '#333333'
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        'z-index': 1,
        cursor: 'pointer'
      },
      svg: {
        height: '40px',
        width: '40px'
      },
      '.big': {
        height:'80px',
        width: '80px'
      }
    };

    this.showMini = this.showMini.bind(this);

    const styles = ce('style');
    styles.textContent = objectToCSS(cssObj);

    this.player = new Audio();

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

    setInterval(_ => {
      const bufferBar = qs('.buffered', this.shadowRoot);
      if (!this.player.buffered.end) return;
      const buffered = (this.player.buffered.end(0) / this.player.duration) * 100;
      if (!bufferBar) return;
      bufferBar.style.transform = `translateX(-${100 - buffered}%)`;

    }, 500);

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
  async showMini() {
    if (qs('.background', this.shadowRoot)) return;
    const ui = await this._miniUI();
    this.shadowRoot.appendChild(ui);
    await sleep(20);
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
      // location on bar where clicked in %
      const clickedpercent = (relativeX / rect.width) * 100;
      // ammount of the track that has buffered
      const buffered = (this.player.buffered.end(0) / duration) * 100;
      // do noting if clicked outside buffered area
      if (clickedpercent > buffered) {
        return;
      }
      // set bar progress
      progress.style.transform = `translateX(${clickedpercent})`;
      // set time
      this.player.currentTime = newPosition;
    });

    // previous track button 
    const back = ce('audiosync-small-button');
    back.appendChild(await svgIcon('previous'));
    back.onClick(_ => {
      if (this.playing <= 0) return;
      this.playing--;
      this.player.src = this.playlist[this.playing];
      this.player.load();
      this.player.play();
    });

    // play svg
    const playSVG = await svgIcon('play');
    playSVG.classList.add('big');

    // play button
    const play = ce('audiosync-small-button');
    play.id = 'play';
    play.appendChild(playSVG);
    play.onClick(_ => {
      if (this.player.paused) {
        this.player.play();
      } else {
        this.player.pause();
      }
    });

    // next track button
    const next = ce('audiosync-small-button');
    next.appendChild(await svgIcon('next'));
    next.onClick(_ => {
      if (this.playing >= this.playlist.length) return;
      this.playing++;
      this.player.src = this.playlist[this.playing];
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

    // mini player UI background
    const bg = ce('div');
    bg.classList.add('background');
    [
      clickStrip,
      buff,
      progress,
      buttonWrapper
    ].forEach(el => bg.appendChild(el));
    return bg;
  }

  /**
   * add tracks to playlist
   * 
   * @param {Array} playlist 
   */
  addPlaylist(playlist) {
    this.playlist = [];
    for (let i = 0; i < playlist.tracks.length; i++) {
      this.playlist.push(`http://localhost:8080${playlist.folder}/${playlist.tracks[i]}`);
    } 
    // this.playlist = playlist.tracks;
    this.playing = 0;
    this.player.src = this.playlist[this.playing];
    this.player.load();
  }

  // addTrack(track) {
  //   this.player.appendChild(track);
  // }

  _canPlayThrough(ev) {
    console.log(ev);
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
    const progress = (player.currentTime / player.duration) * 100;
    const progBar = qs('.progress', this.shadowRoot);
    if (!progBar) return;
    progBar.style.transform = `translateX(-${100 - progress}%)`;
    
    // console.log();
  }

  /**
   * The metadata has been loaded.
   * 
   * @param {Event} ev 
   */
  async _onMetaData(ev) {
    await this.showMini();
    console.log(ev);
  }

  /**
   * Playback has stopped because the end of the media was reached.
   * 
   * @param {Event} ev 
   */
  _onEnd(ev) {
    this.playing++;
    this.player.src = this.playlist[this.playing];
    this.player.load();
    this.player.play();
  }

  /**
   * Playback has begun.
   * 
   * @returns {Promise}
   */
  async _onPlay() {
    const t = new Timer('play')
    const pause = await svgIcon('pause');
    pause.classList.add('big');
    pause.style.opacity = 0;

    const button = qs('#play', this.shadowRoot);
    const oldSVG = qs('svg', button);
    // abondon this method in favor of directly changing the path.d attribute
    // pull all icons and hold pause and play in the class to be toggled by _onPlay and _onPause
    await fadeOut(oldSVG, 50);
    oldSVG.remove();
    while (qs('svg', button)) return;
    button.appendChild(pause);
    await sleep(20);
    fadeIn(pause, 50);
    console.log(t.endString());
  }

  /**
   * Playback has been paused.
   * 
   * @returns {Promise}
   */
  async _onPause() {
    const t = new Timer('pause')
    const play = await svgIcon('play');
    play.classList.add('big');
    play.style.opacity = 0;

    const button = qs('#play', this.shadowRoot);
    const oldSVG = qs('svg', button);
    // abondon this method in favor of directly changing the path.d attribute
    // pull all icons and hold pause and play in the class to be toggled by _onPlay and _onPause
    await fadeOut(oldSVG, 50);
    oldSVG.remove();
    if (qs('svg', button)) return;
    button.appendChild(play);
    await sleep(20);
    fadeIn(play, 50);
    console.log(t.endString())
  }

  /**
   * Playback is ready to start after having been paused or delayed due to lack of data.
   * 
   * @param {Event} ev 
   */
  _onPlaying(ev) {
    // console.log(ev, this.player);
  }

  /**
   * The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
   * 
   * @param {Event} ev 
   */
  _onStalled(ev) {
    console.log(ev, this.player);
  }

  /**
   * Playback has stopped because of a temporary lack of data
   * 
   * @param {*} ev 
   */
  _onWaiting(ev) {
    console.log(ev, this.player);
  }
}
customElements.define('audiosync-player', AudioPlayer);