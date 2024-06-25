import {qs, qsa, ce, svgIcon, sleep, formatDownloadSpeed, calcPercentage, isValidURL, fillButton, getCSSVariableValue, appendElements, toggleAttribute, createButtonWithIcon} from '../helpers.js';
import {Toast} from '../Toast/Toast.js'

/**
 * displays podcast show info
 * @class
 * @extends HTMLElement
 * 
 */
class AudioSyncPodcasts extends HTMLElement {
  /**
   * create the podcast ui instance
   * @constructor
   * 
   * @example
   * const podcastLibrary = document.createElement('audiosync-podcasts');
   */
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  /**
   * element connect
   * @function
   *
   * @returns {Void}
   * 
   * @example
   * document.querySelector('body').appendChild(podcastLibrary);
   */
  connectedCallback() {
    // bind this
    this._expand = this._expand.bind(this);
    this._close = this._close.bind(this);
    this._lazyLoadOnScroll = this._lazyLoadOnScroll.bind(this);

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", "./js/audiosync-podcasts/audiosync-podcasts.css");
        
    /**
     * container for content
     * @type {HTMLElement}
     * 
     * @example
     * this.container.appendChild(elements);
     */
    this.container = ce('div');
    this.container.classList.add('container');

    appendElements(this.shadowRoot, [
      elementStyles,
      this.container
    ]);
  }

  /**
   * audioplayer has reset playlist. (unmarks elements marked with 'inlist') 
   * Used in <audiosync-player>.playAlbum()
   * @function
   * 
   * @returns {Void}
   * 
   * @example
   * podcastLibrary.resetPlaylist();
   */
  resetPlaylist() {
    qsa('.episode[inlist]', this.shadowRoot).forEach(el => el.removeAttribute('inlist'));
  }

  /**
   * creates and opens a dislog with options to add a url
   * Used in <audiosync-podcasts>
   * @async
   * @function
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * button.onClick(_ => audiosyncPodcasts.openAddPodcastDialog());
   */
  async openAddPodcastDialog() {
    this.addUI = await this._addPodcastUI();
    qs('body').appendChild(this.addUI);
    await sleep(100);
    this.addUI.open();
  }

  /**
   * responds to subscription input. 
   * refreshes podcast ui data and closes add url dialog
   * @async
   * @function
   * 
   * @param {String} message
   * 
   * @returns {Void}
   * 
   * @example
   * podcastLibrary.subResponse('Podcast Added');
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
   * get list of podcasts and fills UI with data
   * @async
   * @function
   * 
   * @returns {Promise<Array | Objects>}
   * 
   * @example
   * podcastLibrary.listPodcasts();
   */
  async listPodcasts() {
    const PODCASTS = await pywebview.api.list_subscriptions();
    this.container.innerHTML = '';
    await PODCASTS.forEach(url => this._fetchAndParseXML(url));
  }

