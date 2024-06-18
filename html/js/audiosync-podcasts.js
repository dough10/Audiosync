import {qs, qsa, ce, svgIcon, sleep, fadeIn, fadeOut, Toast, elementWidth, isValidURL, fillButton, objectToCSS, getCSSVariableValue} from './helpers.js';

/**
 * displays podcast show info
 */
class AudioSyncPodcasts extends HTMLElement {
  constructor() {
    super();

    this.animationTime = 200;

    const CSS_OBJECT = {
      'svg': {
        'height': '24px',
        'width': '24px'
      },
      'svg > *': {
        'pointer-events': 'none'
      },
      '.wrapper': {
        'position': 'relative',
        'padding': '0 8px',
        display: 'flex', 
        'justify-content': 'center',
        'align-items': 'center',
        'border-top': 'var(--seperator-line)',
        'font-weight': 'bold',
        'min-height': '44px',
        'max-height': '44px',
        'overflow': 'hidden',
        'will-change': 'min-height',
        'animation': `close ${this.animationTime}ms linear`,
        'cursor': 'pointer'
      },
      '@keyframes close': {
        'from': {
          'min-height': '350px'
        },
        'to': {
          'min-height': '44px'
        }
      },
      '.wrapper > *': {
        'pointer-events': 'none'
      },
      '.wrapper:hover': {
        background: 'rgba(var(--pop-rgb), 0.4)'
      },
      '.wrapper[expanded]': {
        'cursor': 'auto',
        'min-height': '350px',
        'animation': `expand ${this.animationTime}ms linear`
      },
      '@keyframes expand': {
        'from': {
          'min-height': '44px'
        },
        'to': {
          'min-height': '350px'
        }
      },
      '.wrapper[expanded] > *': {
        'pointer-events': 'all'
      },
      '.wrapper[expanded]:hover': {
        background: 'initial'
      },
      '.buttons': {
        'cursor': 'pointer',
        'position': 'absolute',
        'top': '16px',
        'right': '16px',
        'display': 'none',
        'opacity': '0',
        'will-change': 'opacity',
        'animation': `hide-buttons ${this.animationTime}ms linear`
      },
      '@keyframes hide-buttons': {
        'from': {
          'display': 'flex',
          'opacity': '1'
        },
        'to': {
          'display': 'none',
          'opacity': '0'
        }
      },
      '.wrapper[expanded] > .buttons': {
        'animation': `show-buttons ${this.animationTime}ms linear`,
        'display': 'flex',
        'opacity': '1'
      },
      '@keyframes show-buttons': {
        'from': {
          'display': 'none',
          'opacity': '0'
        },
        'to': {
          'display': 'flex',
          'opacity': '1'
        }
      },
      '.podcast-title': {
        'font-size': '14px',
        'will-change': 'transform',
        transform: 'translate(0, 0)',
        animation: `centered ${this.animationTime}ms linear 0ms`
      },
      '@keyframes centered': {
        '0%': {
          transform: 'translate(var(--translate-x), -140px) scale(1.5)'
        },
        '100%': {
          transform: 'translate(0, 0)'
        }
      },
      '.wrapper[expanded] > .podcast-title': {
        transform: 'translate(var(--translate-x), -140px) scale(1.5)',
        animation: `left-align ${this.animationTime}ms linear 0ms`
      },
      '@keyframes left-align': {
        '0%': {
          transform: 'translate(0, 0)'
        },
        '100%': {
          transform: 'translate(var(--translate-x), -140px) scale(1.5)'
        }
      },
      '.updating-icon': {
        position:'absolute',
        top: '11px',
        left: '16px',
        opacity: 0,
        transition: 'opacity 150ms linear',
        animation: 'spin 1s linear infinite'
      },
      '.wrapper[updating] > .updating-icon': {
        opacity: 1
      },
      '.wrapper[expanded] > .updating-icon': {
        top: '22px',
        left:'50%'
      },
      '@keyframes spin': {
        'from': {
          transform: 'rotate(0deg)'
        },
        'to': {
          transform: 'rotate(360deg)'
        }
      },
      '.dl-progress': {
        position: 'absolute',
        bottom:0,
        left:0,
        right:0,
        'min-height': '5px',
        background: 'var(--pop-color)',
        opacity: 0,
        transform: 'translateX(var(--progress))',
        transition: 'auto 150ms linear'
      },
      '.wrapper[updating] > .dl-progress': {
        opacity: 1
      },
      '.wrapper[expanded] > .dl-progress': {
        bottom: 'unset',
        top:'66px',
      },
      '.dl-stats': {
        position: 'absolute',
        top: '15px',
        right: '16px',
        opacity: 0,
        transition: 'opacity 150ms linear'
      },
      '.wrapper[updating] > .dl-stats': {
        opacity:1
      },
      '.wrapper[expanded] > .dl-stats': {
        opacity:0
      },
      '.playing-icon': {
        position: 'absolute',
        top: '11px',
        right: '44px',
        opacity: 0,
        transition: 'opacity 150ms linear'
      },
      '.wrapper[playing] > .playing-icon': {
        opacity:0.7
      },
      '.wrapper[expanded] > .playing-icon': {
        opacity:0
      },
      '.podcast-episodes': {
        'list-style-type': 'none',
        'margin': '0',
        'padding': '0',
        'position': 'absolute',
        'top': '71px',
        'bottom': '0',
        'left': '0',
        'right': '0',
        'background': 'var(--background-color)',
        'overflow-x': 'hidden',
        'overflow-y': 'auto',
        'display': 'flex',
        'flex-direction': 'column',
        'box-shadow': 'inset 0px 5px 6px -3px rgba(0,0,0,0.4)'
      },
      '.episode': {
        'display': 'flex',
        'flex-direction': 'row',
        'border-bottom': 'var(--seperator-line)',
        'font-size': '13px',
        'align-items': 'center',
        padding: '8px'
      },
      '.episode:hover': {
        background: 'rgba(var(--pop-rgb), 0.4)'
      },
      '.episode[playing]': {
        background: 'var(--pop-color)'
      },
      '.episode:first-child': {
        'border-top': 'var(--seperator-line)'
      },
      '.ep-number': {
        'margin': '0 16px'
      },
      '.ep-name': {
        'width': '100%'
      }
  };

    // bind this
    this._expand = this._expand.bind(this);
    this._close = this._close.bind(this);
    this._lazyLoadOnScroll = this._lazyLoadOnScroll.bind(this);

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);
        
