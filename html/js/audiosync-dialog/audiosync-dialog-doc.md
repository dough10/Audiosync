<a name="AudioSyncDialog"></a>

## AudioSyncDialog ⇐ <code>HTMLElement</code>
UI dialog box w/ backdrop

**Kind**: global class  
**Extends**: <code>HTMLElement</code>  
**Attribute**: <code>String</code> nopad  

* [AudioSyncDialog](#AudioSyncDialog) ⇐ <code>HTMLElement</code>
    * [new AudioSyncDialog()](#new_AudioSyncDialog_new)
    * [.connectedCallback()](#AudioSyncDialog+connectedCallback) ⇒ <code>Void</code>
    * [.open()](#AudioSyncDialog+open) ⇒ <code>Void</code>
    * [.close()](#AudioSyncDialog+close) ⇒ <code>Void</code>
    * [.attributeChangedCallback()](#AudioSyncDialog+attributeChangedCallback) ⇒ <code>Void</code>

<a name="new_AudioSyncDialog_new"></a>

### new AudioSyncDialog()
creates the dialog and backdrop elements

**Example**  
```js
const dialog = document.createElement('audiosync-dialog');
```
<a name="AudioSyncDialog+connectedCallback"></a>

### audioSyncDialog.connectedCallback() ⇒ <code>Void</code>
element connected to DOM. defaults --animation-time to 0ms to prevent flash of content

**Kind**: instance method of [<code>AudioSyncDialog</code>](#AudioSyncDialog)  
**Example**  
```js
const dialog = document.createElement('audiosync-dialog');document.querySelector('body').appendChild(dialog);
```
<a name="AudioSyncDialog+open"></a>

### audioSyncDialog.open() ⇒ <code>Void</code>
open the dialog element

**Kind**: instance method of [<code>AudioSyncDialog</code>](#AudioSyncDialog)  
**Example**  
```js
const dialog = document.createElement('audiosync-dialog');document.querySelector('body').appendChild(dialog);dialog.open();
```
<a name="AudioSyncDialog+close"></a>

### audioSyncDialog.close() ⇒ <code>Void</code>
close the dialog

**Kind**: instance method of [<code>AudioSyncDialog</code>](#AudioSyncDialog)  
**Example**  
```js
const dialog = document.querySelector('audiosync-dialog');dialog.close();
```
<a name="AudioSyncDialog+attributeChangedCallback"></a>

### audioSyncDialog.attributeChangedCallback() ⇒ <code>Void</code>
attribute has changed

**Kind**: instance method of [<code>AudioSyncDialog</code>](#AudioSyncDialog)  
**Example**  
```js
const dialog = document.querySelector('audiosync-dialog');dialog.toggleAttribue('nopad')
```
