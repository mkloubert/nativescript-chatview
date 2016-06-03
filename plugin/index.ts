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

import Button = require("ui/button");
import ListView = require("ui/list-view");
import GridLayout = require("ui/layouts/grid-layout");
import Observable = require("data/observable");
import ObservableArray = require("data/observable-array");
import TextField = require("ui/text-field");
// import TextView = require("ui/text-view");
import TypeUtils = require("utils/types");
import UIEnums = require("ui/enums");

/**
 * A view for displaying chat messages.
 */
export class ChatView extends GridLayout.GridLayout {
    /**
     * The name of the event that is raised when the "SEND" button is clicked.
     */
    public static sendChatMessageButtonTapEvent: string = "sendChatMessageButtonTap";
    
    private _messageField: TextField.TextField;
    // private _messageField: TextView.TextView;
    private _messageList: ListView.ListView;
    private _messages: ObservableArray.ObservableArray<IChatMessage> = new ObservableArray.ObservableArray<IChatMessage>();
    private _sendMessageArea: GridLayout.GridLayout;
    private _sendMessageButton: Button.Button;
    private _sendChatMessageButtonTapEventListeners = [];
    
    /** @inheritdoc */
    constructor(json?: any) {
        super(json);
        
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
        this._messageList.itemTemplate = `<GridLayout rows="auto" columns="auto,*,auto" className="{{ 'nsChatView-item-' + (isRight ? 'right' : 'left') }}">
  <Image row="0" col="{{ isRight ? '2' : '0' }}"
         className="nsChatView-avatar"
         verticalAlignment="top"
         src="{{ image }}"
         visibility="{{ image ? 'visible' : 'collapsed' }}" />
  
  <StackLayout row="0" col="1"
               className="nsChatView-message">
               
    <Border className="nsChatView-messageArea">
      <StackLayout className="nsChatView-content"
                   verticalAlignment="top" horizontalAlignment="{{ isRight ? 'right' : 'left' }}">
        
        <Label className="nsChatView-date"
               horizontalAlignment="{{ isRight ? 'right' : 'left' }}"
               text="{{ date }}"
               visibility="{{ date ? 'visible' : 'collapsed' }}" />
        
        <Label className="nsChatView-messageText"
               horizontalAlignment="{{ isRight ? 'right' : 'left' }}"
               text="{{ message }}" textWrap="true" />
      </StackLayout>
    </Border>
  </StackLayout>

  <Border row="0" col="{{ isRight ? '0' : '2' }}"
          className="nsChatView-separator" />
</GridLayout>`;      
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

        this._messageField.on(TextField.TextField.returnPressEvent, (eventData) => {
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
        
        this._sendMessageButton.on(Button.Button.tapEvent, (eventData) => {
            var chatMsg = me._messageField.text;
            if (TypeUtils.isNullOrUndefined(chatMsg) ||
                "" === chatMsg.trim()) {
                
                return;
            }
            
            me.notify(new SendMessageTappedEventData(me, chatMsg));
        });
        
        this.on(ChatView.sendChatMessageButtonTapEvent, function(eventData) {
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
    public appendMessages(...msgs: IChatMessage[]) {
        for (var i = 0; i < msgs.length; i++) {
            this._messages.push(msgs[i]);
        }
    }

    /**
     * Focus the text field with the chat message to send.
     * 
     * @return {Boolean} Operation was successful or not.
     */
    public focusMessageField() : boolean {
        return this._messageField.focus();
    }
    
    /**
     * Inserts chat messages at a specific position.
     * 
     * @param {Number} index The zero based index where the messages should be inserted.
     * @param {IChatMessage} ...msgs One or more messages to insert.
     */
    public insertMessages(index: number, ...msgs: IChatMessage[]) {
        for (var i = 0; i < msgs.length; i++) {
            this._messages.splice(index + i, 0, msgs[0]);
        }
    }
    
    /**
     * Gets the input field that stores the chat message that should be send.
     */
    public get messageField(): TextField.TextField {
    // public get messageField(): TextView.TextView {
        return this._messageField;
    }
    
    /**
     * Gets the list that displays the chat messages.
     */
    public get messageList(): ListView.ListView {
        return this._messageList;
    }
    
    /**
     * Gets the array of messages.
     */
    public get messages(): ObservableArray.ObservableArray<IChatMessage> {
        return this._messages;
    }
    
    /**
     * Adds an event handler that is invoked when the "SEND" button is clicked.
     * 
     * @param {Function} handler The handler to add.
     */
    public notifyOnSendMessageTap(handler: (eventData: SendMessageTappedEventData) => void) {
        this._sendChatMessageButtonTapEventListeners
            .push(handler);
    }
    
    /**
     * Prepends a list of messages.
     * 
     * @param {IChatMessage} ...msgs One or more messages to prepend.
     */
    public prependMessages(...msgs: IChatMessage[]) {
        for (var i = 0; i < msgs.length; i++) {
            this._messages.splice(i, 0, msgs[0]);
        }
    }
    
    /**
     * Resets the value of the chat message field.
     */
    public resetMessage() {
        this._messageField.text = "";
    }
    
    /**
     * Gets the control that contains the chat message field
     * and the "SEND" button.
     */
    public get sendMessageArea(): GridLayout.GridLayout {
        return this._sendMessageArea;
    }
    
    /**
     * Gets the button that is used to send a chat message.
     */
    public get sendMessageButton(): Button.Button {
        return this._sendMessageButton;
    }
    
    /**
     * Gets and sets the caption of the "SEND" button.
     */
    public get sendMessageButtonCaption() : string {
        return this._sendMessageButton.text;
    }
    public set sendMessageButtonCaption(value: string) {
        this._sendMessageButton.text = value;
    }
    
    /**
     * Gets and sets the hint text for the chat message field.
     */
    public get typeMessageHint() : string {
        return this._messageField.hint;
    }
    public set typeMessageHint(value: string) {
        this._messageField.hint = value;
    }
}

/**
 * Describes an object that stores required data for a char message.
 */
export interface IChatMessage {
    /**
     * The date.
     * 
     * @property
     */
    date?: any;
    
    /**
     * The image source.
     * 
     * @property
     */
    image?: any;
    
    /**
     * Defines if the displayed item is aligned on the right side or not.
     * 
     * @property
     */
    isRight?: boolean;
    
    /**
     * The message value.
     * 
     * @property
     */
    message?: any;
}

/**
 * Data for an event that is raised when the "SEND" button is clicked.
 */
export class SendMessageTappedEventData implements Observable.EventData {
    private _message: string;
    private _object: ChatView;    
    
    /**
     * Initializes a new instance of that class.
     * 
     * @param {ChatView} view The underlying view.
     * @param {String} msg
     */
    constructor(view: ChatView, msg: string) {
        this._object = view;
        this._message = msg;
    }
    
    /** @inheritdoc */
    public get eventName(): string {
        return ChatView.sendChatMessageButtonTapEvent;
    }
    
    /**
     * Focuses the chat message field.
     * 
     * @return {Boolean} Operation was successful or not.
     */
    public focusTextField(): boolean {
        return this._object.focusMessageField();
    }
    
    /**
     * Gets the message to send.
     */
    public get message(): string {
        return this._message;
    }
    
    /** @inheritdoc */
    public get object(): ChatView {
        return this._object;
    }
    
    /**
     * Resets the message value.
     */
    public resetMessage() {
        this._object.resetMessage();
    }
    
    /**
     * Scrolls to bottom.
     */
    public scrollToBottom() {
        this._object.messageList
                    .scrollToIndex(this._object.messages.length - 1);
                    
        this._object.messageList.refresh();
    }
}
