
/**
 * A class for timing duration of things
 */
class Timer {
  constructor(label) {
    if (label) this.label = label;
    this.startTime = new Date().getTime();
  }
  end() {
    var ms = new Date().getTime() - this.startTime;
    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    return [
      hours,
      minutes,
      Number(seconds.toFixed(2)),
    ];
  }
  endString() {
    var endTime = this.end();
    let str = '';
    if (this.label) str += `${this.label}: `;
    if (endTime[0]) {
      str += `${endTime[0]} hours `;
    }
    if (endTime[1]) {
      str += `${endTime[1]} minutes `;
    }
    str += `${endTime[2]} seconds`;
    return str;
  }
}

/**
 * Query Selector
 * 
 * @param {String} selector
 * @param {Scope} scope
 * 
 * @returns {HTMLElement} 
 */
function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

/**
 * Query Selector All
 * 
 * @param {String} selector
 * @param {Scope} scope
 * 
 * @returns {HTMLElement} 
 */
function qsa(selector, scope) {
  return (scope || document).querySelectorAll(selector);
}

/**
 * createElement shorthand
 * 
 * @returns {HTMLElement}
 */
function ce(el) {
  return document.createElement(el);
}

/**
 * wait an ammout of time
 * 
 * @param {ms} milliseconds
 * 
 * @returns {Promise<Void>} Nothing 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Overflow Toasts.
 * when more then one toast happens in a short period of time overflow will be pushed here
 */
const _toastCache = [];

/**
 * display a toast message
 *
 * @param {String} message - text to be displayed in the toast
 * @param {Number} _timeout - in seconds  || defualt 3.5 seconds  ** optional
 * @param {String} link - url to go to when toast is clicked
 * @param {String} linkText - yellow text
 */
class Toast {
  constructor(message, _timeout, link, linkText) {
    // push toast to cache if currently displaying a toast
    if (qs('#toast')) {
      _toastCache.push([
        message,
        _timeout,
        link,
        linkText
      ]);
      return;
    }
    // bind this to internal functions
    this._transitionEnd = this._transitionEnd.bind(this);
    this._cleanUp = this._cleanUp.bind(this);
    this._clicked = this._clicked.bind(this);

    // log to console
    console.log(message);

    // create the toast
    this._timer = false;
    this._timeout = _timeout * 1000 || 3500;
    this.toast = this._createToast();
    if (link && linkText) {
      this.link = link;
      this.toast.appendChild(this._withLink(message, link, linkText));
    } else {
      this.toast.textContent = message;
    }
    qs('body').appendChild(this.toast);
    sleep(25).then(_ => requestAnimationFrame(_ => {
      this.toast.style.opacity = 1;
      this.toast.style.transform = 'translateY(0px)';
    }));
  }

  /**
   * returns a new toast html element
   * 
   * @returns {HTMLElement} hot toast
   */
  _createToast() {
    const toast = document.createElement('div');
    toast.id ='toast';
    toast.classList.add('toast');
    toast.style.opacity = 0;
    toast.style.transform = 'translateY(80px)';
    toast.style.willChange = 'auto';
    toast.style.transition = 'all 300ms cubic-bezier(.33,.17,.85,1.1) 0ms';
    toast.addEventListener(transitionEvent, this._transitionEnd, true);
    toast.addEventListener('click', this._clicked, true)
    return toast;
  }

  /**
   * butter in the toast with some link info
   * @param {String} message - text string
   * @param {String} link - URL
   * @param {String} linkText - text string
   * 
   * @returns {HTMLElement} link wrapper
   */
  _withLink(message, link, linkText) {
    
    var mText = document.createElement('div');
    mText.textContent = message;
    
    var lText = document.createElement('div');
    lText.textContent = linkText;
    lText.classList.add('yellow-text');
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'space-between';
    wrapper.style.alignItems = 'center';
    wrapper.style.overflow = 'none';
    [mText, lText].forEach(el => wrapper.appendChild(el));
    return wrapper;
  }

