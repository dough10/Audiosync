import {
  Toast,
  Timer,
  animateElement,
  ce,
  qs,
  qsa,
  sleep,
  createRipple,
  alertUser,
  fadeIn,
  fadeOut,
  parseCSS,
  objectToCSS,
  getFilenameWithoutExtension
} from './helpers.js';

  
let _loadTimer = 0

/**
 * returns index of theme with the given name
 * 
 * @param {String} themename 
 * 
 * @returns {Number}
 */
function themenameToIndex(themename) {
  const OPTIONS = qsa('option', qs('.select-text'));
  for (let i = 0; i < OPTIONS.length; i++) {
    const VALUE = getFilenameWithoutExtension(OPTIONS[i].value)
    if (themename === VALUE) return i;
  }
  return -1;
}

/**
 * load theme CSS 
 * 
 * @param {Object} theme 
 */
function loadTheme(theme) {
  const STYLES = parseCSS(qs('style').textContent);
  for (const key in theme) {
    STYLES[':root'][key] = theme[key];
  }
  qs('style').textContent = objectToCSS(STYLES);
  // refresh button color
  qs('audiosync-button', qs('sync-ui').shadowRoot).setAttribute('color', 'var(--pop-color)');
  qsa('audiosync-small-button').forEach(el => el.setAttribute('color', 'var(--text-color)'));
  qsa('audiosync-small-button', qs('audiosync-player').shadowRoot).forEach(el => {
    if (el.id !== 'favorite') el.setAttribute('color', 'var(--text-color)');
  });
}

/**
 * detect system darkmode setting
 * 
 * @returns {Boolean}
 */
function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * toggle switch state has changed
 * 
 * @param {Event} ev 
 */
async function toggleSwitchCallback(ev) {
  const SYNC_UI_ELEMENT = qs('sync-ui');
  const RESET_LYRIC_FILES_SWITCH = qs('#remove-lrc');
  
  const CONFIG_CHANGES = {}
  if (ev.detail.id === 'cues') {
    CONFIG_CHANGES['import_cues'] = ev.detail.state;
  } else if (ev.detail.id === 'lyrics') {
    CONFIG_CHANGES['import_lyrics'] = ev.detail.state;
  } else if (ev.detail.id === 'remove-lrc') {
    CONFIG_CHANGES['remove_lrc_wd'] = ev.detail.state;
  } else if (ev.detail.id === 'podcast') {
    CONFIG_CHANGES['podcast'] = ev.detail.state;
  }
  const CURRENT_STATES = await pywebview.api.update_config(CONFIG_CHANGES);

  // podcasts transfer bar
  if (!CURRENT_STATES.podcast) {
    SYNC_UI_ELEMENT.hideBar('#podcasts-bar');
  } else {
    SYNC_UI_ELEMENT.showBar('#podcasts-bar');
  }
  
  //  playlist transfer bar
  if (!CURRENT_STATES.import_cues) {
    SYNC_UI_ELEMENT.hideBar('#playlists-bar');
  } else {
    SYNC_UI_ELEMENT.showBar('#playlists-bar');
  }

  // reset lyric files switch
  if (!CURRENT_STATES.import_lyrics) {
    await fadeOut(RESET_LYRIC_FILES_SWITCH);
    RESET_LYRIC_FILES_SWITCH.style.display = 'none';
  } else {
    RESET_LYRIC_FILES_SWITCH.style.removeProperty('display');
    fadeIn(RESET_LYRIC_FILES_SWITCH);
  }
}

/**
 * hide a HTMLElement
 * 
 * @param {HTMLElement} el 
 */
async function hideElement(el) {
  await fadeOut(el);
  el.style.display = 'none';
}

/**
 * show a HTMLElement
 * 
 * @param {HTMLElement} el 
 */
async function showElement(el) {
  el.style.removeProperty('display');
  fadeIn(el);
}

