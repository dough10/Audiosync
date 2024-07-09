import {qs, qsa, ce, svgIcon, sleep, formatDownloadSpeed, calcPercentage, isValidURL, fillButton, appendElements, toggleAttribute, createButtonWithIcon} from '../helpers.js';
import {Toast} from '../Toast/Toast.js';

/**
 * Ui for managing podcast shows and episodes
 * @class
 * @extends HTMLElement
 * @this AudioSyncPodcasts
 * 
 */
class AudioSyncPodcasts extends HTMLElement {
  static get observedAttributes() {
    return ['alt-css'];
  }

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
   * @private
   *
   * @returns {Void}
   * 
   * @example
   * document.querySelector('body').appendChild(podcastLibrary);
   */
  connectedCallback() {
    const altCss = this.getAttribute('alt-css');

    // bind this
    this._expand = this._expand.bind(this);
    this._close = this._close.bind(this);
    this._lazyLoadOnScroll = this._lazyLoadOnScroll.bind(this);

    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", altCss || "./js/audiosync-podcasts/audiosync-podcasts.css");
        
    this._container = ce('div');
    this._container.classList.add('container');

    appendElements(this.shadowRoot, [
      elementStyles,
      this._container
    ]);
  }

  /**
   * attribute has changed
   * @async
   * @function
   * @private
   * 
   * @param {String} name
   * @param {Number} oldVal
   * @param {Number} newVal
   * 
   * @returns {Void}
   * 
   * @example
   * podcasstLibrary.setAttribute('alt-css', './new/path.css');
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (name != 'alt-css') return;
    if (qs('link',this.shadowRoot)) qs('link',this.shadowRoot).href = newVal;
  }

  /**
   * audioplayer has reset playlist. (unmarks elements marked with 'inlist') 
   * Used in audiosync-player.playAlbum()
   * @function
   * @public
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
   * @public
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * button.onClick(_ => poscastLibrary.openAddPodcastDialog());
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
   * @public
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
   * there are no podcast sudscriptions
   * @private
   * @function
   * 
   * @returns {void}
   */
  _noShows() {
    const noEpisodes = ce('div');
    noEpisodes.classList.add('no-episodes');
    noEpisodes.textContent = 'No Subscriptions..';
    appendElements(this._container, [noEpisodes])
  }

  /**
   * get list of podcasts and fills UI with data
   * @async
   * @function
   * @public
   * 
   * @returns {Promise<Array | Objects>}
   * 
   * @example
   * podcastLibrary.listPodcasts();
   */
  async listPodcasts() {
    const podcastURLs = await pywebview.api.list_subscriptions();
    this._container.innerHTML = '';
    if (!podcastURLs.length > 0) {
      this._noShows();
      return
    }
    podcastURLs.forEach(url => this._fetchAndParseXML(url));
  }