  /**
   * syncs ui with currently playing audio
   * @function
   * 
   * @param {Object} details 
   * 
   * @returns {void}
   * 
   * @example 
   * pocastLibrary.nowPlaying({
   *   "art" : "Other\\Beastie Boys\\Hello Nasty_ Remastered (Disc 2)\\cover.jpg"
   *   "path": "Other\\Beastie Boys\\Hello Nasty_ Remastered (Disc 2)\\09 Stink Bug.mp3",
   *   "album": "Hello Nasty Remastered (Disc 2)",
   *   "artist": "The Beastie Boys",
   *   "title": "Stink Bug",
   *   "track": 9,
   *   "disc": 2
   * });
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
   * update UI with podcast download and update progress
   * @async
   * @function
   * 
   * @param {String} name
   * @param {Number} bytes
   * @param {Number} totalBytes
   * @param {Number} startTime
   * @param {String} filname
   * 
   * @returns {Promise<void>}
   * 
   * @example 
   * podcastLibrary.update('https://example.com/rssfeed.xml', 1000, 345890, 1719235139547, 'cool.podcast.mp3');
   */
  async update(name, bytes, totalBytes, startTime, fileName) {
    if (fileName) {

      // how long the download has ran
      const TIME_PAST = (new Date().getTime() - startTime) / 1000;
      
      // speed of the download
      const DOWNLOAD_SPEED = formatDownloadSpeed(bytes / TIME_PAST);

      // percentage of download
      const DOWNLOADED_PRECENTAGE = calcPercentage(bytes, totalBytes);

      // podcast html wrapper
      const wrapper = this.shadowRoot.getElementById(name);

      // disable download button
      qsa('.dl', wrapper).forEach(el => toggleAttribute(el, 'disabled'));

      const download_ep = qs(`[data-filename="${fileName}"]`, wrapper);
      if (download_ep) toggleAttribute(download_ep, 'downloading');

      // dowload stats element in podcast wrapper
      const DL_STATS = qs('.dl-stats', wrapper);
      DL_STATS.textContent = `${DOWNLOADED_PRECENTAGE.toFixed(1)}% @ ${DOWNLOAD_SPEED}`
      
      // enables display of ui elements showing progress of update
      wrapper.removeAttribute('updating');
      toggleAttribute(wrapper, 'downloading');
      wrapper.style.setProperty('--progress', `-${100 - DOWNLOADED_PRECENTAGE}%`);
      
      // download completed
      if (DOWNLOADED_PRECENTAGE == 100) {
        wrapper.style.setProperty('--progress', `-100%`);
        new Toast(`${fileName} downloaded`);
        DL_STATS.textContent = '';
        wrapper.removeAttribute('updating');
        if (download_ep) download_ep.removeAttribute('downloading');
        qsa('.dl', wrapper).forEach(el => el.removeAttribute('disabled'));
        this._updateEpisodeList(name, qs('.podcast-episodes', wrapper));
      }
    } else if (!name) {
      qsa('.wrapper', this.shadowRoot).forEach(wrapper => {
        wrapper.toggleAttribute('updating');
        qsa('.dl', wrapper).forEach(el => toggleAttribute(el, 'disabled'));
      });
    } else {
      const wrapper = this.shadowRoot.getElementById(name);
      qsa('.dl', wrapper).forEach(el => el.removeAttribute('disabled'));
      wrapper.removeAttribute('updating');
    }
  }

