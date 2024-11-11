import {getIcon} from '../js/getIcon/getIcon.js';


/**
 * wait an ammout of time
 * 
 * 
 * @param {ms} milliseconds
 * 
 * @returns {Promise<Void>} Nothing 
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


let lastRun = 0;
/**
 * debounce a function preventing it from executing to many times
 * 
 * @param {Function} fn 
 * @param {Number} [time] 
 * 
 * @returns {void}
 */
function debounce(fn, time=1000) {
  const now = new Date().getTime();
  if (now - lastRun < time) return;
  fn();
  lastRun = now;
}

/**
 * clone an object leaving the original unaffected by changes
 * 
 * @param {Object} object 
 * 
 * @returns {Object} cloned object
 */
function cloneObject(object) {
  const str = JSON.stringify(object);
  return JSON.parse(str);
}



/**
 * returns value of a css variable
 * ** depreciating **
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
 * parse keyframe string into an object
 *  ** depreciating **
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
 *  ** depreciating **
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
        if (currentSelector.startsWith('@')) {
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
 *  ** depreciating **
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
 *  ** depreciating **
 * 
 * @param {Object} cssObject object to be stringified
 * 
 * @returns {String}
 */
function objectToCSS(cssObject) {
  let cssString = '';

  for (const selector in cssObject) {
    if (cssObject.hasOwnProperty(selector)) {
      if (selector.startsWith('@')) {
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




/**
 * retrns a hx value from r,g,b value given
 * 
 * 
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b 
 * 
 * @returns {String}
 */
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * convers number to hex value
 * 
 * 
 * @param {Number} c 
 * @returns {String}
 */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

/**
 * convers text color ot RGB color to hex 
 *  
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
 * returns contrasting color to input hex code
 * 
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

/**
 * convers hex to rgba
 * 
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
 * returs average color around a point of a canvas element
 * 
 * 
 * @param {HTMLElement} canvas 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} radius 
 * 
 * @returns {String}
 */
function getColorAtPoint(canvas, x, y, radius) {
  const ctx = canvas.getContext('2d');
  const pixelData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2).data;
  let totalRed = 0, totalGreen = 0, totalBlue = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    totalRed += pixelData[i];
    totalGreen += pixelData[i + 1];
    totalBlue += pixelData[i + 2];
  }

  const numPixels = pixelData.length / 4; // Number of pixels sampled
  const averageRed = Math.round(totalRed / numPixels);
  const averageGreen = Math.round(totalGreen / numPixels);
  const averageBlue = Math.round(totalBlue / numPixels);

  return rgbToHex(averageRed, averageGreen, averageBlue);
}

/**
 * detect if color is grey 
 * 
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b 
 * 
 * @returns {Boolean}
 */
function isGrey(r, g, b) {
  const THRESHOLD = 10;
  return Math.abs(r - g) < THRESHOLD && Math.abs(r - b) < THRESHOLD && Math.abs(g - b) < THRESHOLD;
}

/**
 * brightness value 1 white 0 black
 * 
 * @param {Number} r 
 * @param {Number} g 
 * @param {Number} b
 *  
 * @returns {Number}
 */
function getLuminance(r, g, b, precision = 8) {
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return parseFloat(luminance.toFixed(precision));
}


/**
 * loop through palette of colors to find a color in range 
 * 
 * @param {Object} palette color palette from ColorThief
 * @param {Number} [skipIndex] an index to overlook
 * @param {Number} [bLimit] brightness limit threshold 1
 * @param {Number} [dLimit] darkness limit threshold 0
 * 
 * @returns {Number} color index
 */
function findGoldieLocksColor(palette, skipIndex, bLimit = 0.7, dLimit = 0.3) {
  const skip = skipIndex ?? palette.length;

  for (let i = 0; i < palette.length; i++) {
    if (i === skip) continue;

    const [r, g, b] = palette[i];
    const luminance = getLuminance(r, g, b);

    if (luminance < bLimit && luminance > dLimit && !isGrey(r, g, b)) {
      return i;
    }
  }
  return undefined;
}


/**
 * convert seconds to mm:ss format
 * 
 * @param {Number} time 
 * 
 * @returns {String}
 */
function mmss(time) {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}







/**
 * validate Podcast rss URL 
 * Called by {audiosync-podcast}
 * @function
 * 
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
 * is array1 present in array2?
 * 
 * 
 * @param {Array} arr1 
 * @param {Array} arr2 
 * 
 * @returns {Boolean}
 */
function areElementsPresent(arr1, arr2) {
  // Loop through each element of arr1
  for (let i = 0; i < arr1.length; i++) {
    // If the element is not present in arr2, return false
    if (!arr2.includes(arr1[i])) {
      return false;
    }
  }
  // All elements in arr1 are present in arr2
  return true;
}

/**
 * test if element is in an array
 * 
 * 
 * @param {Array} arr 
 * @param {Object} element 
 * 
 * @returns {Boolean}
 */
function indexOfElement(arr, element) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === element) {
      return i;
    }
  }
  return -1; 
}

/**
 * check if any number is in a given array
 * 
 * 
 * @param {Array} array 
 * 
 * @returns {Boolean}
 */
function containsNumber(array) {
  return array.some(value => Number(value));
}

/**
 * return the filename without path and extension 
 * @function
 * 
 * 
 * @param {String} filePath 
 * 
 * @returns {Number}
 */
function getFilenameWithoutExtension(filePath) {
  const parts = filePath.split('/');
  const filenameWithExtension = parts.pop();
  const lastDotPosition = filenameWithExtension.lastIndexOf('.');
  if (lastDotPosition === -1) {
      return filenameWithExtension;
  }
  return filenameWithExtension.substring(0, lastDotPosition);
}

