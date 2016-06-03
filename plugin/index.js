// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
"use strict";
var Button = require("ui/button");
var ListView = require("ui/list-view");
var GridLayout = require("ui/layouts/grid-layout");
var ObservableArray = require("data/observable-array");
var TextField = require("ui/text-field");
// import TextView = require("ui/text-view");
var TypeUtils = require("utils/types");
var UIEnums = require("ui/enums");
/**
 * A view for displaying chat messages.
 */
var ChatView = (function (_super) {
    __extends(ChatView, _super);
    /** @inheritdoc */
    function ChatView(json) {
        _super.call(this, json);
        this._messages = new ObservableArray.ObservableArray();
        this._sendChatMessageButtonTapEventListeners = [];
        var me = this;
        me.className = "nsChatView-view";
        this.addRow(new GridLayout.ItemSpec(1, "star"));
        this.addRow(new GridLayout.ItemSpec(1, "auto"));
        var rootRows = this.getRows();
        var chatListRow = rootRows[0];
        var sendMessageRow = rootRows[1];
        // chat list
        this._messageList = new ListView.ListView();
        this._messageList.className = "nsChatView-messageList";
        this._messageList.horizontalAlignment = "stretch";
        this._messageList.verticalAlignment = "stretch";
        this._messageList.items = this._messages;
        this._messageList.itemTemplate = "<GridLayout rows=\"auto\" columns=\"auto,*,auto\" className=\"{{ 'nsChatView-item-' + (isRight ? 'right' : 'left') }}\">\n  <Image row=\"0\" col=\"{{ isRight ? '2' : '0' }}\"\n         className=\"nsChatView-avatar\"\n         verticalAlignment=\"top\"\n         src=\"{{ image }}\"\n         visibility=\"{{ image ? 'visible' : 'collapsed' }}\" />\n  \n  <StackLayout row=\"0\" col=\"1\"\n               className=\"nsChatView-message\">\n               \n    <Border className=\"nsChatView-messageArea\">\n      <StackLayout className=\"nsChatView-content\"\n                   verticalAlignment=\"top\" horizontalAlignment=\"{{ isRight ? 'right' : 'left' }}\">\n        \n        <Label className=\"nsChatView-date\"\n               horizontalAlignment=\"{{ isRight ? 'right' : 'left' }}\"\n               text=\"{{ date }}\"\n               visibility=\"{{ date ? 'visible' : 'collapsed' }}\" />\n        \n        <Label className=\"nsChatView-messageText\"\n               horizontalAlignment=\"{{ isRight ? 'right' : 'left' }}\"\n               text=\"{{ message }}\" textWrap=\"true\" />\n      </StackLayout>\n    </Border>\n  </StackLayout>\n\n  <Border row=\"0\" col=\"{{ isRight ? '0' : '2' }}\"\n          className=\"nsChatView-separator\" />\n</GridLayout>";
        this.addChild(this._messageList);
        GridLayout.GridLayout.setRow(this._messageList, 0);
        this._sendMessageArea = new GridLayout.GridLayout();
        this._sendMessageArea.className = "nsChatView-sendMessageArea";
        this._sendMessageArea.addRow(new GridLayout.ItemSpec(1, "auto"));
        this._sendMessageArea.addColumn(new GridLayout.ItemSpec(1, "star"));
        this._sendMessageArea.addColumn(new GridLayout.ItemSpec(1, "auto"));
        this.addChild(this._sendMessageArea);
        GridLayout.GridLayout.setRow(this._sendMessageArea, 1);
        this._messageField = new TextField.TextField();
        // this._messageField = new TextView.TextView();
        this._messageField.className = "nsChatView-messageField";
        // this._messageField.returnKeyType = UIEnums.ReturnKeyType.send;
        this._messageField.autocorrect = false;
        this._messageField.autocapitalizationType = UIEnums.AutocapitalizationType.none;
        this._sendMessageArea.addChild(this._messageField);
        GridLayout.GridLayout.setRow(this._messageField, 0);
        GridLayout.GridLayout.setColumn(this._messageField, 0);
        this._messageField.on(TextField.TextField.returnPressEvent, function (eventData) {
            me._sendMessageButton
                .notify({
                eventName: Button.Button.tapEvent,
                object: me._sendMessageButton
            });
        });
        this._sendMessageButton = new Button.Button();
        this._sendMessageButton.className = "nsChatView-sendMessageButton";
        this._sendMessageArea.addChild(this._sendMessageButton);
        GridLayout.GridLayout.setRow(this._sendMessageButton, 0);
        GridLayout.GridLayout.setColumn(this._sendMessageButton, 1);
        this._sendMessageButton.on(Button.Button.tapEvent, function (eventData) {
            var chatMsg = me._messageField.text;
            if (TypeUtils.isNullOrUndefined(chatMsg) ||
                "" === chatMsg.trim()) {
                return;
            }
            me.notify(new SendMessageTappedEventData(me, chatMsg));
        });
        this.on(ChatView.sendChatMessageButtonTapEvent, function (eventData) {
            for (var i = 0; i < me._sendChatMessageButtonTapEventListeners.length; i++) {
                var el = me._sendChatMessageButtonTapEventListeners[i];
                el(eventData);
            }
        });
        this.typeMessageHint = "Type message...";
        this.sendMessageButtonCaption = "SEND";
    }
    /**
     * Appends a list of messages.
     *
     * @param {IChatMessage} ...msgs One or more messages to append.
     */
    ChatView.prototype.appendMessages = function () {
        var msgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msgs[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < msgs.length; i++) {
            this._messages.push(msgs[i]);
        }
    };
    /**
     * Focus the text field with the chat message to send.
     *
     * @return {Boolean} Operation was successful or not.
     */
    ChatView.prototype.focusMessageField = function () {
        return this._messageField.focus();
    };
    /**
     * Inserts chat messages at a specific position.
     *
     * @param {Number} index The zero based index where the messages should be inserted.
     * @param {IChatMessage} ...msgs One or more messages to insert.
     */
    ChatView.prototype.insertMessages = function (index) {
        var msgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            msgs[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < msgs.length; i++) {
            this._messages.splice(index + i, 0, msgs[0]);
        }
    };
    Object.defineProperty(ChatView.prototype, "messageField", {
        /**
         * Gets the input field that stores the chat message that should be send.
         */
        get: function () {
            // public get messageField(): TextView.TextView {
            return this._messageField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "messageList", {
        /**
         * Gets the list that displays the chat messages.
         */
        get: function () {
            return this._messageList;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "messages", {
        /**
         * Gets the array of messages.
         */
        get: function () {
            return this._messages;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds an event handler that is invoked when the "SEND" button is clicked.
     *
     * @param {Function} handler The handler to add.
     */
    ChatView.prototype.notifyOnSendMessageTap = function (handler) {
        this._sendChatMessageButtonTapEventListeners
            .push(handler);
    };
    /**
     * Prepends a list of messages.
     *
     * @param {IChatMessage} ...msgs One or more messages to prepend.
     */
    ChatView.prototype.prependMessages = function () {
        var msgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msgs[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < msgs.length; i++) {
            this._messages.splice(i, 0, msgs[0]);
        }
    };
    /**
     * Resets the value of the chat message field.
     */
    ChatView.prototype.resetMessage = function () {
        this._messageField.text = "";
    };
    Object.defineProperty(ChatView.prototype, "sendMessageArea", {
        /**
         * Gets the control that contains the chat message field
         * and the "SEND" button.
         */
        get: function () {
            return this._sendMessageArea;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "sendMessageButton", {
        /**
         * Gets the button that is used to send a chat message.
         */
        get: function () {
            return this._sendMessageButton;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "sendMessageButtonCaption", {
        /**
         * Gets and sets the caption of the "SEND" button.
         */
        get: function () {
            return this._sendMessageButton.text;
        },
        set: function (value) {
            this._sendMessageButton.text = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChatView.prototype, "typeMessageHint", {
        /**
         * Gets and sets the hint text for the chat message field.
         */
        get: function () {
            return this._messageField.hint;
        },
        set: function (value) {
            this._messageField.hint = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The name of the event that is raised when the "SEND" button is clicked.
     */
    ChatView.sendChatMessageButtonTapEvent = "sendChatMessageButtonTap";
    return ChatView;
}(GridLayout.GridLayout));
exports.ChatView = ChatView;
/**
 * Data for an event that is raised when the "SEND" button is clicked.
 */
var SendMessageTappedEventData = (function () {
    /**
     * Initializes a new instance of that class.
     *
     * @param {ChatView} view The underlying view.
     * @param {String} msg
     */
    function SendMessageTappedEventData(view, msg) {
        this._object = view;
        this._message = msg;
    }
    Object.defineProperty(SendMessageTappedEventData.prototype, "eventName", {
        /** @inheritdoc */
        get: function () {
            return ChatView.sendChatMessageButtonTapEvent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Focuses the chat message field.
     *
     * @return {Boolean} Operation was successful or not.
     */
    SendMessageTappedEventData.prototype.focusTextField = function () {
        return this._object.focusMessageField();
    };
    Object.defineProperty(SendMessageTappedEventData.prototype, "message", {
        /**
         * Gets the message to send.
         */
        get: function () {
            return this._message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SendMessageTappedEventData.prototype, "object", {
        /** @inheritdoc */
        get: function () {
            return this._object;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Resets the message value.
     */
    SendMessageTappedEventData.prototype.resetMessage = function () {
        this._object.resetMessage();
    };
    /**
     * Scrolls to bottom.
     */
    SendMessageTappedEventData.prototype.scrollToBottom = function () {
        this._object.messageList
            .scrollToIndex(this._object.messages.length - 1);
        this._object.messageList.refresh();
    };
    return SendMessageTappedEventData;
}());
exports.SendMessageTappedEventData = SendMessageTappedEventData;
//# sourceMappingURL=index.js.map