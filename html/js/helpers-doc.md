## Functions

<dl>
<dt><a href="#sleep">sleep(milliseconds)</a> ⇒ <code>Promise.&lt;Void&gt;</code></dt>
<dd><p>wait an ammout of time</p>
</dd>
<dt><a href="#getCSSVariableValue">getCSSVariableValue(variableName)</a> ⇒ <code>String</code></dt>
<dd><p>returns value of a css variable</p>
</dd>
<dt><a href="#parseKeyframes">parseKeyframes(keyframesString)</a> ⇒ <code>Object</code></dt>
<dd><p>parse keyframe string into an object</p>
</dd>
<dt><a href="#parseCSS">parseCSS(cssString)</a> ⇒ <code>Object</code></dt>
<dd><p>parse css into an object</p>
</dd>
<dt><a href="#parseProperties">parseProperties(propertiesString)</a> ⇒ <code>Object</code></dt>
<dd><p>parse string of css properties into an Object</p>
</dd>
<dt><a href="#objectToCSS">objectToCSS(cssObject)</a> ⇒ <code>String</code></dt>
<dd><p>smash an object into a string of css</p>
</dd>
<dt><a href="#convertToHex">convertToHex(color)</a> ⇒ <code>String</code></dt>
<dd><p>convers text color ot RGB color to hex</p>
</dd>
<dt><a href="#getContrastColor">getContrastColor(hexColor)</a> ⇒ <code>String</code></dt>
<dd><p>returns contrasting color to input hex code</p>
</dd>
<dt><a href="#hexToRgba">hexToRgba(hex)</a> ⇒ <code>String</code></dt>
<dd><p>convers hex to rgba</p>
</dd>
<dt><a href="#getColorAtPoint">getColorAtPoint(canvas, x, y, radius)</a> ⇒ <code>String</code></dt>
<dd><p>returs average color around a point of a canvas element</p>
</dd>
<dt><a href="#generateRandomString">generateRandomString(length)</a> ⇒ <code>String</code></dt>
<dd><p>random string generator</p>
</dd>
<dt><a href="#isValidURL">isValidURL(url)</a> ⇒ <code>Boolean</code></dt>
<dd><p>validate Podcast rss URL 
Called by {audiosync-podcast}</p>
</dd>
<dt><a href="#rgbToHex">rgbToHex(r, g, b)</a> ⇒ <code>String</code></dt>
<dd><p>retrns a hx value from r,g,b value given</p>
</dd>
<dt><a href="#componentToHex">componentToHex(c)</a> ⇒ <code>String</code></dt>
<dd><p>convers number to hex value</p>
</dd>
<dt><a href="#areElementsPresent">areElementsPresent(arr1, arr2)</a> ⇒ <code>Boolean</code></dt>
<dd><p>is array1 present in array2?</p>
</dd>
<dt><a href="#indexOfElement">indexOfElement(arr, element)</a> ⇒ <code>Boolean</code></dt>
<dd><p>test if element is in an array</p>
</dd>
<dt><a href="#containsNumber">containsNumber(array)</a> ⇒ <code>Boolean</code></dt>
<dd><p>check if any number is in a given array</p>
</dd>
<dt><a href="#getFilenameWithoutExtension">getFilenameWithoutExtension(filePath)</a> ⇒ <code>Number</code></dt>
<dd><p>return the filename without path and extension</p>
</dd>
<dt><a href="#calcPercentage">calcPercentage(small, big)</a> ⇒ <code>Number</code></dt>
<dd><p>calculates percentage value</p>
</dd>
<dt><a href="#formatDownloadSpeed">formatDownloadSpeed(bps)</a> ⇒ <code>String</code></dt>
<dd><p>Convert bytes per second (bps) to a human-readable format</p>
</dd>
<dt><a href="#qs">qs(selector, scope)</a> ⇒ <code>HTMLElement</code></dt>
<dd><p>Query Selector</p>
</dd>
<dt><a href="#qsa">qsa(selector, scope)</a> ⇒ <code>Array</code></dt>
<dd><p>Query Selector All</p>
</dd>
<dt><a href="#ce">ce()</a> ⇒ <code>HTMLElement</code></dt>
<dd><p>createElement shorthand</p>
</dd>
<dt><a href="#elementHeight">elementHeight(el)</a> ⇒ <code>Number</code></dt>
<dd><p>returns the height of the html element</p>
</dd>
<dt><a href="#elementWidth">elementWidth(el)</a> ⇒ <code>Number</code></dt>
<dd><p>returns the width of the html element</p>
</dd>
<dt><a href="#appendElements">appendElements(parent, elements)</a> ⇒ <code>void</code></dt>
<dd><p>append elements to a parent element
Called by audiosync-podcasts [connectedCallback, _fetchAndParseXML, ._createEpisodeElement, _createUnsubDialog, _addPodcastUI]</p>
</dd>
<dt><a href="#toggleAttribute">toggleAttribute(element, attribute)</a></dt>
<dd><p>sets an attribute true
Called by {audiosync-podcast}</p>
</dd>
<dt><a href="#createButtonWithIcon">createButtonWithIcon(buttonType, iconType, classes)</a> ⇒ <code>HTMLElement</code></dt>
<dd><p>creates a button element with an svg icon</p>
</dd>
<dt><a href="#svgIcon">svgIcon(name, color)</a> ⇒ <code>HTMLElement</code></dt>
<dd><p>creates an SVG icon</p>
</dd>
<dt><a href="#fillButton">fillButton(name, txt)</a> ⇒ <code>HTMLElement</code></dt>
<dd><p>creates elemets to text spacing in the button</p>
</dd>
<dt><a href="#whichTransitionEvent">whichTransitionEvent()</a> ⇒ <code>String</code></dt>
<dd><p>determine what transition event to listen for</p>
</dd>
<dt><a href="#animateElement">animateElement(el, transform, time, opacity, delay)</a> ⇒ <code>Promise.&lt;Void&gt;</code></dt>
<dd><p>animate transform of transform and opacity on a HTML element</p>
</dd>
<dt><a href="#animateHeight">animateHeight(el, height, time)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>animate transform / opacity on a give element</p>
</dd>
<dt><a href="#fadeOut">fadeOut(el, time)</a> ⇒ <code>Promise.&lt;Void&gt;</code></dt>
<dd><p>fade out opacity of a given element</p>
</dd>
<dt><a href="#fadeIn">fadeIn(el, time)</a> ⇒ <code>Promise.&lt;Void&gt;</code></dt>
<dd><p>fade in opacity of a given element</p>
</dd>
<dt><a href="#createRipple">createRipple((Event))</a> ⇒ <code>nothing</code></dt>
<dd><p>triggers a ripple effect in a clicked element</p>
</dd>
</dl>

