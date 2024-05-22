import {
  Toast,
  animateElement,
  qs,
  qsa,
  sleep,
  createRipple,
  alertUser,
  fadeIn,
  fadeOut
} from './helpers.js';

(_ => {

  /**
   * setup listeners and fetch data
   */
  async function load_app() {

    // header hamburger icon
    qs('#menu-button').onClick(_ => {
      qs('audiosync-menu').open();
    });

    // header gear icon
    qs('#settings').onClick(_ => {
      qs('audiosync-settings').open()
    });

    // menu drawer save / file icon
    qs('#save').onClick(async _ => {
      await sleep(200);
      qs('audiosync-menu').close();
      const dataObj = qs('music-library').buildObject();
      if (Object.keys(dataObj).length === 0) {
        new Toast('No albums selected');
        return
      }
      pywebview.api.save(JSON.stringify(dataObj, null, 2));
      new Toast('JSON saved');
    });

    // menu drawer refresh / update icon
    qs('#update').onClick(async _ => {
      await sleep(200);
      qs('audiosync-menu').close();
      await qs('sync-ui').open();
      await pywebview.api.run_sync();
    });

    // top of screen alert
    qs('#alert').addEventListener('click', async event => {
      createRipple(event);
      await sleep(200);
      await animateElement(event.target, 'translateY(-120%)', 800, 0);
    });

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

    // load media library
    const ml = qs('music-library');
    await ml.go();
    qs('audiosync-menu').footElement(ml.libSize);

    // load podcasts from config and generate UI
    await qs('audiosync-podcasts').listPodcasts();

    // load screen animation
    await sleep(500);
    qs('audiosync-loader').reveal();
  }

  /**
   * application loaded begin startup
   */
  window.addEventListener('pywebviewready', load_app);

  window.onerror = async function(message, source, lineno, colno, error) {
    console.error('Error:', message, 'at', source, 'line:', lineno, 'column:', colno);
    alertUser(`Error: ${message} at ${source} line:${lineno} column:${colno}`);
    return true;
  };

})()