  /**
   * syncs ui with currently playing audio
   * @function
   * @public
   * 
   * @param {Object} details 
   * @param {String} details.art
   * @param {String} details.path
   * @param {String} details.album
   * @param {String} details.artist
   * @param {String} details.title
   * @param {Number} details.track
   * @param {Number} details.disc
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
    toggleAttribute(playing, 'playing');
    toggleAttribute(playing.parentElement.parentElement, 'playing');
  }

  /**
   * update UI with podcast download and update progress
   * @async
   * @function
   * @public
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
      const dlStats = qs('.dl-stats', wrapper);
      dlStats.textContent = `${DOWNLOADED_PRECENTAGE.toFixed(1)}% @ ${DOWNLOAD_SPEED}`;
      
      // enables display of ui elements showing progress of update
      wrapper.removeAttribute('updating');
      toggleAttribute(wrapper, 'downloading');
      wrapper.style.setProperty('--progress', `-${100 - DOWNLOADED_PRECENTAGE}%`);
      
      // download completed
      if (DOWNLOADED_PRECENTAGE == 100) {
        wrapper.style.setProperty('--progress', `-100%`);
        new Toast(`${fileName} downloaded`);
        dlStats.textContent = '';
        wrapper.removeAttribute('downloading');
        if (download_ep) download_ep.removeAttribute('downloading');
        qsa('.dl', wrapper).forEach(el => el.removeAttribute('disabled'));
        this._updateEpisodeList(name, qs('.podcast-episodes', wrapper));
      }
    } else if (!name) {
      qsa('.wrapper', this.shadowRoot).forEach(wrapper => {
        toggleAttribute(wrapper, 'updating');
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
   * @private
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * button.onClick(_ => this._addPodcastUI());
   */
  async _addPodcastUI() {
    //  loading animation
    const refreshIcon = svgIcon('refresh');
    refreshIcon.style.height = '40px';
    refreshIcon.style.width = '40px';
    refreshIcon.classList.add('spinning');
    
    // container for animated loading Icon
    const loaderElement = ce('div');
    loaderElement.classList.add('loading');
    loaderElement.appendChild(refreshIcon);

    // text input label
    const inputLabel = ce('label');
    inputLabel.classList.add('form__label');
    inputLabel.textContent = 'Podcast XML URL';
    inputLabel.setAttribute('for', 'url');
    
    // URL input
    const inputElement = ce('input');
    inputElement.setAttribute('placeholder', 'Podcast XML URL');
    inputElement.type = 'url';
    inputElement.id = 'url';
    inputElement.classList.add('form__field');
    
    // input and label wrapper
    const inputGroup = ce('div');
    inputGroup.classList.add('form__group');

    appendElements(inputGroup, [
      inputElement,
      inputLabel
    ]);
    
    // submit / add button
    const addPodcastButton = ce('audiosync-button');
    addPodcastButton.appendChild(fillButton('add', 'add'));
    toggleAttribute(addPodcastButton, 'disabled');
    
    // animated dialog card
    const addPodcastDialog = ce('audiosync-dialog');
    toggleAttribute(addPodcastDialog, 'cleanup');

    appendElements(addPodcastDialog, [
      inputGroup,
      addPodcastButton,
      loaderElement
    ]);
    
    // input callback
    inputElement.oninput = e => {
      // enable button for valid url only
      if (isValidURL(inputElement.value)) {
        addPodcastButton.removeAttribute('disabled');
      } else {
        toggleAttribute(addPodcastButton, 'disabled');
      }
    };
    
    // add button clicked
    addPodcastButton.onClick(async e => {
      await sleep(200);
      toggleAttribute(addPodcastButton, 'disabled');
      pywebview.api.subscribe(inputElement.value);
    });
    
    // if clipboard data is a url fill in the input element
    const pasteData = await pywebview.api.get_clipboard();
    if (isValidURL(pasteData)) {
      inputElement.value = pasteData;
      addPodcastButton.removeAttribute('disabled');
    }

    return addPodcastDialog;
  }

