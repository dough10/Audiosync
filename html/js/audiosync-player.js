import {qs, svgIcon, ce, elementWidth, elementHeight, animateElement, getContrastColor, objectToCSS, sleep, getIcon, qsa, createRipple, convertToHex, parseCSS} from './helpers.js';

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
        background: 'var(--main-color)',
        transform: 'translateY(100%)',
        color: 'var(--text-color)',
        'z-index': 1,
        overflow: 'hidden'
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
        top: 'var(--header-height)',
        transform: 'translateY(100%)',
        'background-color': 'rgba(var(--main-rgb),0.9)',
        color: 'var(--text-color)'
      },
      '#fbg > .img-wrapper': {
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',        
        border: "5px solid rgba(51,51,51,0.2)",
        background: 'rgba(51,51,51,0.2)',
        overflow: 'hidden',
        'border-radius': '24px',
        transition: 'var(--button-bg-animation)',
        height: '450px',
        width: '450px'
      },
      '#fbg > .img-wrapper > img': {
        height: "100%",
        width: '100%'
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
        height:`451px`,
        width: `450px`,
        background: 'rgba(var(--main-rgb),0.5)',
        color: 'var(--text-color)',
        'transform-origin': 'bottom right',
        transform: 'scale3d(0,0,0)',
        position: 'fixed',
        'overflow-y': 'auto',
        'border-radius': '18px'
      },
      '.popup > .track': {
        cursor: "pointer",
        display: 'flex',
        'flex-direction': 'row',
        "text-transform": "uppercase",
        "border-bottom": "var(--seperator-line)",
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
        transform: 'translateX(-15px)',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
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
        'font-size': '11px',
        cursor:'pointer'
      },
      '#duration > *': {
        'pointer-events': 'none'
      },
      '#info': {
        "text-transform": "uppercase",
        position: 'fixed',
        bottom:'5px',
        left: '10px',
        overflow: 'hidden',
        'font-size': '11px',
        'max-height': '14px',
        'max-width': '300px',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'      
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
      },
      '#playlist': {
        transition: 'transform 300ms cubic-bezier(.33,.17,.85,1.1)',
        position: 'absolute',
        'z-index': 1,
        transform: `translateY(${(window.innerHeight / 2) - 190}px)`
      },
      '@media screen and (min-height: 750px) and (min-width: 620px)': {
        '#fbg > .img-wrapper': {
          height: '550px',
          width: '550px'
        },
        '.popup': {
          height: '550px',
          width: '550px'
        }
      },
      '@media screen and (min-height: 850px) and (min-width: 720px)': {
        '#fbg > .img-wrapper': {
          height: '650px',
          width: '650px'
        },
        '.popup': {
          height: '650px',
          width: '650px'
        }
      },
      '@media screen and (min-width: 1200px)': {
        '.background': {
          left: "300px"
        },
        '#fbg': {
          left: "300px"
        },
        '#info': {
          'max-width': '450px'
        }
      }
    };

    this.library = qs('music-library');


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
    this.addToPlaylist = this.addToPlaylist.bind(this);

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

    // change position of action button when window resized
    window.addEventListener('resize', _ => {
      const css = parseCSS(qs('style', this.shadowRoot).textContent);
      css['#playlist'].transform = `translateY(${(window.innerHeight / 2) - 190}px)`;
      qs('style', this.shadowRoot).textContent = objectToCSS(css);
    });

    // populate shadow DOM
    [
      styles,
      this.player
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * callback for <music-library> favorite added event
   * 
   * @param {Object} data 
   * @returns {void}
   */
  favorite(data) {
    // if favorited album is the currently playing ablum
    if (this.artist === data.artist && this.albumTitle === data.title) {
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
   * animate action button visable on screen
   */
  onScreen() {
    return new Promise(resolve => {
      const tend = _ => {
        this.fab.removeEventListener('transitionend', tend);
        resolve();
      }
      this.fab.addEventListener('transitionend', tend);
      requestAnimationFrame(_ => this.fab.style.transform = 'translateY(0)');
    });
  }
  
  /**
   * animate action button off screen
   */
  offScreen() {
    return new Promise(resolve => {
      const tend = _ => {
        this.fab.removeEventListener('transitionend', tend);
        resolve();
      }
      this.fab.addEventListener('transitionend', tend);
      requestAnimationFrame(_ => this.fab.style.removeProperty('transform'));
    });
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
      qs('img', this.shadowRoot).style.removeProperty('filter');
      await animateElement(popup, 'scale3d(0,0,0)', 100);
      popup.remove();
    }
    await this.offScreen();
    animateElement(qs('#expand', this.shadowRoot), 'rotate(0deg)', 300);
    await animateElement(bg, 'translateY(100%)', 300);
    await sleep(100);
    bg.remove();
    this.removeAttribute('fullscreen');
  }

  /**
   * opens the album art overlay
   * 
   * @returns {void}
   */
  async fullScreen() {
    if (qs('#fbg', this.shadowRoot)) return;

    qs('scroll-element').offScreen();

    animateElement(qs('#expand', this.shadowRoot), 'rotate(180deg)', 300);

    // art
    const img = ce('img');
    img.id = 'fsart';
    img.src = this.art;

    const imgwrapper = ce('div');
    imgwrapper.classList.add('img-wrapper');
    imgwrapper.appendChild(img);
    
    // background 
    const bg = ce('div');
    bg.id = 'fbg';
    bg.style.background = `linear-gradient(to bottom, ${this.palette.top}, ${this.palette.bottom})`;

    // playlist fab
    const listButton = ce('audiosync-fab');
    listButton.id = 'playlist';
    listButton.appendChild(await svgIcon('list'));
    listButton.onClick(ev => this._playlistPopup(ev));
    listButton.setAttribute('color', this.palette.fab);
    listButton.title = 'Playlist';
    this.fab = listButton;  

    const favButton = ce('audiosync-small-button');
    favButton.setButtonOpacity = _ => {
      if (this.isFavorite) {
        favButton.title = 'Unfavorite';
        favButton.style.opacity = 1;
      } else {  
        favButton.title = 'Favorite';
        favButton.style.opacity = 0.2;
      }
    };
    favButton.id = 'favorite';
    favButton.setButtonOpacity()
    favButton.appendChild(await svgIcon('favorite'));
    favButton.setAttribute('color', this.palette.contrast);
    favButton.onClick(_ => {
      this.isFavorite = !this.isFavorite;
      favButton.setButtonOpacity();
      // pass favorite to library
      this.library.favoriteAlbum(this.artist, this.albumTitle);
    });
    
    // push to dom
    [
      imgwrapper,
      listButton,
      favButton
    ].forEach(el => bg.appendChild(el));
    this.shadowRoot.appendChild(bg);
    
    await sleep(100);

    const postionFab = _ => {
      let offset = 190;

      if (window.innerHeight > 750 && window.innerWidth > 620) offset += 50;

      if (window.innerHeight > 850 && window.innerWidth > 720) offset += 50;

      const centerX = elementWidth(bg) / 2;
      const centerY = elementHeight(bg) / 2;
      const newPositionX = centerX + offset;
      const newPositionY = centerY + offset;
  
      listButton.style.left = newPositionX + 'px';
      listButton.style.top = newPositionY + 'px';
    };

    postionFab();
    window.addEventListener('resize', _ => postionFab());

    // animate onscreen
    await animateElement(bg, 'translateY(0%)', 300);
    this.toggleAttribute('fullscreen');
    this.onScreen();
  }

  /**
   * play a specific playlist index number
   * 
   * @param {Number} ndx 
   */
  playNdx(ndx) {
    this.playing = ndx;
    this._changeSrc();
  }

  /**
   * add an albums tracks to playlist and play it from beginning
   * 
   * @param {Object} albumInfo 
   * @param {Number} ndx *optional*
   */
  playAlbum(albumInfo, ndx) {
    // reset / set index
    this.playing = ndx || 0;
    if (!ndx) this.library.playlistCleared();
    // set playlist * clone array to prevent album info issue on <music-library>
    this.playlist = albumInfo.tracks.slice();
    if (!this.playlist.length) return;
    this._changeSrc();
  }

  /**
   * add an albums tracks to the playlist
   * 
   * @param {Object} albumInfo 
   */
  addToPlaylist(albumInfo) {
    // clone array to prevent album info issue on <music-library>
    const addedTracks = albumInfo.tracks.slice();
    addedTracks.forEach(track => this.playlist.push(track));
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
        return;
      }
      this.fullScreen();
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
      this._changeSrc();
    });
    

    const playIcon = await svgIcon('pause');
    qs('path', playIcon).id = 'playIcon';

    // play button
    const play = ce('audiosync-small-button');
    play.id = 'play';
    play.appendChild(playIcon);
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
      this._changeSrc();
    });

    // elapsed time
    const duration = ce('div');
    duration.id = 'duration';
    duration.addEventListener('click', _ => this.elapsedTime = !this.elapsedTime);

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
  _changeSrc() {
    // update playlist UI 
    this._updatePlaylistUI();

    const nowplaying = this.playlist[this.playing];

    this.artist = nowplaying.artist;
    this.albumTitle = nowplaying.album;
    this.isFavorite = qs(`[data-artist="${this.artist}"][data-album="${this.albumTitle}"]`, qs('music-library').shadowRoot).hasAttribute('favorite');
    this.art = nowplaying.art;

    // cache art also sets opacity of favorite button to indicate favorite status
    this._cacheImage(this.art);

    const playingArt = qs('#fsart', qs('#fbg > .img-wrapper', this.shadowRoot));
    if (playingArt) playingArt.src = this.art;

    const info = qs('#info', this.shadowRoot);
    if (info) info.textContent = `${nowplaying.artist} - ${nowplaying.title}`;
    
    // set src
    this.player.src = nowplaying.path;
    // load and play the file
    this.player.load();
    this.player.play();

    // update library UI
    this.library.nowPlaying(nowplaying);
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
        this._changeSrc();
      }); 
      popup.appendChild(div);
    }

    // push to DOM
    const bg = qs('#fbg', this.shadowRoot);
    bg.appendChild(popup);
    await sleep(100);

    
    // animate into view
    await animateElement(popup, 'scale3d(1,1,1)', 150);
    qs('img', this.shadowRoot).style.filter = 'blur(10px)';

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
   * 
   * 
   * @returns {void}
   */
  _cacheNext() {
    const nextndx = this.playing + 1
    if (nextndx > this.playlist.length - 1 || this.caching || !this.playlist[nextndx]) return;
    this.caching = true;
    const nextaudio = new Audio();
    nextaudio.preload = true;
    nextaudio.src = this.playlist[nextndx].path;
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
      const c = thief.getPalette(img, 20);

      // default to the first color in returned palette
      let r = c[0][0];
      let g = c[0][1];
      let b = c[0][2];

      // for selecting top color for cradient
      const topNdx = 1;

      // for selecting bottom gradient color
      const bottomNdx = c.length - 3;

      // loop through colors for goldie locks color to use for --pop-color
      for (let i = 0; i < c.length; i++) {
        if (i !== topNdx || i !== bottomNdx) {
          const luminence = (0.2126 * c[i][0] + 0.7152 * c[i][1] + 0.0722 * c[i][2]) / 255;
          if (luminence < 0.7 && luminence > 0.5) {
            console.log(luminence)
            r = c[i][0];
            g = c[i][1]; 
            b = c[i][2];
            break;
          }
        }
      }

      // rgb value string
      const rgbstring = `${c[topNdx][0]},${c[topNdx][1]},${c[topNdx][2]}`;

      // hex value
      const hex = convertToHex(`rgb(${rgbstring})`);

      // color palette
      this.palette = {
        fab: `rgb(${r},${g},${b})`, // fab / accent color
        variable: `${r},${g},${b}`, // for css variable avaliable @ --pop-color
        top: `rgb(${rgbstring})`, // player art gradient top color
        bottom: `rgb(${c[bottomNdx][0]},${c[bottomNdx][1]},${c[bottomNdx][2]})`, // player bg gradient bottom color
        contrast: getContrastColor(hex) // contrasting color to color used to top of gradient
      };

      // fullscreen player element
      const fullscreen = qs('#fbg', this.shadowRoot);

      // update colors if fullscreen
      if (fullscreen) {

        // set colors for gradient
        fullscreen.style.background = `linear-gradient(to bottom, ${this.palette.top}, ${this.palette.bottom})`;
        
        // set action button color
        qs('audiosync-fab', fullscreen).setAttribute('color', this.palette.fab);
        
        // favorite button
        const favButton = qs('#favorite', fullscreen);
        favButton.setAttribute('color', this.palette.contrast);
        if (this.isFavorite) {
          favButton.title = 'Unfavorite';
          favButton.style.opacity = 1;
        } else { 
          favButton.title = 'Favorite';
          favButton.style.opacity = 0.2;
        }
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
    const duration = player.duration - ct;
    const mins = Math.floor(ct / 60);
    const secs = Math.floor(ct % 60).toString().padStart(2, '0');
    const progress = (ct / player.duration) * 100;
    const progBar = qs('.progress', this.shadowRoot);
    const durationtext = qs('#duration', this.shadowRoot);
    // if (duration < 100) this._cacheNext();
    if (progBar) progBar.style.transform = `translateX(-${100 - progress}%)`;
    if (!this.elapsedTime) {
      const dmins = Math.floor(duration / 60);
      const dsecs = Math.floor(duration % 60).toString().padStart(2, '0');
      if (durationtext) durationtext.textContent = `${dmins}:${dsecs}`;
    } else {
      if (durationtext) durationtext.textContent = `${mins}:${secs}`;
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
    this.caching = false;
    // check if end if playlist
    if (!this.playlist[this.playing + 1]) {
      this._pauseTimeOut();
      return;
    }
    // incriment this.playing index
    this.playing++;
    this._changeSrc();
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
    this.library.nowPlaying();
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
    const icon = qs('#playIcon', qs('#play', this.shadowRoot));
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
    const icon = qs('#playIcon', qs('#play', this.shadowRoot));
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