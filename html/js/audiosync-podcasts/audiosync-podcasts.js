import {qs, qsa, ce, svgIcon, sleep, fadeIn, Toast, elementWidth, isValidURL, fillButton, getCSSVariableValue} from '../helpers.js';

/**
 * displays podcast show info
 */
class AudioSyncPodcasts extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  /**
   * element connect
   * Called by DOM
   * @function
   * @name connectedCallback
   */
  connectedCallback() {
    // bind this
    this._expand = this._expand.bind(this);
    this._close = this._close.bind(this);
    this._lazyLoadOnScroll = this._lazyLoadOnScroll.bind(this);

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", "./js/audiosync-podcasts/audiosync-podcasts.css");
        
    // element to append podcasts to
    this.container = ce('div');
    this.container.classList.add('container');

    [
      elementStyles,
      this.container
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * audioplayer has reset playlist
   * Called by <audiosync-player>.playAlbum()
   * @function
   * @name resetPlaylist
   */
  resetPlaylist() {
    qsa('.episode[inlist]', this.shadowRoot).forEach(el => el.removeAttribute('inlist'));
  }

  /**
   * creates and opens the add podcast UI
   * @function
   * @name openAddPodcastDialog
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
      this.dispatchEvent(new CustomEvent('add-url', {
        detail:{url: INPUT_ELEMENT.value}
      }));
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

  /**
   * syncs ui with currently playing audio
   * 
   * @param {Object} details 
   * 
   * @returns {void}
   */
  nowPlaying(details) {
    [
      '.episode',
      '.wrapper'
    ].forEach(selector => qsa(selector, this.shadowRoot).forEach(el => el.removeAttribute('playing')));
    if (!details) {
      qsa('.ep-add', this.shadowRoot).forEach(el => el.classList.add('hidden'));
      this.resetPlaylist();
      return;
    }
    qsa('.ep-add', this.shadowRoot).forEach(el => el.classList.remove('hidden'));
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

      // how long the download has ran
      const TIME_PAST = (new Date().getTime() - startTime) / 1000;
      
      // speed of the download
      const DOWNLOAD_SPEED = this._formatDownloadSpeed(bytes / TIME_PAST);

      // percentage of download
      const DOWNLOADED_PRECENTAGE = ((bytes / totalBytes) * 100);

      // podcast html wrapper
      const wrapper = this.shadowRoot.getElementById(name);

      const download_buttons = qsa('.dl', wrapper);
      download_buttons.forEach(el => {
        if (!el.hasAttribute('disabled')) el.toggleAttribute('disabled');
      });

      const download_ep = qs(`[data-filename="${fileName}"]`, wrapper);
      if (download_ep && !download_ep.hasAttribute('downloading')) download_ep.toggleAttribute('downloading');

      // dowload stats element in podcast wrapper
      const DL_STATS = qs('.dl-stats', wrapper);
      DL_STATS.textContent = `${DOWNLOADED_PRECENTAGE.toFixed(1)}% @ ${DOWNLOAD_SPEED}`
      
      // enables display of ui elements showing progress of update
      if (!wrapper.hasAttribute('updating')) wrapper.toggleAttribute('updating');
      wrapper.style.setProperty('--progress', `-${100 - DOWNLOADED_PRECENTAGE}%`);
      
      // download completed
      if (DOWNLOADED_PRECENTAGE == 100) {
        wrapper.style.setProperty('--progress', `-100%`);
        new Toast(`${fileName} downloaded`);
        DL_STATS.textContent = '';
        wrapper.removeAttribute('updating');
        if (download_ep) download_ep.removeAttribute('downloading');
        this._updateEpisodeList(name, qs('.podcast-episodes', wrapper));
      }
    } else if (!name) {
      const wrappers = qsa('.wrapper', this.shadowRoot);
      wrappers.forEach(wrapper => {
        wrapper.toggleAttribute('updating');
        qsa('.dl', wrapper).forEach(el => {
          if (!el.hasAttribute('disabled')) el.toggleAttribute('disabled');
        });
      });
    } else {
      const wrapper = this.shadowRoot.getElementById(name);
      qsa('.dl', wrapper).forEach(el => el.removeAttribute('disabled'));
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
    requestAnimationFrame(_ => wrapper.toggleAttribute('expanded'));
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
        requestAnimationFrame(_ => el.removeAttribute('expanded'));
        el.addEventListener('click', this._expand);
      }
    });
    const wrapper = e.target;
    // this._updateEpisodeList(wrapper.id, qs('.podcast-episodes', wrapper));  
    wrapper.removeEventListener('click', this._expand);
    requestAnimationFrame(_ => wrapper.toggleAttribute('expanded'));
    const svg = qs('#close', wrapper);
    svg.addEventListener('click', this._close);
    await sleep(300);
    const playing = qs('.episode[playing]', wrapper);
    const downloading = qs('.episode[downloading]', wrapper);
    if (playing) {
      playing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (downloading) {
      downloading.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    
    const WILL_REMOVE_FILES = ce('div');
    WILL_REMOVE_FILES.classList.add('will-remove-files');
    WILL_REMOVE_FILES.textContent = 'Will delete any downloaded files';

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
      WILL_REMOVE_FILES,
      YES_BUTTON,
      NO_BUTTON
    ].forEach(el => DELETE_CONFIRMATION_DIALOG.appendChild(el));
    
    qs('body').appendChild(DELETE_CONFIRMATION_DIALOG);
    await sleep(20);
    DELETE_CONFIRMATION_DIALOG.open();
  }

  /**
   * clears and repopulates episode list
   * 
   * @param {String} xmlURL 
   * @param {HTMLElement} scrollEl 
   */
  _updateEpisodeList(xmlURL, scrollEl) {
    const inPlaylist = qsa('.episode[inlist]', scrollEl);
    pywebview.api.xmlProxy(xmlURL).then(async xmlString => {
      scrollEl.innerHTML = '';
      this._lazyLoadOnScroll(xmlString.rss.channel.title, xmlString.rss.channel.item, scrollEl, xmlURL);
      await sleep(200);
      for (const ep of inPlaylist) {
        const wrapper = qs(`[data-filename="${ep.dataset.filename}"]`, scrollEl);
        if (!wrapper.hasAttribute('inlist')) wrapper.toggleAttribute('inlist');
      }
    }).catch(error => {
      console.error('Error fetching XML:', error);
    }); 
  }

  /**
   * Adds an eipsode to current playlist
   * 
   * @param {Event} e 
   */
  _addEpisodeToPlaylist(wrapper, play_object) {
    wrapper.toggleAttribute('inlist');
    qs('audiosync-player').addToPlaylist(play_object);
  }

  /**
   * starts download of a podcast episode
   * 
   * @param {String} title 
   * @param {Object} episode 
   * @param {Object} FILE_STATS 
   * @param {String} xmlURL 
   * @param {HTMLElement} EPISODE_LIST 
   * @param {HTMLElement} ep_wrapper 
   * @param {HTMLElement} parent 
   * @param {HTMLElement} unsub_button 
   */
  async _downloadEpisode(title, episode, FILE_STATS, xmlURL, EPISODE_LIST, ep_wrapper, parent, unsub_button) {
    const dlButtons = qsa('.dl', EPISODE_LIST);

    // mark in UI the episode that is downloading
    ep_wrapper.toggleAttribute('downloading');

    // disable download / unsub buttons in this wrapper
    dlButtons.forEach(el => el.toggleAttribute('disabled'));
    unsub_button.toggleAttribute('disabled');

    // toggle updating attribute (update function will remove)
    parent.toggleAttribute('updating');

    // download file
    await pywebview.api.downloadEpisode(
      title, 
      episode, 
      episode.enclosure['@url'], 
      FILE_STATS.path, 
      FILE_STATS.filename, 
      xmlURL
    );
    
    // reenable buttons
    dlButtons.forEach(el => el.removeAttribute('disabled'));
    unsub_button.removeAttribute('disabled');
    
    // get refresh xml data 
    this._updateEpisodeList(xmlURL, EPISODE_LIST);
  }

  /**
   * ask backend to delete a podcast episode
   * 
   * @param {Object} FILE_STATS
   */
  async _deleteEpisode(FILE_STATS, xmlURL, scrollEl) {
    await pywebview.api.deleteEpisode(FILE_STATS);
    this._updateEpisodeList(xmlURL, scrollEl);  
  }

  /**
   * trigger episode playback
   * 
   * @param {Object} FILE_STATS 
   * @param {Object} play_Object 
   * @param {Object} episode 
   */
  async _playEpisode(ep_wrapper, FILE_STATS, play_Object, episode) {
    qsa('.episode[inlist]').forEach(el => el.removeAttribute('inlist'));
    await sleep(200);
    if (!ep_wrapper.hasAttribute('inlist')) ep_wrapper.toggleAttribute('inlist');
    if (FILE_STATS.exists) {
      // play local file
      qs('audiosync-player').playAlbum(play_Object);
    } else {
      // stream from web
      play_Object.tracks[0].path = episode.enclosure['@url'];
      qs('audiosync-player').playAlbum(play_Object);
    }
  }

  /**
   * appends a li element with podcast episode details to podcast-episodes 
   * 
   * @param {Object} episode 
   * @param {HTMLElement} EPISODE_LIST 
   */
  async _createEpisodeElement(title, episode, EPISODE_LIST, xmlURL) {
    const parent = EPISODE_LIST.parentElement;
    const unsub_button = qs('.unsub', parent);

    const prog_bar = ce('div');
    prog_bar.classList.add('ep-prog-bar');

    const play_button = ce('audiosync-small-button');
    play_button.appendChild(await svgIcon('play'));
    play_button.classList.add('ep-play');

    const add_to_playlist_button = ce('audiosync-small-button');
    add_to_playlist_button.appendChild(await svgIcon('add'));
    [
      'ep-add',
      'hidden'
    ].forEach(cssclass => add_to_playlist_button.classList.add(cssclass));
    
    const ep_title = ce('span');
    ep_title.classList.add('ep-name');
    ep_title.textContent = episode.title;
    
    const ep_wrapper = ce('li');
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
      prog_bar,
      ep_title,
      play_button,
      add_to_playlist_button
    ].forEach(el => ep_wrapper.appendChild(el));

    EPISODE_LIST.appendChild(ep_wrapper);

    const FILE_STATS = await pywebview.api.episodeExists(title, episode);

    const path = FILE_STATS.path.replace(/\\/g, '/');
    
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
    };

    ep_wrapper.dataset.filename = FILE_STATS.filename;

    if (!FILE_STATS.exists) {
      // download button if file doesn't exist
      const download_button = ce('audiosync-small-button');
      download_button.appendChild(await svgIcon('download'));
      download_button.classList.add('dl');
      download_button.onClick(_ => this._downloadEpisode(
        title, 
        episode, 
        FILE_STATS, 
        xmlURL, 
        EPISODE_LIST, 
        ep_wrapper, 
        parent, 
        unsub_button
      ));
      // if downloading an episode toggle disabled attribute
      if (parent.hasAttribute('updating')) download_button.toggleAttribute('disabled');
      ep_wrapper.appendChild(download_button);
    } else {
      const DELETE_EPISODE_BUTTON = ce('audiosync-small-button');
      DELETE_EPISODE_BUTTON.appendChild(await svgIcon('delete'));
      DELETE_EPISODE_BUTTON.classList.add('ep-del');
      DELETE_EPISODE_BUTTON.onClick(_ => this._deleteEpisode(FILE_STATS, xmlURL, EPISODE_LIST));
      ep_wrapper.appendChild(DELETE_EPISODE_BUTTON);
    }

    add_to_playlist_button.onClick(_ => this._addEpisodeToPlaylist(ep_wrapper, play_Object));

    play_button.onClick(_ => this._playEpisode(ep_wrapper, FILE_STATS, play_Object, episode));
  }

  /**
   * progressavly loads episodes on scroll
   * 
   * @param {String} title
   * @param {Array} episodes 
   * @param {HTMLElement} scrollEl 
   * @param {String} xmlURL
   */
  _lazyLoadOnScroll(title, episodes, scrollEl, xmlURL) {
    let ndx = 0;
    let pullNumber = 7;
    let self = this;
    function load() {
      const eps = episodes.slice(ndx, ndx + pullNumber);
      for (const episode of eps) {
        self._createEpisodeElement(title, episode, scrollEl, xmlURL);
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
    UNSUBSCRIBE_PODCAST_BUTTON.classList.add('unsub');
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


    const EPISODE_LIST = ce('ui');
    EPISODE_LIST.classList.add('podcast-episodes');


    pywebview.api.xmlProxy(url).then(async xmlString => {
      PODCAST_TITLE_ELEMENT.textContent = xmlString.rss.channel.title;
      this._lazyLoadOnScroll(
        xmlString.rss.channel.title, 
        xmlString.rss.channel.item, 
        EPISODE_LIST, 
        url
      );
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
