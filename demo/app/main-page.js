"use strict";
var ChatViewModule = require("nativescript-chatview");
var Timer = require("timer");
var TypeUtils = require("utils/types");
var ViewModel = require("./main-view-model");
function createAnswer(msg) {
    if (/(\s*)([0-9]+)(\.?)([0-9]*)(\s*)([\+|\-|\*|\/])(\s*)([0-9]+)(\.?)([0-9]*)/i.test(msg)) {
        var result;
        eval("result = " + msg + ";");
        return result;
    }
    else if (checkForAllTerms(getLettersAndDigitsOnly(msg), "how", "are", "you")) {
        return "Fine!";
    }
    else if (checkForAllTerms(getLettersAndDigitsOnly(msg), "what", "time", "is", "it")) {
        return getTime();
    }
    else if (checkForAllTerms(getLettersAndDigitsOnly(msg), "hi")) {
        return "Hi! How are you?";
    }
    else if (checkForAllTerms(getLettersAndDigitsOnly(msg), "fine")) {
        return "Cool!";
    }
    return 'You said: "' + msg + '"';
}
function getSimilarity(left, right) {
    if (left === right) {
        return 1;
    }
    if (TypeUtils.isNullOrUndefined(left) ||
        TypeUtils.isNullOrUndefined(right)) {
        return 0;
    }
    left = left.toLowerCase().trim();
    right = right.toLowerCase().trim();
    var distance = 0;
    if (left !== right) {
        var matrix = new Array(left.length + 1);
        for (var i = 0; i < matrix.length; i++) {
            matrix[i] = new Array(right.length + 1);
            for (var ii = 0; ii < matrix[i].length; ii++) {
                matrix[i][ii] = 0;
            }
        }
        for (var i = 0; i <= left.length; i++) {
            matrix[i][0] = i;
        }
        for (var j = 0; j <= right.length; j++) {
            matrix[0][j] = j;
        }
        for (var i = 0; i < left.length; i++) {
            for (var j = 0; j < right.length; j++) {
                if (left[i] === right[j]) {
                    matrix[i + 1][j + 1] = matrix[i][j];
                }
                else {
                    matrix[i + 1][j + 1] = Math.min(matrix[i][j + 1] + 1, matrix[i + 1][j] + 1);
                    matrix[i + 1][j + 1] = Math.min(matrix[i + 1][j + 1], matrix[i][j] + 1);
                }
            }
            distance = matrix[left.length][right.length];
        }
    }
    return 1.0 - distance / Math.max(left.length, right.length);
}
function checkForAllTerms(str) {
    var terms = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        terms[_i - 1] = arguments[_i];
    }
    var parts = str.split(" ");
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.trim() === "") {
            continue;
        }
        var found = false;
        for (var ii = 0; ii < terms.length; ii++) {
            var t = terms[ii];
            if (getSimilarity(p, t) >= 0.5) {
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }
    return true;
}
function getLettersAndDigitsOnly(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        if (/[a-zA-Z0-9]/i.test(str[i])) {
            result += str[i];
        }
        else if (/[\s]/i.test(str[i])) {
            result += " ";
        }
    }
    return result;
}
function getTime() {
    var now = new Date();
    var hours = now.getHours();
    return numberToString(hours == 12 ? 12 : (hours % 12)) + ":" + numberToString(now.getMinutes()) + " " +
        (hours < 13 ? "AM" : "PM");
}
function numberToString(n) {
    var str = "" + n;
    if (n < 10) {
        str = "0" + str;
    }
    return str;
}
function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = ViewModel.createViewModel();
    var chatView = new ChatViewModule.ChatView();
    chatView.sendMessageButtonCaption = "Send";
    chatView.typeMessageHint = "Your message for Albert";
    chatView.notifyOnSendMessageTap(function (eventData) {
        eventData.object.appendMessages({
            date: getTime(),
            isRight: true,
            image: "~/img/marcel.jpg",
            message: eventData.message,
        });
        eventData.resetMessage();
        eventData.scrollToBottom();
        eventData.focusTextField();
        Timer.setTimeout(function () {
            eventData.object.appendMessages({
                date: getTime(),
                isRight: false,
                image: "~/img/alert.jpg",
                message: createAnswer(eventData.message),
            });
        }, Math.floor(Math.random() * 2000));
    });
    chatView.focusMessageField();
    page.content = chatView;
}
exports.onNavigatingTo = onNavigatingTo;
//# sourceMappingURL=main-page.js.map