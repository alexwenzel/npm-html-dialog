# html dialog

a simple html dialog for any frontend.
based on the [html dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element.

<img alt="img1.png" src="img1.png" width="200"/>
<img alt="img2.png" src="img2.png" width="200"/>
<img alt="img3.png" src="img3.png" width="200"/>

## dialog installation & usage

```html

<script src="dist/html-dialog.min.js"></script>
<script>
    var dialog = HtmlDialog.Dialog({
        title: 'Dialog Title',
        content: 'Dialog Content',
        buttons: [
            {
                text: 'OK',
                onclick: function () {
                    console.log('OK');
                }
            },
            {
                text: 'Cancel',
                onclick: function () {
                    console.log('Cancel');
                }
            }
        ]
    }).create();

    dialog.open();
</script>
```

For more examples, see the [example.html](example.html) file.

## dialog methods

```
var dialog = HtmlDialog.Dialog({...});

dialog.create();
dialog.open();
dialog.close();
dialog.destroy();
```

| method    | description            | return          |
|-----------|------------------------|-----------------|
| create()  | adds dialog to DOM     | dialog instance |
| open()    | open dialog            | dialog instance |
| close()   | close dialog           | dialog instance |
| destroy() | remove dialog from DOM | void            |

### .create()

You can pass an optional parameter to the `create()` method to specify the parent element.

```javascript
var dialog = HtmlDialog.Dialog({...});
dialog.create({
    appendTo: document.getElementById('my-dialog-container')
});
```

## dialog options

```
HtmlDialog.Dialog({
    title: 'Dialog Title',
    content: 'Dialog Content',
    buttons: [
        // ...
    ],
    classNames: {
        // ...
    }
})
```

| option     | type   | default  | description                                     |
|------------|--------|----------|-------------------------------------------------|
| title      | string | required | dialog title                                    |
| content    | string | required | dialog content                                  |
| buttons    | array  | required | dialog buttons, see "buttons option"            |
| classNames | object | {}       | dialog css classnames, see "classNames options" |

## buttons options

```
{
    ...
    buttons: [
        {
            text: 'OK',
            classNames: 'btn btn-primary',
            onclick: function (event) {
                console.log('OK');
                console.log(event);
                this.close();
            }
        }
    ]
    ...
}
```

| option        | type     | default | description           |
|---------------|----------|---------|-----------------------|
| text          | string   | ''      | button text           |
| classNames    | string   | ''      | button css classnames |
| onclick       | function | null    | button callback       |
| oncontextmenu | function | null    | button callback       |
| ondblclick    | function | null    | button callback       |
| ...           | function | null    | button callback       |

All valid mouse events are supported.

https://www.w3schools.com/jsref/obj_mouseevent.asp

The callback function will be called with the dialog instance as the `this` and the mouse event as the first argument.

### classNames options

This option allows you to add custom css classnames to the dialog.

```javascript
HtmlDialog.Dialog({
    title: 'Example',
    content: 'Hello World!',
    buttons: [
        // ...
    ],
    css: {
        dialog: 'dialog-class',
        title: 'title-class',
        content: 'content-class',
        buttons: 'buttons-class',
    }
});
```

The above code will result in the following html:

```html

<dialog class="dialog-class">
    <div class="title-class">Example</div>
    <div class="content-class">Hello World!</div>
    <div class="buttons-class">
        <button>OK</button>
        <button>Cancel</button>
    </div>
</dialog>
```

| option  | type   | default | description |
|---------|--------|---------|-------------|
| dialog  | string | ''      | title css   |
| title   | string | ''      | title css   |
| content | string | ''      | title css   |
| buttons | string | ''      | title css   |

example styles with backdrop:

```css
.dialog-class {
    border: 1px solid red;
    padding: 0;
}

.dialog-class::backdrop {
    background-color: aqua;
}

.title-class {
    background-color: #000;
    color: #fff;
}

.content-class {
    background-color: yellow;
    color: #000;
}

.buttons-class {
    padding: 10px;
    text-align: right;
}
```