  /**
   * event handler for toast click
   */
  _clicked(e) {
    if (this.link) {
      window.open(this.link, "_blank");
    }
    createRipple(e);
    this._cleanUp();
  }

  /**
   * play closing animation and remove element from document
   */
  _cleanUp() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = false;
    }
    this.toast.addEventListener(transitionEvent, _ => {
      if (this.toast) {
        this.toast.remove();
      }
    });
    requestAnimationFrame(_ => {
      this.toast.style.opacity = 0;
      this.toast.style.transform = 'translateY(80px)';
    });
  }

  /**
   * called after opening animation
   * sets up closing animation
   */
  _transitionEnd() {
    this._timer = setTimeout(this._cleanUp, this._timeout);
    this.toast.removeEventListener(transitionEvent, this._transitionEnd);
  }
}

// checks overflow for messages and displays them after the last toast has expired
setInterval(_ => {
  if (!_toastCache.length) {
    return;
  }
  if (qs('#toast')) {
    return;
  }
  new Toast(
    _toastCache[0][0],
    _toastCache[0][1],
    _toastCache[0][2],
    _toastCache[0][3]
  );
  _toastCache.splice(0,1);
}, 500);

/**
 * determine what transition event to listen for
 * 
 * @returns {String} transition event name
 */
function whichTransitionEvent() {
  let t;
  const el = document.createElement('fakeelement');
  const transitions = {
    'MozTransition':'transitionend',
    'WebkitTransition':'webkitTransitionEnd',
    'MSTransition':'msTransitionEnd',
    'OTransition':'oTransitionEnd',
    'transition':'transitionEnd'
  };
  for (let ev in transitions) {
    if (el.style[ev] !== undefined ) {
      return transitions[ev];
    }
  }
}

// the browser transition event name
const transitionEvent = whichTransitionEvent();

/**
 * animate transform of transform and opacity on a HTML element
 *
 * @param {HTMLElement} el the HTML element to be animated *required*
 * @param {String} transform transform value *required*
 * @param {Number} time duration the animation will take to play through *optional*
 * @param {Number} opacity opacity value *optional*
 * @param {Number} delay time to wait before animating *optional*
 * 
 * @returns {Promise<Void>} nothing
 * 
 * @example <caption>Example usage of animateElement() function.</caption>
 * animateElement(card, 'translateX(0)', 200, 1).then(_ => {
 * // animation complete
 * });
 */
function animateElement(el, transform, time, opacity, delay) {
  return new Promise(resolve => {
    if (!el) {
      console.error(`${el} does not exist`);
      resolve();
      return; 
    }
    if (el.style.transform === transform) {
      resolve();
      return;
    }
    const animationEnd = _ => {
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.removeProperty('will-change');
      el.style.removeProperty('transition');
      resolve();
    };
    if (!time) {
      time = 300;
    }
    if (!delay) {
      delay = 0;
    }
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'auto';
    el.style.transition = `all ${time}ms cubic-bezier(.33,.17,.85,1.1) ${delay}ms`;
    requestAnimationFrame(_ => {
      el.style.transform = transform;
      if (opacity !== undefined) {
        el.style.opacity = opacity;
      }
    });
  });
}

/**
 * fade in opacity of a given element
 *
 * @param {HTMLElement} el HTML element to fade
 * @param {Number} time duration of the fade animation
 * 
 * @returns {Promise<Void>} nothing
 * 
 * @example <caption>Example usage of fadeIn() function.</caption>
 * fadeIn(card, 200).then(_ => {
 * // animation complete
 * });
 */
