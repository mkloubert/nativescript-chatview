import Button = require("ui/button");
import ListView = require("ui/list-view");
import GridLayout = require("ui/layouts/grid-layout");
import Observable = require("data/observable");
import ObservableArray = require("data/observable-array");
import TextField = require("ui/text-field");
/**
 * A view for displaying chat messages.
 */
export declare class ChatView extends GridLayout.GridLayout {
    /**
     * The name of the event that is raised when the "SEND" button is clicked.
     */
    static sendChatMessageButtonTapEvent: string;
    private _messageField;
    private _messageList;
    private _messages;
    private _sendMessageArea;
    private _sendMessageButton;
    private _sendChatMessageButtonTapEventListeners;
    /** @inheritdoc */
    constructor(json?: any);
    /**
     * Appends a list of messages.
     *
     * @param {IChatMessage} ...msgs One or more messages to append.
     */
    appendMessages(...msgs: IChatMessage[]): void;
    /**
     * Focus the text field with the chat message to send.
     *
     * @return {Boolean} Operation was successful or not.
     */
    focusMessageField(): boolean;
    /**
     * Inserts chat messages at a specific position.
     *
     * @param {Number} index The zero based index where the messages should be inserted.
     * @param {IChatMessage} ...msgs One or more messages to insert.
     */
    insertMessages(index: number, ...msgs: IChatMessage[]): void;
    /**
     * Gets the input field that stores the chat message that should be send.
     */
    messageField: TextField.TextField;
    /**
     * Gets the list that displays the chat messages.
     */
    messageList: ListView.ListView;
    /**
     * Gets the array of messages.
     */
    messages: ObservableArray.ObservableArray<IChatMessage>;
    /**
     * Adds an event handler that is invoked when the "SEND" button is clicked.
     *
     * @param {Function} handler The handler to add.
     */
    notifyOnSendMessageTap(handler: (eventData: SendMessageTappedEventData) => void): void;
    /**
     * Prepends a list of messages.
     *
     * @param {IChatMessage} ...msgs One or more messages to prepend.
     */
    prependMessages(...msgs: IChatMessage[]): void;
    /**
     * Resets the value of the chat message field.
     */
    resetMessage(): void;
    /**
     * Gets the control that contains the chat message field
     * and the "SEND" button.
     */
    sendMessageArea: GridLayout.GridLayout;
    /**
     * Gets the button that is used to send a chat message.
     */
    sendMessageButton: Button.Button;
    /**
     * Gets and sets the caption of the "SEND" button.
     */
    sendMessageButtonCaption: string;
    /**
     * Gets and sets the hint text for the chat message field.
     */
    typeMessageHint: string;
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
export declare class SendMessageTappedEventData implements Observable.EventData {
    private _message;
    private _object;
    /**
     * Initializes a new instance of that class.
     *
     * @param {ChatView} view The underlying view.
     * @param {String} msg
     */
    constructor(view: ChatView, msg: string);
    /** @inheritdoc */
    eventName: string;
    /**
     * Focuses the chat message field.
     *
     * @return {Boolean} Operation was successful or not.
     */
    focusTextField(): boolean;
    /**
     * Gets the message to send.
     */
    message: string;
    /** @inheritdoc */
    object: ChatView;
    /**
     * Resets the message value.
     */
    resetMessage(): void;
    /**
     * Scrolls to bottom.
     */
    scrollToBottom(): void;
}