  /** 
   * creates the UI for adding podcasts to subscriptions
   * @async
   * @function
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * button.onClick(_ => this._addPodcastUI());
   */
  async _addPodcastUI() {
    //  loading animation
    const ICON = svgIcon('refresh');
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

    appendElements(INPUT_GROUP, [
      INPUT_ELEMENT,
      INPUT_LABEL
    ]);
    
    // submit / add button
    const BUTTON_CONTENTS = fillButton('add', 'add');

    const ADD_PODCAST_BUTTON = ce('audiosync-button');
    ADD_PODCAST_BUTTON.appendChild(BUTTON_CONTENTS);
    ADD_PODCAST_BUTTON.toggleAttribute('disabled');
    
    // animated dialog card
    const ADD_PODCAST_DIALOG = ce('audiosync-dialog');
    ADD_PODCAST_DIALOG.toggleAttribute('cleanup');

    appendElements(ADD_PODCAST_DIALOG, [
      INPUT_GROUP,
      ADD_PODCAST_BUTTON,
      LOADER_ELEMENT
    ]);
    
    // input callback
    INPUT_ELEMENT.oninput = e => {
      // enable button for valid url only
      if (isValidURL(INPUT_ELEMENT.value)) {
        ADD_PODCAST_BUTTON.removeAttribute('disabled');
      } else {
        toggleAttribute(ADD_PODCAST_BUTTON, 'disabled');
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
   * closes podcast wrapper hiding it's content
   * @async
   * @function
   * 
   * @param {Event} e 
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * button.onClick(e => this._close(e));
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
   * @async
   * @function
   * 
   * @param {Event} e 
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * button.onClick(e => this._expand(e));
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
   * @function
   * 
   * @param {HTMLElement} PODCAST_TITLE_ELEMENT 
   * @param {String} url
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * button.onClick(_ => this._createUnsubDialog(<div podcast title>, 'https://example.com/rssfeed.xml'));
   */
  async _createUnsubDialog(PODCAST_TITLE_ELEMENT, url) {
    // container for animated loading Icon
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
    YES_BUTTON.onClick(async _ => {
      DIALOG_BUTTONS.forEach(button => toggleAttribute(button, 'disabled'));
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
    NO_BUTTON.onClick(async _ => {
      DIALOG_BUTTONS.forEach(button => toggleAttribute(button, 'disabled'));
      await DELETE_CONFIRMATION_DIALOG.close();
      await sleep(350);
      DELETE_CONFIRMATION_DIALOG.remove();
    });

    appendElements(DELETE_CONFIRMATION_DIALOG, [
      DELETE_CONFIRMATION_TEXT,
      WILL_REMOVE_FILES,
      YES_BUTTON,
      NO_BUTTON
    ]);
    
    qs('body').appendChild(DELETE_CONFIRMATION_DIALOG);
    await sleep(20);
    DELETE_CONFIRMATION_DIALOG.open();
  }

  /**
   * clears and repopulates episode list
   * @function
   * 
   * @param {String} xmlURL 
   * @param {HTMLElement} scrollEl 
   * 
   * @returns {Void}
   * 
   * @example
   * this._updateEpisodeList('https://example.com/rssfeed.xml', <ui podcast list>);
   */
  _updateEpisodeList(xmlURL, scrollEl) {
    // cache items marked as 'inlist'
    const inPlaylist = qsa('.episode[inlist]', scrollEl);

    // get podcast data
    pywebview.api.xmlProxy(xmlURL).then(async xmlString => {

      // clear parent element
      scrollEl.innerHTML = '';

      // push element with callback to load more
      this._lazyLoadOnScroll(xmlString.rss.channel.title, xmlString.rss.channel.item, scrollEl, xmlURL);
      await sleep(200);

      // remark 'inlist' elements
      for (const ep of inPlaylist) {
        const wrapper = qs(`[data-filename="${ep.dataset.filename}"]`, scrollEl);
        toggleAttribute(wrapper, 'inlist');
      }
    }).catch(error => {
      console.error('Error fetching XML:', error);
    }); 
  }

  /**
   * Adds an eipsode to current playlist
   * @function
   * 
   * @param {HTMLElement} wrapper
   * @param {Object|String} play_object 
   * 
   * @returns {void}
   * 
   * @example
   * button.onClick(_ => this._addEpisodeToPlaylist(<podcast episode>, {}));
   */
  _addEpisodeToPlaylist(wrapper, play_object) {
    wrapper.toggleAttribute('inlist');
    qs('audiosync-player').addToPlaylist(play_object);
  }

  /**
   * starts download of a podcast episode
   * @async
   * @function
   *  
   * @param {String} title 
   * @param {Object} episode 
   * @param {Object|String} FILE_STATS 
   * @param {String} xmlURL 
   * @param {HTMLElement} EPISODE_LIST 
   * @param {HTMLElement} ep_wrapper 
   * @param {HTMLElement} parent 
   * @param {HTMLElement} unsub_button 
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * button.onClick(_ => this._downloadEpisode(
   *   'cool podcast',
   *   {path, art, title, artist},
   *   {exists, },
   *   'https://example.com/rssfeed.xml',
   *   <ul scroll container>,
   *   <li podcast episode>,
   *   <parent>,
   *   <button>
   * ));
   */
  async _downloadEpisode(title, episode, FILE_STATS, xmlURL, EPISODE_LIST, ep_wrapper, parent, unsub_button) {
    const dlButtons = qsa('.dl', EPISODE_LIST);

    // mark in UI the episode that is downloading
    ep_wrapper.toggleAttribute('downloading');

    // disable download / unsub buttons in this wrapper
    dlButtons.forEach(el => el.toggleAttribute('disabled'));
    unsub_button.toggleAttribute('disabled');

    // toggle updating attribute (update function will remove)
    parent.toggleAttribute('downloading');

    // download file
    await pywebview.api.downloadEpisode(
      title, 
      episode, 
      episode.enclosure['@url'], 
      FILE_STATS.path, 
      FILE_STATS.filename, 
      xmlURL
    );
    
    parent.removeAttribute('downloading');
    dlButtons.forEach(el => el.removeAttribute('disabled'));

    // reenable buttons
    unsub_button.removeAttribute('disabled');
    
    // get refresh xml data 
    this._updateEpisodeList(xmlURL, EPISODE_LIST);
  }

  /**
   * ask backend to delete a podcast episode
   * @async
   * @function
   * 
   * @param {HTMLElement} ep_wrapper 
   * @param {Object} FILE_STATS
   * @param {String} xmlURL
   * @param {HTMLElement} scrollEl
   * 
   * @returns {Void}
   */
  async _deleteEpisode(ep_wrapper, FILE_STATS, xmlURL, scrollEl) {
    qsa('audiosync-small-button', ep_wrapper).forEach(button => toggleAttribute(button, 'disabled'));
    toggleAttribute(ep_wrapper, 'updating');
    await pywebview.api.deleteEpisode(FILE_STATS);
    this._updateEpisodeList(xmlURL, scrollEl);  
  }

  /**
   * trigger episode playback
   * @async
   * @function
   * 
   * @param {HTMLElement} ep_wrapper
   * @param {Object} FILE_STATS 
   * @param {Object} play_Object 
   * @param {Object} episode 
   * 
   * @returns {Promise<Void>}
   */
  async _playEpisode(ep_wrapper, FILE_STATS, play_Object, episode) {
    qsa('.episode[inlist]').forEach(el => el.removeAttribute('inlist'));
    await sleep(200);
    toggleAttribute(ep_wrapper, 'inlist');
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
   * @async
   * @function
   * 
   * @param {Object} episode 
   * @param {HTMLElement} EPISODE_LIST 
   * 
   * @returns {Promise<Void>}
   */
  async _createEpisodeElement(title, episode, EPISODE_LIST, xmlURL) {
    const parent = EPISODE_LIST.parentElement;
    const unsub_button = qs('.unsub', parent);

    const prog_bar = ce('div');
    prog_bar.classList.add('ep-prog-bar');

    const play_button = createButtonWithIcon('audiosync-small-button', 'play', ['ep-play']);

    const add_to_playlist_button = createButtonWithIcon('audiosync-small-button', 'add', [
      'ep-add',
      'hidden'
    ]);
    
    const updatingIcon = svgIcon('refresh');
    updatingIcon.classList.add('updating-icon');

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

    appendElements(ep_wrapper, [
      updatingIcon,
      prog_bar,
      ep_title,
      play_button,
      add_to_playlist_button
    ]);

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
      const download_button = createButtonWithIcon('audiosync-small-button', 'download', ['dl']);
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
      if (parent.hasAttribute('updating')) toggleAttribute(download_button, 'disabled');
      if (parent.hasAttribute('downloading')) toggleAttribute(download_button, 'disabled');
      ep_wrapper.appendChild(download_button);
    } else {
      const DELETE_EPISODE_BUTTON = createButtonWithIcon('audiosync-small-button', 'delete', ['ep-del']);
      DELETE_EPISODE_BUTTON.onClick(_ => this._deleteEpisode(ep_wrapper, FILE_STATS, xmlURL, EPISODE_LIST));
      ep_wrapper.appendChild(DELETE_EPISODE_BUTTON);
    }

    add_to_playlist_button.onClick(_ => this._addEpisodeToPlaylist(ep_wrapper, play_Object));

    play_button.onClick(_ => this._playEpisode(ep_wrapper, FILE_STATS, play_Object, episode));
  }

  /**
   * progressavly loads episodes on scroll
   * @function
   * 
   * @param {String} title
   * @param {Array} episodes 
   * @param {HTMLElement} scrollEl 
   * @param {String} xmlURL
   * 
   * @returns {Promise<Void>}
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
   * @async
   * @function
   * 
   * @param {String} url podcast url
   * 
   * @returns {Promise<Void>}
   */
  async _fetchAndParseXML(url) {
    const DL_PROGRESS = ce('div');
    DL_PROGRESS.classList.add('dl-progress');

    const DL_STATS = ce('div');
    DL_STATS.classList.add('dl-stats');

    const UPDATING_ICON = svgIcon('refresh');
    UPDATING_ICON.classList.add('updating-icon');

    const PLAYING_ICON = svgIcon('playing');
    PLAYING_ICON.classList.add('playing-icon');

    const PODCAST_TITLE_ELEMENT = ce('span');
    PODCAST_TITLE_ELEMENT.classList.add('podcast-title');
    PODCAST_TITLE_ELEMENT.textContent = 'Loading'

    const UNSUBSCRIBE_PODCAST_BUTTON = createButtonWithIcon('audiosync-small-button', 'delete', ['unsub']);
    UNSUBSCRIBE_PODCAST_BUTTON.onClick(_ => this._createUnsubDialog(PODCAST_TITLE_ELEMENT, url));

    const CLOSE_BUTTON = createButtonWithIcon('audiosync-small-button', 'close', []);
    CLOSE_BUTTON.id = 'close';

    const BUTTONS_CONTAINER = ce('div');
    BUTTONS_CONTAINER.classList.add('buttons');

    appendElements( BUTTONS_CONTAINER, [
      UNSUBSCRIBE_PODCAST_BUTTON,
      CLOSE_BUTTON
    ]);

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

    appendElements(PODCAST_WRAPPER, [
      DL_PROGRESS,
      DL_STATS,
      UPDATING_ICON,
      PLAYING_ICON,
      PODCAST_TITLE_ELEMENT,
      BUTTONS_CONTAINER,
      EPISODE_LIST
    ]);

    this.container.appendChild(PODCAST_WRAPPER);
  }
}
customElements.define('audiosync-podcasts', AudioSyncPodcasts);