<a name="sleep"></a>

## sleep(milliseconds) ⇒ <code>Promise.&lt;Void&gt;</code>
wait an ammout of time

**Kind**: global function  
**Returns**: <code>Promise.&lt;Void&gt;</code> - Nothing  

| Param | Type |
| --- | --- |
| milliseconds | <code>ms</code> | 

<a name="getCSSVariableValue"></a>

## getCSSVariableValue(variableName) ⇒ <code>String</code>
returns value of a css variable

**Kind**: global function  

| Param | Type |
| --- | --- |
| variableName | <code>String</code> | 

<a name="parseKeyframes"></a>

## parseKeyframes(keyframesString) ⇒ <code>Object</code>
parse keyframe string into an object

**Kind**: global function  

| Param | Type |
| --- | --- |
| keyframesString | <code>String</code> | 

<a name="parseCSS"></a>

## parseCSS(cssString) ⇒ <code>Object</code>
parse css into an object

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cssString | <code>String</code> | css string to be parsed |

<a name="parseProperties"></a>

## parseProperties(propertiesString) ⇒ <code>Object</code>
parse string of css properties into an Object

**Kind**: global function  

| Param | Type |
| --- | --- |
| propertiesString | <code>String</code> | 

<a name="objectToCSS"></a>

## objectToCSS(cssObject) ⇒ <code>String</code>
smash an object into a string of css

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| cssObject | <code>Object</code> | object to be stringified |

<a name="convertToHex"></a>

## convertToHex(color) ⇒ <code>String</code>
convers text color ot RGB color to hex

**Kind**: global function  
**Returns**: <code>String</code> - HEX color code  

| Param | Type |
| --- | --- |
| color | <code>String</code> | 

<a name="getContrastColor"></a>

## getContrastColor(hexColor) ⇒ <code>String</code>
returns contrasting color to input hex code