/**
 * get a paths file extention
 * 
 * @param {String} url 
 * 
 * @returns {String}
 */
function getFileExtension(url) {
  // Get the last part of the URL after the last '/'
  const path = url.split('/').pop();
  
  // Find the last '.' in the filename
  const lastDotIndex = path.lastIndexOf('.');
  
  // Check if there is a '.' in the filename and return the extension
  if (lastDotIndex !== -1) {
    return path.slice(lastDotIndex + 1).toLowerCase();
  } else {
    return ''; // No extension found
  }
}

/**
 * converts a string to an array and drops first folder then returns the array
 * 
 * @param {String} filePath 
 * 
 * @returns {String[]}
 */
function dropFirstFolder(filePath) {
  const parts = filePath.split('/');
  parts.shift();
  return parts;
}

/**
 * calculates percentage value
 * @function
 * 
 * @param {Number} small 
 * @param {Number} big
 * 
 * @returns {Number} 
 * 
 * @example
 * const bytes = 100;
 * const totalBytes = 1000;
 * 
 * const percent = calcPercentage(bytes, totalBytes);
 * console.log(percent);
 * //logs: 10
 */
function calcPercentage(small, big) {
  return (small / big) * 100;
}


/**
 * Convert bytes per second (bps) to a human-readable format
 * @function
 * 
 * 
 * @param {Number} bps - Download speed in bytes per second
 * 
 * @returns {String} - Download speed in a human-readable format
 */
function formatDownloadSpeed(bps) {
  if (bps < 1000) {
    return bps.toFixed(2) + ' bps';
  } else if (bps < 1000000) {
    return (bps / 1000).toFixed(2) + ' kbps';
  } else {
    return (bps / 1000000).toFixed(2) + ' Mbps';
  }
}






/**
 * Query Selector
 * @function 
 * 
 * 
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
 * @function 
 * 
 * 
 * @param {String} selector
 * @param {Scope} scope
 * 
 * @returns {Array} 
 */
function qsa(selector, scope) {
  return (scope || document).querySelectorAll(selector);
}

/**
 * createElement shorthand
 * @function
 * 
 * 
 * @returns {HTMLElement}
 */
function ce(el) {
  return document.createElement(el);
}

/**
 * returns the height of the html element
 * @function 
 * 
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
 * returns the width of the html element
 * @function 
 * 
 * 
 * 
 * @param {Element} el - html 
 * 
 * @returns {Number} width of the given element
 */
function elementWidth(el) {
  let elWidth = el.offsetWidth;
  elWidth += parseInt(window.getComputedStyle(el).getPropertyValue('margin-left'));
  elWidth += parseInt(window.getComputedStyle(el).getPropertyValue('margin-right'));
  return elWidth;
}


/**
 * append elements to a parent element
 * Called by audiosync-podcasts [connectedCallback, _fetchAndParseXML, ._createEpisodeElement, _createUnsubDialog, _addPodcastUI]
 * @function
 * 
 * 
 * @param {HTMLElement} parent 
 * @param {HTMLElement[]} elements 
 * 
 * @returns {void}
 */
function appendElements(parent, elements) {
  elements.forEach(el => parent.appendChild(el));
}

/**
 * sets an attribute true
 * Called by {audiosync-podcast}
 * @function
 * 
 * 
 * @param {HTMLElement}
 * @param {String}
 */
function toggleAttribute(element, attribute) {
  if (!element.hasAttribute(attribute)) {
    element.toggleAttribute(attribute);
  }
}

/**
 * creates a button element with an svg icon 
 * @function 
 * 
 * @param {Object} buttonData
 * @param {String} buttonData.type 
 * @param {String} buttonData.icon
 * @param {String} buttonData.classes 
 * @param {String} buttonData.id
 * @param {Function} buttonData.onClick 
 * 
 * @returns {HTMLElement}
 */
function createButtonWithIcon({type, icon, classes, id, onClick}) {
  const button = ce(type);
  if (id) button.id = id;
  if (onClick) button.onClick(onClick);
  button.appendChild(svgIcon(icon));
  classes.forEach(cssClass => button.classList.add(cssClass));
  return button;
}

/**
 * creates an SVG icon 
 * 
 * 
 * @param {String} name
 * @param {String} color
 * 
 * @returns {HTMLElement} SVG element with nested path
 */
function svgIcon(name, color) {
  const iconData = getIcon(name);
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
 * creates elemets to text spacing in the button
 * @function
 * 
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
  [
    svgIcon(name),
    text
  ].forEach(el => div.appendChild(el));
  return div;
}










/**
 * determine what transition event to listen for
 * @function 
 * 
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
 * @function 
 * 
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
 * animate transform / opacity on a give element
 * @function 
 * 
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
 * fade out opacity of a given element
 * @function 
 * 
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
 * fade in opacity of a given element
 * @function 
 * 
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
 * triggers a ripple effect in a clicked element
 * @function 
 * 
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


export {
  formatDownloadSpeed,
  elementHeight,
  elementWidth,
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
  findGoldieLocksColor,
  isGrey,
  fillButton,
  getCSSVariableValue,
  getLuminance,
  getContrastColor,
  parseCSS,
  objectToCSS,
  getIcon,
  getColorAtPoint,
  areElementsPresent,
  indexOfElement,
  containsNumber,
  getFilenameWithoutExtension,
  rgbToHex,
  calcPercentage,
  appendElements,
  toggleAttribute,
  createButtonWithIcon,
  debounce,
  mmss,
  getFileExtension,
  dropFirstFolder,
  cloneObject,
  transitionEvent
};