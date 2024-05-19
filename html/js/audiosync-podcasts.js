import {qs, qsa, svgIcon, sleep, fadeIn, fadeOut, Toast, Timer, isValidURL, fillButton, objectToCSS} from './helpers.js';

/**
 * displays podcast show info
 */
class AudioSyncPodcasts extends HTMLElement {
  constructor() {
    super();

    const cssObj = {
      "svg": {
        "width": "24px",
        "height": "24px"
      },
      ".container": {
        "padding": "8px",
        "display": "flex",
        "flex-direction": "column",
        "jusify-content": "space-between"
      },
      ".wrapper": {
        "display": "flex",
        "flex-direction": "row",
        "justify-content": "space-between",
        "align-items": "center",
        "border-top": "1px solid #3333333d",
        "padding": "8px",
        "font-size": "14px",
        "font-weight": "bold",
        "min-height": "44px"
      },
      ".head": {
        "width": "100%",
        "display": "flex",
        "justify-content": "space-between",
        "align-items": "center",
        "position": "relative"
      },
      "@keyframes spin": {
        "from": {
          "transform": "rotate(0deg)"
        },
        "to": {
          "transform": "rotate(360deg)"
        }
      },
      ".spinning": {
        "animation": "spin 1.5s linear infinite"
      }
    };

    // bind this
    this._resetCheckMarks = this._resetCheckMarks.bind(this);

    const sheet = document.createElement('style');
    sheet.textContent = objectToCSS(cssObj);
        
    // element to append podcasts to
    this.container = document.createElement('div');
    this.container.classList.add('container');

    this.attachShadow({mode: "open"});
    [
      sheet,
      this.container
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * generate head element with close button
   */
  _generateHead() {    
    // wrappper for plus icon
    const addButton = document.createElement('audiosync-small-button');
    svgIcon('add').then(addIcon => addButton.appendChild(addIcon));
    addButton.onClick(_ => this._openAddPodcastDialog());

    // refresh button
    const refresh = document.createElement('audiosync-small-button');
    svgIcon('refresh').then(svg => refresh.appendChild(svg));
    const buttons = [addButton, refresh];
    const menuButtons = [qs('#save'),qs('#update')];
    qsa('.tab').forEach(el => menuButtons.push(el));
    refresh.id ='refresh';
    refresh.onClick(async e => {
      await sleep(100);
      menuButtons.forEach(el => el.toggleAttribute('disabled'));
      buttons.forEach(el => el.toggleAttribute('disabled'));
      qs('#refresh', this.shadowRoot).classList.add('spinning');
      const t = new Timer('Podcasts Update');
      await pywebview.api.get_podcasts();
      new Toast(t.endString());
      this._resetCheckMarks(buttons, menuButtons);
    });

    // podcast tab header 
    const head = document.createElement('div');
    head.classList.add('head');
    buttons.forEach(el => head.appendChild(el));
    return head;
  }

  /**
   * creates and opens the add podcast UI
   */
  async _openAddPodcastDialog() {
    const addUI = await this._addPodcastUI();
    qs('body').appendChild(addUI);
    await sleep(100);
    addUI.open();
  }

  /** 
   * creates the UI for adding podcasts to subscriptions
   */
  async _addPodcastUI() {
    //  loading animation
    const icon = await svgIcon('refresh');
    icon.style.height = '40px';
    icon.style.width = '40px';
    icon.classList.add('spinning');
    
    // container for animated loading Icon
    const loader = document.createElement('div');
    loader.classList.add('loading');
    loader.appendChild(icon);

    // text input label
    const label = document.createElement('label');
    label.classList.add('form__label');
    label.textContent = 'Podcast XML URL';
    label.setAttribute('for', 'url');
    
    // URL input
    const input = document.createElement('input');
    input.setAttribute('placeholder', 'Podcast XML URL');
    input.type = 'url';
    input.id = 'url';
    input.classList.add('form__field');
    
    // input and label wrapper
    const group = document.createElement('div');
    group.classList.add('form__group');
    [
      input,
      label
    ].forEach(el => group.appendChild(el));
    
    // submit / add button
    const buttonContents = fillButton("add", 'add');

    const button = document.createElement('audiosync-button');
    button.appendChild(buttonContents);
    button.toggleAttribute('disabled');
    
    // X icon
    const closeIcon = await svgIcon('close');
    
    // X button
    const closeButton = document.createElement('audiosync-small-button');
    closeButton.color('red');
    closeButton.appendChild(closeIcon);
    
    // dialog header 
    const closeWrapper = document.createElement('div');
    closeWrapper.classList.add('close-wrapper');
    closeWrapper.appendChild(closeButton);
    
    // animated dialog card
    const dialog = document.createElement('audiosync-dialog');
    dialog.setAttribute('small', 1);
    [
      closeWrapper,
      group,
      button,
      loader
    ].forEach(el => dialog.appendChild(el));
    
    // input callback
    input.oninput = e => {
      // enable button for valid url only
      if (isValidURL(input.value)) {
        button.removeAttribute('disabled');
      } else {
        button.setAttribute('disabled', 1);
      }
    };

    // closes the dialog
    closeButton.onClick(async e => {
      await dialog.close();
      await sleep(100);
      dialog.remove();
    });
    
    // add button clicked
    button.onClick(async e => {
      await sleep(200);
      button.toggleAttribute('disabled');
      const loading = qs('.loading');
      loading.style.display = 'flex';
      pywebview.api.subscribe(input.value);
      await fadeIn(loading);
    });
    
    // if clipboard data is a url fill in the input element
    const pasteData = await pywebview.api.get_clipboard();
    if (isValidURL(pasteData)) {
      input.value = pasteData;
      button.removeAttribute('disabled');
    }

    return dialog;
  }

  /**
   * responds to subscription input
   * 
   * @param {String} message
   */
  async subResponse(message) {
    new Toast(message);
    await sleep(3000);

    if (message === "Subscribed!") {
      await this.listPodcasts();
    }

    const dialog = qs('audiosync-dialog');
    if (!dialog) return;
    dialog.close();
    await sleep(100);
    dialog.remove();
  }

  /**
   * list podcasts
   */
  async listPodcasts() {
    const podcasts = await pywebview.api.list_subscriptions();
    this.container.innerHTML = '';
    this.container.appendChild(this._generateHead());
    await podcasts.forEach(url => this._fetchAndParseXML(url));
  }

  /**
   * resets all checkmarks 
   */
  _resetCheckMarks(buttons, menuButtons) {
    qsa('.wrapper', this.shadowRoot).forEach(async el => {
      await sleep(1000);
      await fadeOut(qs('svg', el));
      qs('#refresh', this.shadowRoot).classList.remove('spinning');
      buttons.forEach(el => el.removeAttribute('disabled'));
      menuButtons.forEach(el => el.removeAttribute('disabled'));
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
   * @param {Number} total_bytes
   * @param {Number} start_time
   * @param {String} filname
   */
  async update(name, bytes, total_bytes, start_time, filename) {
    if (filename) {
      const timepast = (new Date().getTime() - start_time) / 1000;
      const speed = this._formatDownloadSpeed(bytes / timepast);
      const bar = this.shadowRoot.getElementById(`${name}-bar`);
      const downloaded = ((bytes / total_bytes) * 100);
      
      bar.style.removeProperty('display');
      fadeIn(bar);
      qs('#title', bar).textContent = filename;
      qs('#percent', bar).textContent = `${downloaded.toFixed(1)}% @ ${speed}`;
      bar.setAttribute('percent', downloaded);
      
      if (downloaded == 100) {
        await fadeOut(bar);
        bar.style.display = 'none';
        new Toast(`${filename} downloaded`);
        qs('#title', bar).textContent = '';
        qs('#percent', bar).textContent = '';
      }
    } else {
      const svg = qs('svg', this.shadowRoot.getElementById(name));
      fadeIn(svg);
    }
  }

  /**
   * alot of code just to get the name of a podcast and put it in a html element
   * 
   * @param {String} url podcast url
   */
  _fetchAndParseXML(url) {
    pywebview.api.xmlProxy(url).then(async xmlString => {

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

      // title of the podcast
      const podcastTitle = document.createElement('div');
      podcastTitle.textContent = xmlString.rss.channel.title;

      const removeIcon = await svgIcon('close');

      const removeButton = document.createElement('audiosync-small-button');
      removeButton.color('red');
      removeButton.appendChild(removeIcon);
      removeButton.style.opacity = 0;
      removeButton.onClick(async ev => {
        //  loading animation
        const icon = await svgIcon('refresh');
        icon.style.height = '40px';
        icon.style.width = '40px';
        icon.classList.add('spinning');
        
        // container for animated loading Icon
        const loader = document.createElement('div');
        loader.classList.add('loading');
        loader.appendChild(icon);

        const text = document.createElement('div');
        text.classList.add('delete-notification-text');
        text.textContent = `Unsubscribe from "${podcastTitle.textContent}"?`;
        
        const dialog = document.createElement('audiosync-dialog');
        dialog.setAttribute('small', 1);

        const yes = document.createElement('audiosync-button');
        const no = document.createElement('audiosync-button');
        const buttons = [yes,no];

        const yesContents = fillButton("check", 'yes');

        yes.appendChild(yesContents);
        yes.setAttribute('color', 'red');
        yes.toggleAttribute('noshadow');
        yes.onClick(async e => {
          await sleep(200);
          buttons.forEach(button => button.setAttribute('disabled', 1));
          loader.style.display = 'flex';
          await fadeIn(loader);
          await pywebview.api.unsubscribe(url);
          new Toast(`${podcastTitle.textContent} unsubscribed`);
          await sleep(200);
          await dialog.close();
          this.listPodcasts();
          dialog.remove();
        });

        const noContents = fillButton('close', 'no');
        
        no.appendChild(noContents);
        no.setAttribute('color', '#ffffff');
        no.toggleAttribute('noshadow');
        no.onClick(async e => {
          await sleep(200);
          buttons.forEach(button => button.setAttribute('disabled', 1));
          await dialog.close();
          dialog.remove();
        });

        [loader,text,yes,no].forEach(el => dialog.appendChild(el));
        qs('body').appendChild(dialog);
        await sleep(20);
        dialog.open();
      });
      
      const svg = await svgIcon("check", 'green');
      svg.style.opacity = 0;

      // wrapper for title and checkmark
      const wrapper = document.createElement('div');
      [
        podcastTitle,
        svg
      ].forEach(el => wrapper.appendChild(el));
      wrapper.classList.add('wrapper');
      wrapper.id = url;

      // show remove button on mouse over
      wrapper.onmouseenter = _ => {
        if (qs('#refresh', this.shadowRoot).classList.contains('spinning')) return;
        wrapper.appendChild(removeButton);
        fadeIn(removeButton);
      };

      // hide remove button when mouse leaves element
      wrapper.onmouseleave = async _ => {
        await fadeOut(removeButton);
        removeButton.remove();
      };

      // will be filled with podcast episode filename
      const title = document.createElement('div');
      title.id = 'title';

      // download percentage
      const percent = document.createElement('div');
      percent.id = 'percent';

      // file download progress (hidden untill download begins)
      const bar = document.createElement('audiosync-progress');
      [
        title,
        percent
      ].forEach(el => bar.appendChild(el));
      bar.id = `${url}-bar`;
      bar.style.opacity = 0;
      bar.style.display = 'none';

      // push content to UI
      [
        wrapper,
        bar
      ].forEach(el => this.container.appendChild(el));
    }).catch(error => console.error('Error fetching XML:', error));
  }
}
customElements.define('audiosync-podcasts', AudioSyncPodcasts);