    // element to append podcasts to
    this.container = ce('div');
    this.container.classList.add('container');

    this.attachShadow({mode: 'open'});
    [
      ELEMENT_STYLES,
      this.container
    ].forEach(el => this.shadowRoot.appendChild(el));
    window.addEventListener('resize', _ => this.resize());
  }

  /**
   * window was resized
   */
  resize() {
    const wrappers = qsa('.wrapper', this.shadowRoot);
    wrappers.forEach(wrapper => {
      const halfContainer = elementWidth(wrapper) / 2;
      const halfTitle = elementWidth(qs('.podcast-title', wrapper)) / 2;
      const translateX = (halfContainer - ((halfTitle * 1.5) + 24));
      wrapper.style.setProperty('--translate-x', `-${translateX}px`);
    });
  }

  /**
   * creates and opens the add podcast UI
   */
  async openAddPodcastDialog() {
    this.addUI = await this._addPodcastUI();
    qs('body').appendChild(this.addUI);
    await sleep(100);
    this.addUI.open();
  }

  /** 
   * creates the UI for adding podcasts to subscriptions
   */
  async _addPodcastUI() {
    //  loading animation
    const ICON = await svgIcon('refresh');
    ICON.style.height = '40px';
    ICON.style.width = '40px';
    ICON.classList.add('spinning');
    
    // container for animated loading Icon
    const LOADER_ELEMENT = ce('div');
    LOADER_ELEMENT.classList.add('loading');
    LOADER_ELEMENT.appendChild(ICON);

    // text input label
    const INPUT_LABEL = ce('label');
    INPUT_LABEL.classList.add('form__label');
    INPUT_LABEL.textContent = 'Podcast XML URL';
    INPUT_LABEL.setAttribute('for', 'url');
    
    // URL input
    const INPUT_ELEMENT = ce('input');
    INPUT_ELEMENT.setAttribute('placeholder', 'Podcast XML URL');
    INPUT_ELEMENT.type = 'url';
    INPUT_ELEMENT.id = 'url';
    INPUT_ELEMENT.classList.add('form__field');
    
    // input and label wrapper
    const INPUT_GROUP = ce('div');
    INPUT_GROUP.classList.add('form__group');
    [
      INPUT_ELEMENT,
      INPUT_LABEL
    ].forEach(el => INPUT_GROUP.appendChild(el));
    
    // submit / add button
    const BUTTON_CONTENTS = fillButton('add', 'add');

    const ADD_PODCAST_BUTTON = ce('audiosync-button');
    ADD_PODCAST_BUTTON.appendChild(BUTTON_CONTENTS);
    ADD_PODCAST_BUTTON.toggleAttribute('disabled');
    
    // animated dialog card
    const ADD_PODCAST_DIALOG = ce('audiosync-dialog');
    ADD_PODCAST_DIALOG.toggleAttribute('cleanup');

    [
      INPUT_GROUP,
      ADD_PODCAST_BUTTON,
      LOADER_ELEMENT
    ].forEach(el => ADD_PODCAST_DIALOG.appendChild(el));
    
    // input callback
    INPUT_ELEMENT.oninput = e => {
      // enable button for valid url only
      if (isValidURL(INPUT_ELEMENT.value)) {
        ADD_PODCAST_BUTTON.removeAttribute('disabled');
      } else {
        if (!ADD_PODCAST_BUTTON.hasAttribute('disabled')) {
          ADD_PODCAST_BUTTON.toggleAttribute('disabled');
        }
      }
    };
    
    // add button clicked
    ADD_PODCAST_BUTTON.onClick(async e => {
      await sleep(200);
      ADD_PODCAST_BUTTON.toggleAttribute('disabled');
      const LOADING_ELEMENT = qs('.loading');
      LOADING_ELEMENT.style.display = 'flex';
      pywebview.api.subscribe(INPUT_ELEMENT.value);
      await fadeIn(LOADING_ELEMENT);
    });
    
    // if clipboard data is a url fill in the input element
    const pasteData = await pywebview.api.get_clipboard();
    if (isValidURL(pasteData)) {
      INPUT_ELEMENT.value = pasteData;
      ADD_PODCAST_BUTTON.removeAttribute('disabled');
    }

    return ADD_PODCAST_DIALOG;
  }

  /**
   * responds to subscription input
   * 
   * @param {String} message
   */
  async subResponse(message) {
    new Toast(message);
    await sleep(100);

    if (message === 'Subscribed!') {
      await this.listPodcasts();
    }

    if (!this.addUI) return;
    this.addUI.close();
    await sleep(100);
    this.addUI.remove();
  }

  /**
   * list podcasts
   */
  async listPodcasts() {
    const PODCASTS = await pywebview.api.list_subscriptions();
    this.container.innerHTML = '';
    await PODCASTS.forEach(url => this._fetchAndParseXML(url));
  }

  nowPlaying(details) {
    [
      '.episode',
      '.wrapper'
    ].forEach(selector => qsa(selector, this.shadowRoot).forEach(el => el.removeAttribute('playing')));
    const playing = qs(`[data-title="${details.artist}"][data-episode="${details.album}"]`, this.shadowRoot);
    if (!playing) return;
    playing.toggleAttribute('playing');
    playing.parentElement.parentElement.toggleAttribute('playing');
  }

  /**
   * Convert bytes per second (bps) to a human-readable format
   * 
   * @param {Number} bps - Download speed in bytes per second
   * 
   * @returns {String} - Download speed in a human-readable format
   */
  _formatDownloadSpeed(bps) {
    if (bps < 1000) {
      return bps.toFixed(2) + ' bps';
    } else if (bps < 1000000) {
      return (bps / 1000).toFixed(2) + ' kbps';
    } else {
      return (bps / 1000000).toFixed(2) + ' Mbps';
    }
  }

  /**
   * update bar wirh podcast download progress
   * 
   * @param {String} name
   * @param {Number} bytes
   * @param {Number} totalBytes
   * @param {Number} startTime
   * @param {String} filname
   */
  async update(name, bytes, totalBytes, startTime, fileName) {
    if (fileName) {
      const TIME_PAST = (new Date().getTime() - startTime) / 1000;
      const DOWNLOAD_SPEED = this._formatDownloadSpeed(bytes / TIME_PAST);
      const DOWNLOADED_PRECENTAGE = ((bytes / totalBytes) * 100);
      const wrapper = this.shadowRoot.getElementById(name);
      const DL_STATS = qs('.dl-stats', wrapper);
      DL_STATS.textContent = `${DOWNLOADED_PRECENTAGE.toFixed(1)}% @ ${DOWNLOAD_SPEED}`
      wrapper.style.setProperty('--progress', `-${100 - DOWNLOADED_PRECENTAGE}%`);
      if (DOWNLOADED_PRECENTAGE == 100) {
        wrapper.style.setProperty('--progress', `-100%`);
        new Toast(`${fileName} downloaded`);
        DL_STATS.textContent = '';
      }
    } else if (!name) {
      const wrappers = qsa('.wrapper', this.shadowRoot);
      wrappers.forEach(wrapper => wrapper.toggleAttribute('updating'));
    } else {
      const wrapper = this.shadowRoot.getElementById(name);
      wrapper.removeAttribute('updating');
    }
  }

  /**
   * closes podcast wrapper hiding it's contentt
   * 
   * @param {Event} e 
   */
  async _close (e) {
    const svg = e.target;
    const wrapper = svg.parentNode.parentNode;
    svg.removeEventListener('click', this._close);
    wrapper.toggleAttribute('expanded');
    await sleep(500);
    wrapper.addEventListener('click', this._expand);
  }

  /**
   * Expands podcast wrapper revealing additional elements
   * 
   * @param {Event} e 
   */
  async _expand(e) {
    qsa('.wrapper', this.shadowRoot).forEach(el => {
      if (el.hasAttribute('expanded')) {
        el.removeAttribute('expanded');
        el.addEventListener('click', this._expand);
      }
    });
    const wrapper = e.target;
    wrapper.removeEventListener('click', this._expand);
    wrapper.toggleAttribute('expanded');
    const svg = qs('#close', wrapper);
    svg.addEventListener('click', this._close);
    const playing = qs('.episode[playing]', wrapper);
    if (playing) {
      await sleep(100);
      playing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      qs('.podcast-episodes', wrapper).scrollTop = 0;
    }
  }

  /**
   * opens a dialog with option to unsub from podcast
   * 
   * @param {HTMLElement} PODCAST_TITLE_ELEMENT 
   */
  async _createUnsubDialog(PODCAST_TITLE_ELEMENT, url) {
    // container for animated loading Icon
    const LOADING_ELEMENT = ce('div');
    LOADING_ELEMENT.classList.add('loading');
    LOADING_ELEMENT.style.background = 'rgba(var(--main-rgb), 0.4)';

    const DELETE_CONFIRMATION_TEXT = ce('div');
    DELETE_CONFIRMATION_TEXT.classList.add('delete-notification-text');
    DELETE_CONFIRMATION_TEXT.textContent = `Unsubscribe from '${PODCAST_TITLE_ELEMENT.textContent}'?`;
    
    const DELETE_CONFIRMATION_DIALOG = ce('audiosync-dialog');
    DELETE_CONFIRMATION_DIALOG.toggleAttribute('cleanup');

    const YES_BUTTON = ce('audiosync-button');
    const NO_BUTTON = ce('audiosync-button');

    const DIALOG_BUTTONS = [YES_BUTTON,NO_BUTTON];

    const YES_BUTTON_CONTENTS = fillButton('check', 'yes');

    YES_BUTTON.appendChild(YES_BUTTON_CONTENTS);
    YES_BUTTON.setAttribute('color', getCSSVariableValue('--pop-color'));
    YES_BUTTON.toggleAttribute('noshadow');
    YES_BUTTON.onClick(async e => {
      await sleep(200);
      DIALOG_BUTTONS.forEach(button => {
        if (!button.hasAttribute('diabled')) button.toggleAttribute('disabled');
      });
      LOADING_ELEMENT.style.display = 'flex';
      await fadeIn(LOADING_ELEMENT);
      await pywebview.api.unsubscribe(url);
      new Toast(`${PODCAST_TITLE_ELEMENT.textContent} unsubscribed`);
      await sleep(200);
      await DELETE_CONFIRMATION_DIALOG.close();
      this.listPodcasts();
      await sleep(350);
      DELETE_CONFIRMATION_DIALOG.remove();
    });

    const NO_BUTTON_CONTENTS = fillButton('close', 'no');
    
    NO_BUTTON.appendChild(NO_BUTTON_CONTENTS);
    NO_BUTTON.setAttribute('color', 'var(--main-color)');
    NO_BUTTON.toggleAttribute('noshadow');
    NO_BUTTON.onClick(async e => {
      await sleep(200);
      DIALOG_BUTTONS.forEach(button => {
        if (!button.hasAttribute('diabled')) button.toggleAttribute('disabled');
      });
      await DELETE_CONFIRMATION_DIALOG.close();
      await sleep(350);
      DELETE_CONFIRMATION_DIALOG.remove();
    });

    [
      LOADING_ELEMENT,
      DELETE_CONFIRMATION_TEXT,
      YES_BUTTON,
      NO_BUTTON
    ].forEach(el => DELETE_CONFIRMATION_DIALOG.appendChild(el));
    
    qs('body').appendChild(DELETE_CONFIRMATION_DIALOG);
    await sleep(20);
    DELETE_CONFIRMATION_DIALOG.open();
  }

  /**
   * appends a li element with podcast episode details to podcast-episodes 
   * 
   * @param {Object} episode 
   * @param {HTMLElement} EPISODE_LIST 
   */
  async _createEpisodeElement(title, episode, EPISODE_LIST) {


    const play_button = ce('audiosync-small-button');
    play_button.appendChild(await svgIcon('play'));
    
    const ep_title = ce('span');
    ep_title.classList.add('ep-name');
    ep_title.textContent = episode.title;
    
    const ep_wrapper = ce('div');
    ep_wrapper.classList.add('episode');
    ep_wrapper.dataset.episode = episode.title;
    ep_wrapper.dataset.title = title;
    
    if ('itunes:episode' in episode) {
      const ep_num = ce('span');
      ep_num.textContent = episode['itunes:episode'];
      ep_num.classList.add('ep-number');
      ep_wrapper.appendChild(ep_num);
      }
    [
      ep_title,
      play_button
    ].forEach(el => ep_wrapper.appendChild(el));
    EPISODE_LIST.appendChild(ep_wrapper);

    const FILE_STATS = await pywebview.api.episodeExists(title, episode);

    if (!FILE_STATS.exists) {
      const download_button = ce('audiosync-small-button');
      download_button.appendChild(await svgIcon('download'));
      ep_wrapper.appendChild(download_button);
    }
    
    const path = FILE_STATS.path.replace(/\\/g, '/')

    play_button.onClick(_ => {
      const play_Object = {
        tracks: [
          {
            'art': `podcasts/${path.replace(FILE_STATS.filename, 'cover.jpg')}`,
            'path': `podcasts/${path}`,
            'album': episode.title,
            'artist': title,
            'title': episode.title,
            'track': episode['itunes:episode'] || 0,
            'disc': 0
          }
        ]
      }
      if (FILE_STATS.exists) {
        qs('audiosync-player').playAlbum(play_Object);
      } else {
        play_Object.tracks[0].path = episode.enclosure['@url'];
        qs('audiosync-player').playAlbum(play_Object);
      }
    });
  }

  /**
   * progressavly loads episodes on scroll
   * 
   * @param {Array} episodes 
   * @param {HTMLElement} scrollEl 
   */
  _lazyLoadOnScroll(title, episodes, scrollEl) {
    let ndx = 0;
    let pullNumber = 7;
    let self = this;
    function load() {
      const eps = episodes.slice(ndx, ndx + pullNumber);
      for (const episode of eps) {
        self._createEpisodeElement(title, episode, scrollEl);
      }
    }
    load();
    scrollEl.onscroll = _ => {
      if (scrollEl.scrollTop / (scrollEl.scrollHeight - scrollEl.clientHeight) === 1) {
        ndx += pullNumber;
        load();
      }
    };
  }

  /**
   * get the name of a podcast and put it in a html element
   * 
   * @param {String} url podcast url
   */
  async _fetchAndParseXML(url) {
    const DL_PROGRESS = ce('div');
    DL_PROGRESS.classList.add('dl-progress');

    const DL_STATS = ce('div');
    DL_STATS.classList.add('dl-stats');

    const UPDATING_ICON = await svgIcon('refresh');
    UPDATING_ICON.classList.add('updating-icon');

    const PLAYING_ICON = await svgIcon('playing');
    PLAYING_ICON.classList.add('playing-icon');

    const PODCAST_TITLE_ELEMENT = ce('span');
    PODCAST_TITLE_ELEMENT.classList.add('podcast-title');
    PODCAST_TITLE_ELEMENT.textContent = 'Loading'

    const UNSUBSCRIBE_PODCAST_BUTTON = ce('audiosync-small-button');
    UNSUBSCRIBE_PODCAST_BUTTON.appendChild(await svgIcon('delete'));
    UNSUBSCRIBE_PODCAST_BUTTON.onClick(_ => this._createUnsubDialog(PODCAST_TITLE_ELEMENT, url));

    const CLOSE_BUTTON = ce('audiosync-small-button');
    CLOSE_BUTTON.id = 'close';
    CLOSE_BUTTON.appendChild(await svgIcon('close'));


    const BUTTONS_CONTAINER = ce('div');
    BUTTONS_CONTAINER.classList.add('buttons');
    [
      UNSUBSCRIBE_PODCAST_BUTTON,
      CLOSE_BUTTON
    ].forEach(el => BUTTONS_CONTAINER.appendChild(el));


    const EPISODE_LIST = ce('div');
    EPISODE_LIST.classList.add('podcast-episodes');


    pywebview.api.xmlProxy(url).then(async xmlString => {
      PODCAST_TITLE_ELEMENT.textContent = xmlString.rss.channel.title;
      this._lazyLoadOnScroll(xmlString.rss.channel.title, xmlString.rss.channel.item, EPISODE_LIST);
    }).catch(error => {
      PODCAST_TITLE_ELEMENT.textContent = url;
      console.error('Error fetching XML:', error);
    });

    const PODCAST_WRAPPER = ce('div');
    PODCAST_WRAPPER.id = url;
    PODCAST_WRAPPER.classList.add('wrapper');
    PODCAST_WRAPPER.style.setProperty('--progress', '-100%');
    PODCAST_WRAPPER.addEventListener('click', this._expand);
    [
      DL_PROGRESS,
      DL_STATS,
      UPDATING_ICON,
      PLAYING_ICON,
      PODCAST_TITLE_ELEMENT,
      BUTTONS_CONTAINER,
      EPISODE_LIST
    ].forEach(el => PODCAST_WRAPPER.appendChild(el));

    this.container.appendChild(PODCAST_WRAPPER);
  }
}
customElements.define('audiosync-podcasts', AudioSyncPodcasts);
