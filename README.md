[![npm](https://img.shields.io/npm/v/nativescript-chatview.svg)](https://www.npmjs.com/package/nativescript-chatview)
[![npm](https://img.shields.io/npm/dt/nativescript-chatview.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-chatview)

# NativeScript API Client

A [NativeScript](https://nativescript.org/) UI module for implementing WhatsApp like chat applications.

## License

[MIT license](https://raw.githubusercontent.com/mkloubert/nativescript-chatview/master/LICENSE)

## Platforms

* Android
* iOS

## Installation

Run

```bash
tns plugin add nativescript-chatview
```

inside your app project to install the module.

## Demo

The demo app can be found [here](https://github.com/mkloubert/nativescript-chatview/tree/master/demo).

![Demo app](https://raw.githubusercontent.com/mkloubert/nativescript-chatview/master/demo.gif)

## Usage

### Include

```javascript
import ChatView = require("nativescript-chatview");
```

### Create

```typescript
import {ChatView} from "nativescript-chatview";

export function onNavigatingTo(args) {
    var page = args.object;

    // create view
    var chatView = new ChatView();
    
    // register event when user taps
    // on SEND button
    chatView.notifyOnSendMessageTap((eventData) => {
        // add a chat message
        eventData.object.appendMessages({            
            date: getTime(),
            isRight: true,
            image: "~/img/avatar.jpg",
            message: eventData.message,    
        });
    });
    
    // focus text field
    chatView.focusMessageField();
    
    page.content = chatView;
}
```