**Kind**: global function  
**Returns**: <code>String</code> - hex color code  

| Param | Type | Description |
| --- | --- | --- |
| hexColor | <code>String</code> | hex color code |

<a name="hexToRgba"></a>

## hexToRgba(hex) ⇒ <code>String</code>
convers hex to rgba

**Kind**: global function  
**Returns**: <code>String</code> - rgba color  

| Param | Type |
| --- | --- |
| hex | <code>String</code> | 

<a name="getColorAtPoint"></a>

## getColorAtPoint(canvas, x, y, radius) ⇒ <code>String</code>
returs average color around a point of a canvas element

**Kind**: global function  

| Param | Type |
| --- | --- |
| canvas | <code>HTMLElement</code> | 
| x | <code>Number</code> | 
| y | <code>Number</code> | 
| radius | <code>Number</code> | 

<a name="generateRandomString"></a>

## generateRandomString(length) ⇒ <code>String</code>
random string generator

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| length | <code>Number</code> | <code>8</code> | length of the returned string |

<a name="isValidURL"></a>

## isValidURL(url) ⇒ <code>Boolean</code>
validate Podcast rss URL Called by {audiosync-podcast}

**Kind**: global function  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 

<a name="rgbToHex"></a>

## rgbToHex(r, g, b) ⇒ <code>String</code>
retrns a hx value from r,g,b value given

**Kind**: global function  

| Param | Type |
| --- | --- |
| r | <code>Number</code> | 
| g | <code>Number</code> | 
| b | <code>Number</code> | 

<a name="componentToHex"></a>

## componentToHex(c) ⇒ <code>String</code>
convers number to hex value

**Kind**: global function  

| Param | Type |
| --- | --- |
| c | <code>Number</code> | 

<a name="areElementsPresent"></a>

## areElementsPresent(arr1, arr2) ⇒ <code>Boolean</code>
is array1 present in array2?

**Kind**: global function  

| Param | Type |
| --- | --- |
| arr1 | <code>Array</code> | 
| arr2 | <code>Array</code> | 

<a name="indexOfElement"></a>

## indexOfElement(arr, element) ⇒ <code>Boolean</code>
test if element is in an array

**Kind**: global function  

| Param | Type |
| --- | --- |
| arr | <code>Array</code> | 
| element | <code>Object</code> | 

<a name="containsNumber"></a>

## containsNumber(array) ⇒ <code>Boolean</code>
check if any number is in a given array

**Kind**: global function  

| Param | Type |
| --- | --- |
| array | <code>Array</code> | 

<a name="getFilenameWithoutExtension"></a>

## getFilenameWithoutExtension(filePath) ⇒ <code>Number</code>
return the filename without path and extension

**Kind**: global function  

| Param | Type |
| --- | --- |
| filePath | <code>String</code> | 

<a name="calcPercentage"></a>

## calcPercentage(small, big) ⇒ <code>Number</code>
calculates percentage value

**Kind**: global function  

| Param | Type |
| --- | --- |
| small | <code>Number</code> | 
| big | <code>Number</code> | 

**Example**  
```js
const bytes = 100;const totalBytes = 1000;const percent = calcPercentage(bytes, totalBytes);console.log(percent);//logs: 10
```
<a name="formatDownloadSpeed"></a>

## formatDownloadSpeed(bps) ⇒ <code>String</code>
Convert bytes per second (bps) to a human-readable format

**Kind**: global function  
**Returns**: <code>String</code> - - Download speed in a human-readable format  

| Param | Type | Description |
| --- | --- | --- |
| bps | <code>Number</code> | Download speed in bytes per second |

<a name="qs"></a>

## qs(selector, scope) ⇒ <code>HTMLElement</code>
Query Selector

**Kind**: global function  

| Param | Type |
| --- | --- |
| selector | <code>String</code> | 
| scope | <code>Scope</code> | 

<a name="qsa"></a>

## qsa(selector, scope) ⇒ <code>Array</code>
Query Selector All

**Kind**: global function  

| Param | Type |
| --- | --- |
| selector | <code>String</code> | 
| scope | <code>Scope</code> | 

<a name="ce"></a>

## ce() ⇒ <code>HTMLElement</code>
createElement shorthand

**Kind**: global function  
<a name="elementHeight"></a>