function fadeIn(el, time) {
  return new Promise(resolve => {
    if (!el) {
      return resolve();
    }
    if (el.style.opacity === 1) {
      return resolve();
    }
    if (!time) {
      time = 200;
    }
    var t = 0;
    const animationEnd = _ => {
      if (t) {
        clearTimeout(t);
        t = 0;
      }
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.removeProperty('will-change');
      el.style.removeProperty('transition');
      resolve();
    };
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'opacity';
    el.style.transition = `opacity ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.opacity = 1;
      t = setTimeout(animationEnd, time + 10);
    });
  });
}

/**
 * fade out opacity of a given element
 *
 * @param {HTMLElement} el HTML element to fade
 * @param {Number} time duration of the fade animation
 * 
 * @returns {Promise<Void>} nothing
 * 
 * @example <caption>Example usage of fadeOut() function.</caption>
 * fadeOut(card, 200).then(_ => {
 * // animation complete
 * });
 */
function fadeOut(el, time) {
  return new Promise(resolve => {
    if (!el) {
      return resolve();
    }
    if (el.style.opacity === 0) {
      return resolve();
    }
    if (!time) {
      time = 200;
    }
    var t = 0;
    var animationEnd = _ => {
      if (t) {
        clearTimeout(t);
        t = 0;
      }          
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.removeProperty('will-change');
      el.style.removeProperty('transition');
      resolve();
    };
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'opacity';
    el.style.transition = `opacity ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.opacity = 0;
      t = setTimeout(animationEnd, time + 10);
    });
  });
}

/**
 * animate transform / opacity on a give element
 *
 * @param {HTMLElement} el HTML element *required*
 * @param {String} height height value *required*
 * @param {Number} time duration for the animation to complete
 * 
 * @returns {Promise<void>}
 */
function animateHeight(el, height, time) {
  return new Promise(resolve => {
    if (!el) {
      return resolve();
    }
    var t = 0;
    const animationEnd = _ => {
      if (t) {
        clearTimeout(t);
        t = 0;
      }
      el.removeEventListener(transitionEvent, animationEnd);
      el.style.removeProperty('will-change');
      el.style.removeProperty('transition');
      resolve();
    };
    if (!time) {
      time = 300;
    }
    el.addEventListener(transitionEvent, animationEnd, true);
    el.style.willChange = 'height';
    el.style.transition = `height ${time}ms cubic-bezier(.33,.17,.85,1.1) 0s`;
    requestAnimationFrame(_ => {
      el.style.height = height;
      t = setTimeout(animationEnd, time + 10);
    });
  });
}

/**
 * returns the height of the heml element
 * 
 * @param {Element} el - html 
 * 
 * @returns {Number} height of the given element
 */
function elementHeight(el) {
  let elHeight = el.offsetHeight;
  elHeight += parseInt(window.getComputedStyle(el).getPropertyValue('margin-top'));
  elHeight += parseInt(window.getComputedStyle(el).getPropertyValue('margin-bottom'));
  return elHeight;
}

/**
 * triggers a ripple effect in a clicked element
 * 
 * @param (Event) event - click event
 * 
 * @returns {nothing}
 */    
async function createRipple(event) {
  const button = event.currentTarget;
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const circle = document.createElement("span");
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple-effect');

  button.appendChild(circle);

  await sleep(600);
  const ripple = qs(".ripple-effect", button);
  if (ripple) {
    ripple.remove();
  }
}

// icon cache
let _cachedIcons = false;

/**
 * return an Object containing svg icon path data
 * 
 * @param {String} name 
 * 
 * @returns {Object} svg data object
 */
async function getIcon(name) {
  if (_cachedIcons) return _cachedIcons.find(icon => icon.name === name);
  const iconData = await fetch('./../../icons.json').then(res => res.json());
  _cachedIcons = iconData.icons;
  return _cachedIcons.find(icon => icon.name === name);
}

/**
 * creates an SVG icon 
 * 
 * @param {String} name
 * @param {String} color
 * 
 * @returns {HTMLElement} SVG element with nested path
 */
async function svgIcon(name, color) {
  const iconData = await getIcon(name);
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute("d", iconData.d);
  if (color) {
    path.setAttribute('fill', color);
  } else {
    path.setAttribute('fill', 'currentColor');
  }
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  svg.appendChild(path);
  svg.setAttribute('viewBox', iconData.viewBox);

  return svg;
}

/**
 * validate URL
 * 
 * @param {String} url
 * 
 * @returns {Boolean}
 */
function isValidURL(url) {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
}