/**
 * setup listeners and fetch data
*/
async function load_app() {

  const PLAYER = qs('audiosync-player');
  const MUSIC_LIBRARY = qs('music-library');
  const PAGES = qs('audiosync-pages');
  const SYNC_BUTTON = qs('#update');
  const SCROLL_ELEMENT = qs('scroll-element');
  const SYNC_UI_ELEMENT = qs('sync-ui');
  const MUSIC_HEADER_BUTTONS = qsa('.music');
  const PODCAST_HEADER_BUTTONS  = qsa('.podcast');
  const MUSIC_LIBRARY_MENU_BUTTON = qs('#music');
  const PODCAST_LIBRARY_MENU_BUTTON = qs('#casts');
  const HAMBURGER_MENU = qs('#menu-button');
  const MUSIC_LIBRARY_SCAN_BUTTON = qs('#scan');
  const MUSIC_LIBRARY_FAVORITE_BUTTON = qs('#favorite');
  const PODCAST_LIBRARY_ADD_BUTTON = qs('#add');
  const MENU_DRAWER = qs('audiosync-menu');
  const PODCAST_LIBRARY_REFRESH = qs('#refresh');
  const HEADER_SETTING_BUTTON = qs('#settings');
  const SETTINGS_DRAWER = qs('audiosync-settings');
  const ALERT_ELEMENT = qs('#alert');
  const PODCAST_LIBRARY = qs('audiosync-podcasts');
  const THEME_DROPDOWN = qs('.select-text');
  const IMPORT_PLAYLISTS_SWITCH = qs('#cues');
  const IMPORT_LYRICS_SWITCH = qs('#lyrics');
  const RESET_LYRIC_FILES_SWITCH = qs('#remove-lrc');
  const IMPORT_PODCASTS_SWITCH = qs('#podcast');
  const TOGGLE_SWITCHES = qsa('audiosync-switch');
  const MUSIC_LIBRARY_VIEW_TOGGLE_BUTTON = qs('#view');

  const GRID_ICON = "M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520ZM200-600h160v-160H200v160Zm400 0h160v-160H600v160Zm0 400h160v-160H600v160Zm-400 0h160v-160H200v160Zm400-400Zm0 240Zm-240 0Zm0-240Z";
  const LIST_ICON = "M360-240h440v-107H360v107ZM160-613h120v-107H160v107Zm0 187h120v-107H160v107Zm0 186h120v-107H160v107Zm200-186h440v-107H360v107Zm0-187h440v-107H360v107ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z";


  if (_loadTimer) {
    clearTimeout(_loadTimer);
    _loadTimer = 0;
  }

  THEME_DROPDOWN.addEventListener('change', async e => {
    const theme = await pywebview.api.load_theme(THEME_DROPDOWN.value);
    loadTheme(theme);
    pywebview.api.update_config({"theme": THEME_DROPDOWN.selectedIndex});
  });
  
  const THEMES_LIST = await pywebview.api.get_themes();
  THEMES_LIST.forEach(theme => {
    const OPTION_ELEMENT = ce('option');
    OPTION_ELEMENT.value = theme.path;
    OPTION_ELEMENT.textContent = theme.name;
    THEME_DROPDOWN.appendChild(OPTION_ELEMENT);
  });

  // set --pop-color elements the new accent color
  PLAYER.addEventListener('image-loaded', e => {
    const palette = e.detail.palette;
    document.documentElement.style.setProperty('--pop-rgb', palette.variable);
    [
      qs('audiosync-button', SYNC_UI_ELEMENT.shadowRoot),
      qs('audiosync-fab', SCROLL_ELEMENT.shadowRoot)
    ].forEach(el => {
      if (el) el.setAttribute('color', palette.fab);
    });
  });
  
  MUSIC_LIBRARY.addEventListener('library-scan', async e => {
    if (!SYNC_BUTTON.hasAttribute('disabled')) SYNC_BUTTON.toggleAttribute('disabled');
    SYNC_BUTTON.setAttribute('percent', e.detail.percent);
    if (e.detail.percent === 100) {
      await sleep(500);
      SYNC_BUTTON.setAttribute('percent', 0);
      SYNC_BUTTON.removeAttribute('disabled');
      new Toast('Scan complete');
    }
  });

  SYNC_UI_ELEMENT.addEventListener('total-progress', e => SYNC_BUTTON.setAttribute('percent', e.detail.percent));

  /**
   * button / switch interactions
   */

  MUSIC_LIBRARY_MENU_BUTTON.onClick(async _ => {
    await sleep(20);
    await MENU_DRAWER.close();
    if (PLAYER.hasAttribute('fullscreen')) {
      await PLAYER.minimize();
    }
    if (PAGES.getAttribute('selected') === '0') return;
    PAGES.setAttribute('selected', 0);
    PODCAST_HEADER_BUTTONS.forEach(hideElement);
    await sleep(500);
    MUSIC_HEADER_BUTTONS.forEach(showElement);
  });

  PODCAST_LIBRARY_MENU_BUTTON.onClick(async _ => {
    await sleep(20);
    await MENU_DRAWER.close();
    if (PLAYER.hasAttribute('fullscreen')) {
      await PLAYER.minimize();
    }
    if (PAGES.getAttribute('selected') === '1') return;
    PAGES.setAttribute('selected', 1);
    MUSIC_HEADER_BUTTONS.forEach(hideElement);
    await sleep(500);
    PODCAST_HEADER_BUTTONS.forEach(showElement);
  });

  // header hamburger icon
  HAMBURGER_MENU.onClick(_ => MENU_DRAWER.open());

  MUSIC_LIBRARY_SCAN_BUTTON.onClick(async _ => {
    MUSIC_LIBRARY_SCAN_BUTTON.toggleAttribute('disabled');
    new Toast('Library scan started');
    await pywebview.api.create_json();
    MUSIC_LIBRARY_SCAN_BUTTON.removeAttribute('disabled');
  });
  
  MUSIC_LIBRARY_VIEW_TOGGLE_BUTTON.onClick(_ => {
    const ICON = qs('path', MUSIC_LIBRARY_VIEW_TOGGLE_BUTTON);

    if (MUSIC_LIBRARY.getAttribute('view') === 'list') {
      ICON.setAttribute('d', LIST_ICON);
      MUSIC_LIBRARY.setAttribute('view', 'grid');
    } else {
      ICON.setAttribute('d', GRID_ICON);
      MUSIC_LIBRARY.setAttribute('view', 'list');
    }
    MUSIC_LIBRARY.go();
  });

  MUSIC_LIBRARY_FAVORITE_BUTTON.onClick( _ => {
    if (MUSIC_LIBRARY.hasAttribute('favorites')) {
      qs('path', MUSIC_LIBRARY_FAVORITE_BUTTON).style.opacity = 0.5;
      new Toast('Displaying all', 1);
    } else {
      qs('path', MUSIC_LIBRARY_FAVORITE_BUTTON).style.opacity = 1;
      new Toast('Displaying favorites', 1);
    }
    MUSIC_LIBRARY.favorites();
  });
  
  PODCAST_LIBRARY_ADD_BUTTON.onClick(_ => PODCAST_LIBRARY.openAddPodcastDialog());

  PODCAST_LIBRARY_REFRESH.onClick(async _ => {
    await sleep(100);
    PODCAST_LIBRARY_REFRESH.toggleAttribute('disabled');
    const t = new Timer('Podcasts Update');
    await pywebview.api.get_podcasts();
    PODCAST_LIBRARY_REFRESH.removeAttribute('disabled');
    new Toast(t.endString());
    PODCAST_LIBRARY.resetCheckMarks();
  });

  // header gear icon
  HEADER_SETTING_BUTTON.onClick(_ => SETTINGS_DRAWER.open());

  // menu drawer refresh / update icon
  SYNC_BUTTON.onClick(async _ => {
    await sleep(20);
    await MENU_DRAWER.close();
    if (SYNC_UI_ELEMENT.syncing) {
      await sleep(200);
      SYNC_UI_ELEMENT.open();
      return;
    }
    [
      MUSIC_LIBRARY_SCAN_BUTTON, 
      PODCAST_LIBRARY_ADD_BUTTON
    ].forEach(el => {
      if (!el.hasAttribute('disabled')) el.toggleAttribute('disabled');
    });
    SYNC_UI_ELEMENT.startSync();
    await pywebview.api.run_sync();
    PODCAST_LIBRARY_ADD_BUTTON.removeAttribute('disabled');
  });

  // top of screen alert
  ALERT_ELEMENT.addEventListener('click', async clickEvent => {
    createRipple(clickEvent);
    await sleep(20);
    await animateElement(clickEvent.target, 'translateY(-120%)', 800, 0);
  });

  // when a switch is changed update config & UI
  TOGGLE_SWITCHES.forEach(toggleSwitch => toggleSwitch.addEventListener('statechange', toggleSwitchCallback));

  /**
   * load data
   */

  // get settings from config.json
  const CONFIG_OBJECT = await pywebview.api.get_config();

  let theme = themenameToIndex('light');

  theme = CONFIG_OBJECT.theme;

  if (isDarkMode()) {
    theme = themenameToIndex('dark');
  }

  THEME_DROPDOWN.selectedIndex = theme;
  
  const THEME_OBJECT = await pywebview.api.load_theme(THEME_DROPDOWN.value);
  loadTheme(THEME_OBJECT);

  // playlist import ui
  IMPORT_PLAYLISTS_SWITCH.setState(CONFIG_OBJECT.import_cues);
  if (!CONFIG_OBJECT.import_cues) {
    SYNC_UI_ELEMENT.hideBar('#playlists-bar');
  }

  // lyrics import
  IMPORT_LYRICS_SWITCH.setState(CONFIG_OBJECT.import_lyrics);
  RESET_LYRIC_FILES_SWITCH.setState(CONFIG_OBJECT.remove_lrc_wd);

  // podcast import ui
  IMPORT_PODCASTS_SWITCH.setState(CONFIG_OBJECT.podcast);
  if (!CONFIG_OBJECT.podcast) {
    SYNC_UI_ELEMENT.hideBar('#podcasts-bar');
  }

  // reset .lrc UI
  if (!CONFIG_OBJECT.import_lyrics) {
    RESET_LYRIC_FILES_SWITCH.style.opacity = 0;
    RESET_LYRIC_FILES_SWITCH.style.display = 'none';
  } else {
    RESET_LYRIC_FILES_SWITCH.style.opacity = 1;
    RESET_LYRIC_FILES_SWITCH.style.removeProperty('display');
  }

  // load media library
  MUSIC_LIBRARY.addEventListener('lib_size_updated', e => MENU_DRAWER.footElement(e.detail.lib_size));

  MUSIC_LIBRARY.setAttribute('view', CONFIG_OBJECT.view || 'list');

  const ICON = qs('path', MUSIC_LIBRARY_VIEW_TOGGLE_BUTTON);
  if (MUSIC_LIBRARY.getAttribute('view') === 'list') {
    ICON.setAttribute('d', GRID_ICON);
  } else {
    ICON.setAttribute('d', LIST_ICON);
  }


  if (MUSIC_LIBRARY.hasAttribute('favorites')) {
    qs('path', MUSIC_LIBRARY_FAVORITE_BUTTON).style.opacity = 1;
  } else {
    qs('path', MUSIC_LIBRARY_FAVORITE_BUTTON).style.opacity = 0.5;
  }

  await MUSIC_LIBRARY.go();

  // load podcasts from config and generate UI
  await PODCAST_LIBRARY.listPodcasts();

  // load screen animation
  qs('#app').style.removeProperty('display');
  await sleep(400)
  qs('audiosync-loader').reveal();
}

/**
 * application loaded begin startup
 */
window.addEventListener('pywebviewready', load_app);

// sometimes the previous ever doesn't fire
_loadTimer = setTimeout(load_app, 2000);

window.onerror = async function(message, source, lineno, colno, error) {
  console.error('Error:', message, 'at', source, 'line:', lineno, 'column:', colno);
  alertUser(`Error: ${message} at ${source} line:${lineno} column:${colno}`);
  return true;
};
