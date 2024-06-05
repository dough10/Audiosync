import {
  Toast,
  animateElement,
  qs,
  qsa,
  sleep,
  createRipple,
  alertUser,
  fadeIn,
  fadeOut,
  getCSSVariableValue
} from './helpers.js';

(_ => {
  
  let _loadTimer = 0
  
  
  /**
   * setup listeners and fetch data
  */
 async function load_app(e) {

    if (_loadTimer) {
      clearTimeout(_loadTimer);
      _loadTimer = 0;
    }

    const debouneTime = 100;
    let last = 0;

    const player = qs('audiosync-player');
    const musicLib = qs('music-library');
    const pages = qs('audiosync-pages');
    const updateButton = qs('#update');
    const scrollElement = qs('scroll-element');

    // set --pop-color elements the new accent color
    player.addEventListener('image-loaded', e => {
      const palette = e.detail.palette;
      document.documentElement.style.setProperty('--switch-rgb', palette.variable);
      [
        qs('audiosync-button', qs('sync-ui').shadowRoot),
        qs('audiosync-fab', qs('scroll-element').shadowRoot)
      ].forEach(el => el.setAttribute('color', palette.fab));
    });
    
    musicLib.addEventListener('library-scan', async e => {
      if (!updateButton.hasAttribute('disabled')) updateButton.toggleAttribute('disabled');
      updateButton.setAttribute('percent', e.detail.percent);
      if (e.detail.percent === 100) {
        await sleep(500);
        updateButton.setAttribute('percent', 0);
        updateButton.removeAttribute('disabled');
        new Toast('Scan complete')
      }
    });

    qs('sync-ui').addEventListener('total-progress', e => {
      updateButton.setAttribute('percent', e.detail.percent);
    });


    /**
     * button / switch interactions
     */

    qs('#music').onClick(async _ => {
      if (player.hasAttribute('fullscreen')) {
        await player.minimize();
      }
      if (pages.getAttribute('selected') === '0') return;
      pages.setAttribute('selected', 0);
    });

    qs('#casts').onClick(async _ => {
      if (player.hasAttribute('fullscreen')) {
        await player.minimize();
      }
      if (pages.getAttribute('selected') === '1') return;
      pages.setAttribute('selected', 1);
    });

    // header hamburger icon
    qs('#menu-button').onClick(_ => {
      qs('audiosync-menu').open();
    });

    // header gear icon
    qs('#settings').onClick(_ => qs('audiosync-settings').open());

    // menu drawer refresh / update icon
    updateButton.onClick(async _ => {
      await sleep(20);
      await qs('audiosync-menu').close();
      if (qs('sync-ui').syncing) {
        await sleep(200);
        qs('sync-ui').open();
        return;
      }
      const scan = qs('#scan', qs('music-library').shadowRoot);
      const addButton = qs('#add', qs('audiosync-podcasts').shadowRoot);
      if (!scan.hasAttribute('disabled')) scan.toggleAttribute('disabled');
      if (!addButton.hasAttribute('disabled')) addButton.toggleAttribute('disabled');
      qs('sync-ui').startSync();
      await pywebview.api.run_sync();
      addButton.removeAttribute('disabled');
    });

    // top of screen alert
    qs('#alert').addEventListener('click', async event => {
      createRipple(event);
      await sleep(20);
      await animateElement(event.target, 'translateY(-120%)', 800, 0);
    });

    // when a switch is changed update config & UI
    qsa('audiosync-switch').forEach(sw => {
      sw.addEventListener('statechange', async  ev => {
        const changes = {}
        if (ev.detail.id === 'cues') {
          changes['import_cues'] = ev.detail.state;
        } else if (ev.detail.id === 'lyrics') {
          changes['import_lyrics'] = ev.detail.state;
        } else if (ev.detail.id === 'remove-lrc') {
          changes['remove_lrc_wd'] = ev.detail.state;
        } else if (ev.detail.id === 'podcast') {
          changes['podcast'] = ev.detail.state;
        }
        const states = await pywebview.api.update_config(changes);
  
        // podcasts transfer bar
        if (!states.podcast) {
          qs('sync-ui').hideBar('#podcasts-bar');
        } else {
          qs('sync-ui').showBar('#podcasts-bar');
        }
        
        //  playlist transfer bar
        if (!states.import_cues) {
          qs('sync-ui').hideBar('#playlists-bar');
        } else {
          qs('sync-ui').showBar('#playlists-bar');
        }
  
        // reset lyric files switch
        const el = qs('#remove-lrc');
        if (!states.import_lyrics) {
          await fadeOut(el);
          el.style.display = 'none';
        } else {
          el.style.removeProperty('display');
          fadeIn(el);
        }
      });
    });

    /**
     * load data
     */

    // get settings from config.json
    const conf = await pywebview.api.get_config();

    // playlist import ui
    qs('#cues').setState(conf.import_cues);
    if (!conf.import_cues) {
      qs('sync-ui').hideBar('#playlists-bar');
    }

    // lyrics import
    qs('#lyrics').setState(conf.import_lyrics);
    qs('#remove-lrc').setState(conf.remove_lrc_wd);

    // podcast import ui
    qs('#podcast').setState(conf.podcast);
    if (!conf.podcast) {
      qs('sync-ui').hideBar('#podcasts-bar');
    }

    // reset .lrc UI
    const rm_lrc_el = qs('#remove-lrc');
    if (!conf.import_lyrics) {
      rm_lrc_el.style.opacity = 0;
      rm_lrc_el.style.display = 'none';
    } else {
      rm_lrc_el.style.opacity = 1;
      rm_lrc_el.style.removeProperty('display');
    }

    // load media library
    musicLib.addEventListener('lib_size_updated', e => qs('audiosync-menu').footElement(e.detail.lib_size));
    await musicLib.go();

    // load podcasts from config and generate UI
    await qs('audiosync-podcasts').listPodcasts();

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

})()