/**
 * convers text color ot RGB color to hex 
 * 
 * @param {String} color
 * 
 * @returns {String} HEX color code 
 */
function convertToHex(color) {
  // If color is already in hex format or not a string, return it as is
  if (typeof color !== 'string' || /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color)) {
    return color;
  }
  
  // Check if color is a named color
  var tempElem = document.createElement('div');
  tempElem.style.color = color;
  document.body.appendChild(tempElem);
  var computedColor = window.getComputedStyle(tempElem).color;
  document.body.removeChild(tempElem);
  if (/^rgb/.test(computedColor)) {
    // Convert RGB to hex
    var rgbArray = computedColor.match(/\d+/g).map(function(num) {
      return parseInt(num, 10);
    });
    return '#' + rgbArray.map(function(num) {
      return ('0' + num.toString(16)).slice(-2);
    }).join('');
  } else {
    // Color is not a named color
    return color;
  }
}

/**
 * convers hex to rgba
 * 
 * @param {String} hex
 * 
 * @returns {String} rgba color
 */
function hexToRgba(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  var bigint = parseInt(hex, 16);

  // Extract RGB components
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  // Return RGB as an object
  return `rgba(${r},${g},${b}, 0.4)`;
}

/**
 * create a rendom color code
 * 
 * @returns {String} hex color code
 */
function generateRandomHexCode() {
  // Generate random integer between 0 and 16777215 (2^24 - 1)
  var randomInt = Math.floor(Math.random() * 16777215);
  
  // Convert integer to hexadecimal string
  var hexCode = randomInt.toString(16);

  // Pad with zeros if necessary to ensure 6 characters
  while (hexCode.length < 6) {
    hexCode = '0' + hexCode;
  }

  // Prepend '#' symbol
  hexCode = '#' + hexCode;

  return hexCode;
}

/**
 * creates elemets to text spacing in the button
 * 
 * @param {String} name
 * @param {String} txt
 * 
 * @returns {HTMLElement}
*/
function fillButton(name, txt) {
  const text = document.createElement('div');
  text.textContent = txt;

  const div = document.createElement('div');
  svgIcon(name).then(icon => [icon ,text].forEach(el => div.appendChild(el)));
  return div;
}

/**
 * user alert at top of screen
 * 
 * @param {String} message
 */
async function alertUser(message) {
  qs('#alert-text').textContent = message;
  await sleep(20);
  await animateElement(qs('#alert'), 'translateY(0%)', 800, 1);
}

/**
 * returns value of a css variable
 * 
 * @param {String} variableName
 * 
 * @return {String}
 */
function getCSSVariableValue(variableName) {
  // Get the computed style of the document root
  var rootStyles = getComputedStyle(document.documentElement);
  // Use getProperty() method to get the value of the variable
  var value = rootStyles.getPropertyValue(variableName);
  return value.trim(); // Trim the value to remove any leading or trailing whitespace
}

/**
 * returns contrasting color to input hex code (thanks ChatGPT) =D
 * 
 * @param {String} hexColor hex color code
 * 
 * @returns {String} hex color code
 */
function getContrastColor(hexColor) {
  // Convert hex color to RGB
  let r = parseInt(hexColor.substr(1, 2), 16);
  let g = parseInt(hexColor.substr(3, 2), 16);
  let b = parseInt(hexColor.substr(5, 2), 16);

  // Calculate the relative luminance
  let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Return contrasting color based on luminance
  return luminance > 0.5 ? "#333333" : "#FFFFFF";
}

// string generated by the generateRandomString() function
const _generatedStrings = new Set();

/**
 * random string generator
 * 
 * @param {Number} length length of the returned string
 * 
 * @returns {String}
 */
function generateRandomString(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let result;
  do {
    result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters[randomIndex];
    }
  } while (_generatedStrings.has(result));

  _generatedStrings.add(result);
  return result;
}

/**
 * parse keyframe string into an object
 * 
 * @param {String} keyframesString 
 * 
 * @returns {Object}
 */
