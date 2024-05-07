import {
  Toast,
  animateElement,
  qs,
  sleep,
  createRipple,
  alertUser
} from './helpers.js';

(_ => {

  /**
   * setup listeners and fetch data
   */
  async function load_app() {

    // header hamburger icon
    qs('#menu-button').onClick(event => {
      qs('audiosync-menu').open();
    });

    // header gear icon
    qs('#settings').onClick(event => {
      qs('audiosync-settings').open()
    });

    // menu drawer save / file icon
    qs('#save').addEventListener('click', async event => {
      createRipple(event);
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
    qs('#update').addEventListener('click', async event => {
      createRipple(event);
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

    // load media library
    const ml = qs('music-library');
    await ml.go();
    qs('audiosync-menu').footElement(ml.libSize);

    // load podcasts from config and generate UI
    await qs('audiosync-podcasts').listPodcasts();

    // load screen animation
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