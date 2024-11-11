<a name="AudioSyncDialog"></a>

## AudioSyncDialog ⇐ <code>HTMLElement</code>
UI dialog box w/ backdrop

**Kind**: global class  
**Extends**: <code>HTMLElement</code>  
**this**: [<code>AudioSyncDialog</code>](#AudioSyncDialog)  

* [AudioSyncDialog](#AudioSyncDialog) ⇐ <code>HTMLElement</code>
    * [new AudioSyncDialog()](#new_AudioSyncDialog_new)
    * [.open()](#AudioSyncDialog+open) ⇒ <code>Void</code>
    * [.close()](#AudioSyncDialog+close) ⇒ <code>Void</code>

<a name="new_AudioSyncDialog_new"></a>

### new AudioSyncDialog()
creates the dialog and backdrop elements

**Example**  
```js
const dialog = document.createElement('audiosync-dialog');
```
<a name="AudioSyncDialog+open"></a>

### audioSyncDialog.open() ⇒ <code>Void</code>
open the dialog element also displaying backdrop

**Kind**: instance method of [<code>AudioSyncDialog</code>](#AudioSyncDialog)  
**Access**: public  
**Example**  
```js
const dialog = document.createElement('audiosync-dialog');document.querySelector('body').appendChild(dialog);dialog.open();
```
<a name="AudioSyncDialog+close"></a>

### audioSyncDialog.close() ⇒ <code>Void</code>
close the dialog and hide backdrop

**Kind**: instance method of [<code>AudioSyncDialog</code>](#AudioSyncDialog)  
**Access**: public  
**Example**  
```js
const dialog = document.querySelector('audiosync-dialog');dialog.close();
```