function parseKeyframes(keyframesString) {
  const keyframes = {};
  
  // Remove unnecessary whitespace
  keyframesString = keyframesString.trim();
  
  // Split the string by line breaks
  const lines = keyframesString.split('\n');
  
  // Remove the last line (containing "}")
  lines.pop();
  
  let currentKeyframe = null;
  
  // Iterate over each line
  for (const line of lines) {
      // Check if the line contains a keyframe name
      if (line.includes('{')) {
          // Extract the keyframe name
          const keyframeName = line.trim().replace('{', '').trim();
          // Initialize an object for this keyframe
          keyframes[keyframeName] = {};
          // Set currentKeyframe for the following properties
          currentKeyframe = keyframeName;
      } else if (line.includes('}')) {
          // If line contains '}', reset currentKeyframe to null
          currentKeyframe = null;
      } else {
          // Split the property by ':'
          const [key, value] = line.split(':').map(str => str.trim());
          // Add the property to the appropriate keyframe object
          keyframes[currentKeyframe][key] = value.replace(';','');
      }
  }
  
  return keyframes;
}

/**
 * parse css into an object
 * 
 * @param {String} cssString css string to be parsed
 * 
 * @returns {Object}
 */
function parseCSS(cssString) {
  const cssObject = {};
  let currentSelector = null;
  let braceCount = 0;
  let buffer = '';

  for (let i = 0; i < cssString.length; i++) {
    const char = cssString[i];
    buffer += char;

    if (char === '{') {
      braceCount++;
      if (braceCount === 1) {
        currentSelector = buffer.trim().slice(0, -1).trim(); // Remove the trailing '{'
        buffer = '';
      }
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        if (currentSelector.startsWith('@keyframes')) {
          cssObject[currentSelector] = parseKeyframes(buffer);
        } else {
          cssObject[currentSelector] = parseProperties(buffer);
        }
        currentSelector = null;
        buffer = '';
      }
    }
  }

  return cssObject;
}

/**
 * parse string of css properties into an Object
 * 
 * @param {String} propertiesString 
 * 
 * @returns {Object}
 */
function parseProperties(propertiesString) {
  const propertiesObject = {};
  propertiesString = propertiesString.replace('}','');
  propertiesString
    .split(';')
    .filter(prop => prop.trim())
    .forEach(prop => {
      const [key, value] = prop.split(':').map(str => str.trim());
      propertiesObject[key] = value;
    });

  return propertiesObject;
}

/**
 * smash an object into a string of css
 * 
 * @param {Object} cssObject object to be stringified
 * 
 * @returns {String}
 */
function objectToCSS(cssObject) {
  let cssString = '';

  for (const selector in cssObject) {
    if (cssObject.hasOwnProperty(selector)) {
      if (selector.startsWith('@keyframes')) {
        cssString += `${selector} {\n`;
        const keyframes = cssObject[selector];

        for (const key in keyframes) {
          if (keyframes.hasOwnProperty(key)) {
            cssString += `  ${key} {\n`;
            const properties = keyframes[key];

            for (const property in properties) {
              if (properties.hasOwnProperty(property)) {
                cssString += `    ${property}: ${properties[property]};\n`;
              }
            }

            cssString += `  }\n`;
          }
        }

        cssString += `}\n`;
      } else {
        cssString += `${selector} {\n`;
        const properties = cssObject[selector];

        for (const property in properties) {
          if (properties.hasOwnProperty(property)) {
            cssString += `  ${property}: ${properties[property]};\n`;
          }
        }

        cssString += `}\n`;
      }
    }
  }

  return cssString.trim();
}

export {
  Timer,
  Toast,
  elementHeight,
  animateElement,
  animateHeight,
  fadeIn,
  fadeOut,
  isValidURL,
  ce,
  qs,
  qsa,
  sleep,
  svgIcon,
  createRipple,
  convertToHex,
  hexToRgba,
  generateRandomHexCode,
  fillButton,
  alertUser,
  getCSSVariableValue,
  getContrastColor,
  generateRandomString,
  parseCSS,
  objectToCSS,
  getIcon
}