## elementHeight(el) ⇒ <code>Number</code>
returns the height of the html element

**Kind**: global function  
**Returns**: <code>Number</code> - height of the given element  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | html |

<a name="elementWidth"></a>

## elementWidth(el) ⇒ <code>Number</code>
returns the width of the html element

**Kind**: global function  
**Returns**: <code>Number</code> - width of the given element  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | html |

<a name="appendElements"></a>

## appendElements(parent, elements) ⇒ <code>void</code>
append elements to a parent elementCalled by audiosync-podcasts [connectedCallback, _fetchAndParseXML, ._createEpisodeElement, _createUnsubDialog, _addPodcastUI]

**Kind**: global function  

| Param | Type |
| --- | --- |
| parent | <code>HTMLElement</code> | 
| elements | <code>Array.&lt;HTMLElement&gt;</code> | 

<a name="toggleAttribute"></a>

## toggleAttribute(element, attribute)
sets an attribute trueCalled by {audiosync-podcast}

**Kind**: global function  

| Param | Type |
| --- | --- |
| element | <code>HTMLElement</code> | 
| attribute | <code>String</code> | 

<a name="createButtonWithIcon"></a>

## createButtonWithIcon(buttonType, iconType, classes) ⇒ <code>HTMLElement</code>
creates a button element with an svg icon

**Kind**: global function  

| Param | Type |
| --- | --- |
| buttonType | <code>String</code> | 
| iconType | <code>String</code> | 
| classes | <code>String</code> | 

<a name="svgIcon"></a>

## svgIcon(name, color) ⇒ <code>HTMLElement</code>
creates an SVG icon

**Kind**: global function  
**Returns**: <code>HTMLElement</code> - SVG element with nested path  

| Param | Type |
| --- | --- |
| name | <code>String</code> | 
| color | <code>String</code> | 

<a name="fillButton"></a>

## fillButton(name, txt) ⇒ <code>HTMLElement</code>
creates elemets to text spacing in the button

**Kind**: global function  

| Param | Type |
| --- | --- |
| name | <code>String</code> | 
| txt | <code>String</code> | 

<a name="whichTransitionEvent"></a>

## whichTransitionEvent() ⇒ <code>String</code>
determine what transition event to listen for

**Kind**: global function  
**Returns**: <code>String</code> - transition event name  
<a name="animateElement"></a>

## animateElement(el, transform, time, opacity, delay) ⇒ <code>Promise.&lt;Void&gt;</code>
animate transform of transform and opacity on a HTML element

**Kind**: global function  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> | the HTML element to be animated *required* |
| transform | <code>String</code> | transform value *required* |
| time | <code>Number</code> | duration the animation will take to play through *optional* |
| opacity | <code>Number</code> | opacity value *optional* |
| delay | <code>Number</code> | time to wait before animating *optional* |

**Example** *(Example usage of animateElement() function.)*  
```js
animateElement(card, 'translateX(0)', 200, 1).then(_ => {
// animation complete
});
```
<a name="animateHeight"></a>

## animateHeight(el, height, time) ⇒ <code>Promise.&lt;void&gt;</code>
animate transform / opacity on a give element

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> | HTML element *required* |
| height | <code>String</code> | height value *required* |
| time | <code>Number</code> | duration for the animation to complete |

<a name="fadeOut"></a>

## fadeOut(el, time) ⇒ <code>Promise.&lt;Void&gt;</code>
fade out opacity of a given element

**Kind**: global function  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> | HTML element to fade |
| time | <code>Number</code> | duration of the fade animation |

**Example** *(Example usage of fadeOut() function.)*  
```js
fadeOut(card, 200).then(_ => {
// animation complete
});
```
<a name="fadeIn"></a>

## fadeIn(el, time) ⇒ <code>Promise.&lt;Void&gt;</code>
fade in opacity of a given element

**Kind**: global function  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>HTMLElement</code> | HTML element to fade |
| time | <code>Number</code> | duration of the fade animation |

**Example** *(Example usage of fadeIn() function.)*  
```js
fadeIn(card, 200).then(_ => {
// animation complete
});
```
<a name="createRipple"></a>

## createRipple((Event)) ⇒ <code>nothing</code>
triggers a ripple effect in a clicked element

**Kind**: global function  

| Param | Description |
| --- | --- |
| (Event) | event - click event |