  /**
   * closes podcast wrapper hiding it's content
   * @async
   * @function
   * @private
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
    requestAnimationFrame(_ => wrapper.removeAttribute('expanded'));
    await sleep(500);
    wrapper.addEventListener('click', this._expand);
  }

  /**
   * Expands podcast wrapper revealing additional elements
   * @async
   * @function
   * @private
   * 
   * @param {Event} e 
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * button.onClick(e => this._expand(e));
   */
  async _expand(e) {
    // close any 'expanded' wrapper
    qsa('.wrapper', this.shadowRoot).forEach(el => {
      if (el.hasAttribute('expanded')) {
        requestAnimationFrame(_ => el.removeAttribute('expanded'));
        el.addEventListener('click', this._expand);
      }
    });
    const wrapper = e.target;

    // remove click listener
    wrapper.removeEventListener('click', this._expand);

    // animate clicked wrapper to 'expanded' state
    requestAnimationFrame(_ => toggleAttribute(wrapper, 'expanded'));

    // setup close listener
    const svg = qs('#close', wrapper);
    svg.addEventListener('click', this._close);
    await sleep(300);
    // scroll to the playing, downloading or just the top element
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
   * @private
   * 
   * @param {HTMLElement} PODCAST_TITLE_ELEMENT 
   * @param {String} url
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * button.onClick(_ => this._createUnsubDialog(<div podcast title>, 'https://example.com/rssfeed.xml'));
   */
  async _createUnsubDialog(podcastTitleElement, url) {
    // container for animated loading Icon
    const deleteConfirmationText = ce('div');
    deleteConfirmationText.classList.add('delete-notification-text');
    deleteConfirmationText.textContent = `Unsubscribe from '${podcastTitleElement.textContent}'?`;
    
    const willRemoveFiles = ce('div');
    willRemoveFiles.classList.add('will-remove-files');
    willRemoveFiles.textContent = 'Will delete any downloaded files';

    const deleteConfirmationDialog = ce('audiosync-dialog');
    toggleAttribute(deleteConfirmationDialog, 'cleanup');

    const yesButton = ce('audiosync-button');
    const noButton = ce('audiosync-button');

    const dialogsButtons = [yesButton,noButton];

    yesButton.appendChild(fillButton('check', 'yes'));
    toggleAttribute(yesButton, 'noshadow');
    yesButton.onClick(async _ => {
      dialogsButtons.forEach(button => toggleAttribute(button, 'disabled'));
      await pywebview.api.unsubscribe(url);
      new Toast(`${podcastTitleElement.textContent} unsubscribed`);
      await sleep(200);
      await deleteConfirmationDialog.close();
      this.listPodcasts();
      await sleep(350);
      deleteConfirmationDialog.remove();
    });
    
    noButton.appendChild(fillButton('close', 'no'));
    noButton.setAttribute('color', 'var(--main-color)');
    toggleAttribute(noButton, 'noshadow');
    noButton.onClick(async _ => {
      dialogsButtons.forEach(button => toggleAttribute(button, 'disabled'));
      await deleteConfirmationDialog.close();
      await sleep(350);
      deleteConfirmationDialog.remove();
    });

    appendElements(deleteConfirmationDialog, [
      deleteConfirmationText,
      willRemoveFiles,
      yesButton,
      noButton
    ]);
    
    qs('body').appendChild(deleteConfirmationDialog);
    await sleep(20);
    deleteConfirmationDialog.open();
  }

  /**
   * clears and repopulates episode list
   * @function
   * @private
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

      // update title
      qs('.podcast-title', scrollEl.parentElement).textContent = xmlString.rss.channel.title;

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
   * @private
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
    toggleAttribute(wrapper,'inlist');
    qs('audiosync-player').addToPlaylist(play_object);
  }

  /**
   * starts download of a podcast episode
   * @async
   * @function
   * @private
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
  async _downloadEpisode(title, episode, fileStats, xmlURL, episodeList, ep_wrapper, parent, unsub_button) {
    const dlButtons = qsa('.dl', episodeList);

    // mark in UI the episode that is downloading
    toggleAttribute(ep_wrapper, 'downloading');

    // disable download / unsub buttons in this wrapper
    dlButtons.forEach(el => toggleAttribute(el, 'disabled'));
    toggleAttribute(unsub_button, 'disabled');

    // toggle updating attribute (update function will remove)
    toggleAttribute(parent, 'downloading');

    // download file
    await pywebview.api.downloadEpisode(
      title, 
      episode, 
      episode.enclosure['@url'], 
      fileStats.path, 
      fileStats.filename, 
      xmlURL
    );
    
    parent.removeAttribute('downloading');
    dlButtons.forEach(el => el.removeAttribute('disabled'));

    // reenable buttons
    unsub_button.removeAttribute('disabled');
    
    // get refresh xml data 
    this._updateEpisodeList(xmlURL, episodeList);
  }

  /**
   * ask backend to delete a podcast episode
   * @async
   * @function
   * @private
   * 
   * @param {HTMLElement} ep_wrapper 
   * @param {Object} FILE_STATS
   * @param {String} xmlURL
   * @param {HTMLElement} scrollEl
   * 
   * @returns {Void}
   * 
   * @example
   * button.onClick(_ => this._deleteEpisode(<podcast episode>, {}, 'https://example.com/rssfeed.xml',<episode lists>));
   */
  async _deleteEpisode(ep_wrapper, fileStats, xmlURL, scrollEl) {
    qsa('audiosync-small-button', ep_wrapper).forEach(button => toggleAttribute(button, 'disabled'));
    toggleAttribute(ep_wrapper, 'updating');
    await pywebview.api.deleteEpisode(fileStats);
    this._updateEpisodeList(xmlURL, scrollEl);  
  }

  /**
   * trigger episode playback
   * @async
   * @function
   * @private
   * 
   * @param {HTMLElement} ep_wrapper
   * @param {Object} FILE_STATS 
   * @param {Object} play_Object 
   * @param {Object} episode 
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * button.onClick(_ => this._playEpisode(<podcast episode>, {}, {},{}));
   */
  async _playEpisode(ep_wrapper, fileStats, play_Object, episode) {
    qsa('.episode[inlist]').forEach(el => el.removeAttribute('inlist'));
    await sleep(200);
    toggleAttribute(ep_wrapper, 'inlist');
    if (fileStats.exists) {
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
   * @private
   * 
   * @param {Object} episode 
   * @param {HTMLElement} EPISODE_LIST 
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * button.onClick(_ => this._playEpisode(<podcast episode>, {}, <podcast list>, 'https://example.com/rssfeed.xml'));
   */
  async _createEpisodeElement(title, episode, episodeList, xmlURL) {
    const parent = episodeList.parentElement;
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

    episodeList.appendChild(ep_wrapper);

    const fileStats = await pywebview.api.episodeExists(title, episode);

    const path = fileStats.path.replace(/\\/g, '/');
    
    const play_Object = {
      tracks: [
        {
          'art': `podcasts/${path.replace(fileStats.filename, 'cover.jpg')}`,
          'path': `podcasts/${path}`,
          'album': episode.title,
          'artist': title,
          'title': episode.title,
          'track': episode['itunes:episode'] || 0,
          'disc': 0
        }
      ]
    };

    ep_wrapper.dataset.filename = fileStats.filename;

    if (!fileStats.exists) {
      // download button if file doesn't exist
      const download_button = createButtonWithIcon('audiosync-small-button', 'download', ['dl']);
      download_button.onClick(_ => this._downloadEpisode(
        title, 
        episode, 
        fileStats, 
        xmlURL, 
        episodeList, 
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
      DELETE_EPISODE_BUTTON.onClick(_ => this._deleteEpisode(ep_wrapper, fileStats, xmlURL, episodeList));
      ep_wrapper.appendChild(DELETE_EPISODE_BUTTON);
    }

    add_to_playlist_button.onClick(_ => this._addEpisodeToPlaylist(ep_wrapper, play_Object));

    play_button.onClick(_ => this._playEpisode(ep_wrapper, fileStats, play_Object, episode));
  }

  /**
   * progressavly loads episodes on scroll
   * @function
   * @private
   * 
   * @param {String} title
   * @param {Array} episodes 
   * @param {HTMLElement} scrollEl 
   * @param {String} xmlURL
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * episodeList.onscroll = e => {
   *   const scrolltop = e.target.scrollTop;
   * };
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
   * @private
   * 
   * @param {String} url podcast url
   * 
   * @returns {Promise<Void>}
   * 
   * @example
   * const podcastList = [
   *   'https://example.com/rssfeed.xml'
   * ]
   * podcastList.forEach(url => this._fetchAndParseXML(url));
   */
  async _fetchAndParseXML(url) {
    const dlProgess = ce('div');
    dlProgess.classList.add('dl-progress');

    const dlStats = ce('div');
    dlStats.classList.add('dl-stats');

    const updatingIcon = svgIcon('refresh');
    updatingIcon.classList.add('updating-icon');

    const playingIcon = svgIcon('playing');
    playingIcon.classList.add('playing-icon');

    const podcastTitleElement = ce('span');
    podcastTitleElement.classList.add('podcast-title');
    podcastTitleElement.textContent = 'Loading';

    const unsubPodcastButton = createButtonWithIcon('audiosync-small-button', 'delete', ['unsub']);
    unsubPodcastButton.onClick(_ => this._createUnsubDialog(podcastTitleElement, url));

    const closeButton = createButtonWithIcon('audiosync-small-button', 'close', []);
    closeButton.id = 'close';

    const buttonContainer = ce('div');
    buttonContainer.classList.add('buttons');

    appendElements(buttonContainer, [
      unsubPodcastButton,
      closeButton
    ]);

    const episodeList = ce('ui');
    episodeList.classList.add('podcast-episodes');

    this._updateEpisodeList(url, episodeList);

    const podcastWrapper = ce('div');
    podcastWrapper.id = url;
    podcastWrapper.classList.add('wrapper');
    podcastWrapper.style.setProperty('--progress', '-100%');
    podcastWrapper.addEventListener('click', this._expand);

    appendElements(podcastWrapper, [
      dlProgess,
      dlStats,
      updatingIcon,
      playingIcon,
      podcastTitleElement,
      buttonContainer,
      episodeList
    ]);

    this._container.appendChild(podcastWrapper);
  }
}
customElements.define('audiosync-podcasts', AudioSyncPodcasts);
