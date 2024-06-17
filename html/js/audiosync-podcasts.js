import {qs, qsa, ce, svgIcon, sleep, fadeIn, fadeOut, Toast, Timer, isValidURL, fillButton, objectToCSS, getCSSVariableValue} from './helpers.js';

/**
 * displays podcast show info
 */
class AudioSyncPodcasts extends HTMLElement {
  constructor() {
    super();

    const CSS_OBJECT = {
      'svg': {
        'height': '24px',
        'width': '24px'
      },
      'svg > *': {
        'pointer-events': 'none'
      },
      '.card': {
        'color': 'var(--text-color)',
        'padding': '0px',
        'background': 'var(--main-color)',
        'position': 'relative',
        'margin': '0 24px',
        'border-radius': '20px',
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',
        'text-align': 'center',
        'margin-bottom': '100px',
        'overflow': 'hidden',
        'transition': 'auto 300ms ease',
        'max-width': '900px',
        'width': '100%',
        'min-width': '280px'
      },
      '.wrapper': {
        'position': 'relative',
        'padding': '0 8px',
        'border-top': 'var(--seperator-line)',
        'font-weight': 'bold',
        'min-height': '44px',
        'max-height': '44px',
        'overflow': 'hidden',
        'animation': 'close 300ms ease',
        'cursor': 'pointer'
      },
      '@keyframes close': {
        'from': {
          'min-height': '350px',
          'font-size': '18px'
        },
        'to': {
          'min-height': '44px',
          'font-size': 'initial'
        }
      },
      '.wrapper > *': {
        'pointer-events': 'none'
      },
      '.wrapper[expanded]': {
        'animation-play-state': 'running',
        'cursor': 'auto',
        'min-height': '350px',
        'animation': 'expand 300ms ease-in'
      },
      '@keyframes expand': {
        'from': {
          'min-height': '44px',
          'font-size': 'initial'
        },
        'to': {
          'min-height': '350px',
          'font-size': '18px'
        }
      },
      '.wrapper[expanded] > *': {
        'pointer-events': 'all'
      },
      '.buttons': {
        'cursor': 'pointer',
        'position': 'absolute',
        'top': '16px',
        'right': '16px',
        'display': 'none',
        'opacity': '0',
        'animation': 'hide-buttons 300ms ease'
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
        'animation': 'show-buttons 300ms ease',
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
        'position': 'absolute',
        'top': '50%',
        'left': '50%',
        'font-size': '14px',
        'will-change': 'left, top, font-size',
        'transform': 'translate(-50%, -50%)',
        'transition-property': 'left top font-size',
        'transition-duration': '300ms',
        'transition-timing-function': 'ease'
      },
      '.wrapper[expanded] > .podcast-title': {
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'padding': '24px',
        'font-size': '22px',
        'transform': 'translate(0, 0)'
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
        'align-items': 'center'
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
    this.resetCheckMarks = this.resetCheckMarks.bind(this);
    this._expand = this._expand.bind(this);
    this._close = this._close.bind(this);

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

  /**
   * resets all checkmarks 
   */
  resetCheckMarks() {
    qsa('.wrapper', this.shadowRoot).forEach(async el => {
      await sleep(1000);
      await fadeOut(qs('svg', el));
    });
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
      const DOWNLOAD_PROGRESS_BAR = this.shadowRoot.getElementById(`${name}-bar`);
      const DOWNLOADED_PRECENTAGE = ((bytes / totalBytes) * 100);
      
      DOWNLOAD_PROGRESS_BAR.style.removeProperty('display');
      fadeIn(DOWNLOAD_PROGRESS_BAR);
      qs('#title', DOWNLOAD_PROGRESS_BAR).textContent = fileName;
      qs('#percent', DOWNLOAD_PROGRESS_BAR).textContent = `${DOWNLOADED_PRECENTAGE.toFixed(1)}% @ ${DOWNLOAD_SPEED}`;
      DOWNLOAD_PROGRESS_BAR.setAttribute('percent', DOWNLOADED_PRECENTAGE);
      
      if (DOWNLOADED_PRECENTAGE == 100) {
        await fadeOut(DOWNLOAD_PROGRESS_BAR);
        DOWNLOAD_PROGRESS_BAR.style.display = 'none';
        new Toast(`${fileName} downloaded`);
        qs('#title', DOWNLOAD_PROGRESS_BAR).textContent = '';
        qs('#percent', DOWNLOAD_PROGRESS_BAR).textContent = '';
      }
    } else {
      const SVG_ICON = qs('svg', this.shadowRoot.getElementById(name));
      fadeIn(SVG_ICON);
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
  _expand(e) {
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
  async _createEpisodeElement(episode, EPISODE_LIST) {
    const play_button = ce('audiosync-small-button');
    play_button.appendChild(await svgIcon('play'));

    const download_button = ce('audiosync-small-button');
    download_button.appendChild(await svgIcon('download'));

    const ep_title = ce('span');
    ep_title.classList.add('ep-name');
    ep_title.textContent = episode.title;
    
    const ep_wrapper = ce('li');
    ep_wrapper.classList.add('episode');
    
    if ('itunes:episode' in episode) {
      const ep_num = ce('span');
      ep_num.textContent = episode['itunes:episode'];
      ep_num.classList.add('ep-number');
      ep_wrapper.appendChild(ep_num);
    }
    [
      ep_title,
      play_button,
      download_button
    ].forEach(el => ep_wrapper.appendChild(el));
    EPISODE_LIST.appendChild(ep_wrapper);
  }

  /**
   * alot of code just to get the name of a podcast and put it in a html element
   * 
   * @param {String} url podcast url
   */
  async _fetchAndParseXML(url) {

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


    const EPISODE_LIST = ce('ul');
    EPISODE_LIST.classList.add('podcast-episodes');


    pywebview.api.xmlProxy(url).then(async xmlString => {
      this.xmlData = xmlString;
      PODCAST_TITLE_ELEMENT.textContent = xmlString.rss.channel.title;
      for (const episode of xmlString.rss.channel.item) {
        await this._createEpisodeElement(episode, EPISODE_LIST);
      }
    }).catch(error => {
      PODCAST_TITLE_ELEMENT.textContent = url;
      console.error('Error fetching XML:', error);
    });

    const PODCAST_WRAPPER = ce('div');
    PODCAST_WRAPPER.classList.add('wrapper');
    PODCAST_WRAPPER.addEventListener('click', this._expand);
    [
      PODCAST_TITLE_ELEMENT,
      BUTTONS_CONTAINER,
      EPISODE_LIST
    ].forEach(el => PODCAST_WRAPPER.appendChild(el));


    this.container.appendChild(PODCAST_WRAPPER)
  }
  // async _fetchAndParseXML(url) {

  //   // title of the podcast
  //   const PODCAST_TITLE_ELEMENT = ce('div');

  //   // get title from xml URL
  //   PODCAST_TITLE_ELEMENT.textContent = 'Loading'
  //   pywebview.api.xmlProxy(url).then(async xmlString => {
  //     this.xmlData = xmlString;
  //     PODCAST_TITLE_ELEMENT.textContent = xmlString.rss.channel.title;
  //   }).catch(error => {
  //     PODCAST_TITLE_ELEMENT.textContent = url;
  //     console.error('Error fetching XML:', error);
  //   });

  //   const UNSUBSCRIBE_PODCAST_BUTTON = ce('audiosync-small-button');
  //   UNSUBSCRIBE_PODCAST_BUTTON.setAttribute('color', 'red');
  //   UNSUBSCRIBE_PODCAST_BUTTON.appendChild(await svgIcon('close'));
  //   UNSUBSCRIBE_PODCAST_BUTTON.style.opacity = 0;
  //   UNSUBSCRIBE_PODCAST_BUTTON.onClick(async ev => {
  //     //  loading animation
  //     const REFRESH_ICON = await svgIcon('refresh');
  //     REFRESH_ICON.style.height = '40px';
  //     REFRESH_ICON.style.width = '40px';
  //     REFRESH_ICON.classList.add('spinning');
      
  //     // container for animated loading Icon
  //     const LOADING_ELEMENT = ce('div');
  //     LOADING_ELEMENT.classList.add('loading');
  //     LOADING_ELEMENT.appendChild(REFRESH_ICON);
  //     LOADING_ELEMENT.style.background = 'rgba(var(--main-rgb), 0.4)';

  //     const DELETE_CONFIRMATION_TEXT = ce('div');
  //     DELETE_CONFIRMATION_TEXT.classList.add('delete-notification-text');
  //     DELETE_CONFIRMATION_TEXT.textContent = `Unsubscribe from '${PODCAST_TITLE_ELEMENT.textContent}'?`;
      
  //     const DELETE_CONFIRMATION_DIALOG = ce('audiosync-dialog');
  //     DELETE_CONFIRMATION_DIALOG.toggleAttribute('cleanup');

  //     const YES_BUTTON = ce('audiosync-button');
  //     const NO_BUTTON = ce('audiosync-button');

  //     const DIALOG_BUTTONS = [YES_BUTTON,NO_BUTTON];

  //     const YES_BUTTON_CONTENTS = fillButton('check', 'yes');

  //     YES_BUTTON.appendChild(YES_BUTTON_CONTENTS);
  //     YES_BUTTON.setAttribute('color', getCSSVariableValue('--pop-color'));
  //     YES_BUTTON.toggleAttribute('noshadow');
  //     YES_BUTTON.onClick(async e => {
  //       await sleep(200);
  //       DIALOG_BUTTONS.forEach(button => {
  //         if (!button.hasAttribute('diabled')) button.toggleAttribute('disabled');
  //       });
  //       LOADING_ELEMENT.style.display = 'flex';
  //       await fadeIn(LOADING_ELEMENT);
  //       await pywebview.api.unsubscribe(url);
  //       new Toast(`${PODCAST_TITLE_ELEMENT.textContent} unsubscribed`);
  //       await sleep(200);
  //       await DELETE_CONFIRMATION_DIALOG.close();
  //       this.listPodcasts();
  //       await sleep(350);
  //       DELETE_CONFIRMATION_DIALOG.remove();
  //     });

  //     const NO_BUTTON_CONTENTS = fillButton('close', 'no');
      
  //     NO_BUTTON.appendChild(NO_BUTTON_CONTENTS);
  //     NO_BUTTON.setAttribute('color', 'var(--main-color)');
  //     NO_BUTTON.toggleAttribute('noshadow');
  //     NO_BUTTON.onClick(async e => {
  //       await sleep(200);
  //       DIALOG_BUTTONS.forEach(button => {
  //         if (!button.hasAttribute('diabled')) button.toggleAttribute('disabled');
  //       });
  //       await DELETE_CONFIRMATION_DIALOG.close();
  //       await sleep(350);
  //       DELETE_CONFIRMATION_DIALOG.remove();
  //     });

  //     [
  //       LOADING_ELEMENT,
  //       DELETE_CONFIRMATION_TEXT,
  //       YES_BUTTON,
  //       NO_BUTTON
  //     ].forEach(el => DELETE_CONFIRMATION_DIALOG.appendChild(el));
      
  //     qs('body').appendChild(DELETE_CONFIRMATION_DIALOG);
  //     await sleep(20);
  //     DELETE_CONFIRMATION_DIALOG.open();
  //   });
    
  //   const UPDATE_COMPLETE_CHECK = await svgIcon('check');
  //   UPDATE_COMPLETE_CHECK.style.opacity = 0;

  //   // wrapper for title and checkmark
  //   const PODCAST_WRAPPER = ce('div');
  //   [
  //     PODCAST_TITLE_ELEMENT,
  //     UPDATE_COMPLETE_CHECK
  //   ].forEach(el => PODCAST_WRAPPER.appendChild(el));
  //   PODCAST_WRAPPER.classList.add('wrapper');
  //   PODCAST_WRAPPER.id = url;

  //   // show remove button on mouse over
  //   PODCAST_WRAPPER.onmouseenter = _ => {
  //     PODCAST_WRAPPER.appendChild(UNSUBSCRIBE_PODCAST_BUTTON);
  //     fadeIn(UNSUBSCRIBE_PODCAST_BUTTON);
  //   };

  //   // hide remove button when mouse leaves element
  //   PODCAST_WRAPPER.onmouseleave = async _ => {
  //     await fadeOut(UNSUBSCRIBE_PODCAST_BUTTON);
  //     UNSUBSCRIBE_PODCAST_BUTTON.remove();
  //   };

  //   // will be filled with podcast episode filename
  //   const EPISODE_TITLE = ce('div');
  //   EPISODE_TITLE.id = 'title';

  //   // download percentage
  //   const PERCENTAGE_TEXT = ce('div');
  //   PERCENTAGE_TEXT.id = 'percent';

  //   // file download progress (hidden untill download begins)
  //   const DOWNLOAD_PROGRESS_BAR = ce('audiosync-progress');
  //   [
  //     EPISODE_TITLE,
  //     PERCENTAGE_TEXT
  //   ].forEach(el => DOWNLOAD_PROGRESS_BAR.appendChild(el));
  //   DOWNLOAD_PROGRESS_BAR.id = `${url}-bar`;
  //   DOWNLOAD_PROGRESS_BAR.style.opacity = 0;
  //   DOWNLOAD_PROGRESS_BAR.style.display = 'none';

  //   // push content to UI
  //   [
  //     PODCAST_WRAPPER,
  //     DOWNLOAD_PROGRESS_BAR
  //   ].forEach(el => this.container.appendChild(el));
  // }
}
customElements.define('audiosync-podcasts', AudioSyncPodcasts);
