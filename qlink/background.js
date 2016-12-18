/**
 * MIT License
 * Copyright (c) 2016 Lucas Mingarro, Ezequiel Alvarez, César Miquel, Ricardo Bianchi, Sebastián Manusovich
 * https://opensource.org/licenses/MIT
 *
 * @author Ricardo Bianchi <rbianchi@qlink.it>
 */
 
"use strict";

var seltext = null;
var sendResponseLocal;
var sendResponseShort;
var sendResponseLocalNw;
var type = "S";
var auxResponse;
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

    switch (request.message) {
        case 'setText':
        window.seltext = request.data;
        sendResponseLocal = sendResponse;
        break;
        case 'setTextShort':
        window.seltext = request.data;
        sendResponseLocal = sendResponse;
        dosavetext();
        break;
        case 'setTextNw':
        window.seltext = request.data;
        sendResponseLocalNw = sendResponse;
        sendResponseLocal = sendResponse;
        break;
        case 'setWin':
        window.seltext = request.data;
        break;
        case 'removeContext':
        auxResponse = sendResponse;
        removeContexts();
        break;
        case 'generateContext':
        auxResponse = sendResponse;
        generateContexts(request.data);
        break;
        case 'updateStrengthExtension':
        updateStrengthExtension(request.evento);
        break;
        case 'waitOK':
        if (request.type != "open") {
            dosavetext();
        }
        break;
        case 'setTextql':
        setTextql(request.data);
        break;
        case 'getUrlExtension':
        var errorURL = chrome.extension.getURL("delete.png");
        var spinnerURL = chrome.extension.getURL("spinner.gif");

        sendResponse({
            errorURL: errorURL,
            spinnerURL: spinnerURL
        });
        break;
        case 'shortOpen':
        type = "SO";
        sendResponseShort = sendResponse;
        sendResponseLocalNw = sendResponse;
        break;
        default:
        sendResponse({
            data: 'Invalid arguments'
        });
        break;
    }
});

function dosavetext() {
    type = "S";
    sleep(1000, dotoken, null);
}

function dotoken() {
    tokenizer(window.seltext);
}

function savetext(info, tab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "wait",
            type: "save"
        });
    });
}

function openhelppopup() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "help",
            type: "open"
        });
    });
}

function openpopup() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "wait",
            type: "open"
        });
    });
}

function doopenpopup() {
    chrome.runtime.sendMessage({
        type: 'request_text'
    });
}

function finalView(qlink) {
    if (qlink == false) {
        if (type == "S")
            sendResponseLocal({
                data: false
            });
        if (type == "N")
            sendResponseLocalNw({
                data: false
            });
        if (type == "SO")
            sendResponseShort({
                data: false
            });
    } else {
        if (type == "S")
            sendResponseLocal({
                data: qlink
            });
        if (type == "N")
            sendResponseLocalNw({
                data: qlink
            });
        if (type == "SO")
            sendResponseShort({
                data: qlink
            });
    }

    chrome.extension.getViews().forEach(function(win) {
        if (win.document.body.classList.contains('waitPopup')) {
            win.close();
        }
    });
}

var lastTabUrl;
var selectedTabId;

chrome.tabs.onActivated.addListener(function(evt) {

    chrome.tabs.get(evt.tabId, function(tab) {

        if (tab && tab.url) {
            lastTabUrl = tab.url;
            var fUrl = extractDomain(lastTabUrl);
            if (fUrl == "chrome-devtools://devtools/*")
                return;

            chrome.contextMenus.removeAll(function() {

                var PERMISSIONS = {
                    origins: [fUrl]
                };
                chrome.permissions.contains(PERMISSIONS, function(result) {
                    if (result == true) {
                        selectedTabId = tab.id;
                        doGenerate();
                    }
                });
            });
        }
    });
});

function extractDomain(url) {
    var domain;
    domain = url.split('/')[2];
    domain = domain.split(':')[0];
    domain = url.split('/')[0] + "//" + url.split('/')[1] + domain + "/*";
    return domain;
}

function removeContexts() {
    chrome.contextMenus.removeAll(function() {
        auxResponse({});
    });
}

function generateContexts(url) {
    chrome.contextMenus.removeAll(function() {
        var PERMISSIONS = {
            origins: [url]
        };
        chrome.permissions.contains(PERMISSIONS, function(result) {
            if (result == true) {
                doGenerate();
                auxResponse({});
            }
        });
    });
}

var cMenuSelection = -1;
var cMenuEditable = -1;
var cMenuHelp = -1;

function doGenerate() {
    var contexts = ["selection"];
    for (var i = 0; i < contexts.length; i++) {
        var context = contexts[i];

        var text = chrome.i18n.getMessage("replace");
        cMenuSelection = chrome.contextMenus.create({
            "title": text,
            "contexts": [context],
            "onclick": savetext
        });
    }

    var contextsEd = ["editable"];
    for (var i = 0; i < contextsEd.length; i++) {
        var contextEd = contextsEd[i];
        var text = chrome.i18n.getMessage("new");
        cMenuEditable = chrome.contextMenus.create({
            "title": text,
            "contexts": [contextEd],
            "onclick": openpopup
        });

        cMenuHelp = chrome.contextMenus.create({
            "title": chrome.i18n.getMessage("helptitle"),
            "contexts": [contextEd],
            "onclick": openhelppopup
        });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'request_text') {
        chrome.tabs.create({
            url: chrome.extension.getURL('dialog.html'),
            active: false
        }, function(tab) {
            var w = 440;
            var h = 320;
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);

            chrome.windows.create({
                tabId: tab.id,
                type: 'popup',
                width: w,
                height: h,
                left: left,
                top: top,
                focused: true,
                incognito: true
            });
        });
    }
});

function createPopupWait() {
    chrome.tabs.create({
        url: chrome.extension.getURL('wait.html'),
        active: false
    }, function(tab) {
        var w = 240;
        var h = 50;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);

        chrome.windows.create({
            tabId: tab.id,
            type: 'popup',
            width: w,
            height: h,
            left: left,
            top: top,
            focused: true,
            incognito: true
        });
    });
}

function changeDialogText(text) {
    chrome.tabs.sendRequest(selectedTabId, {
        'message': 'changeDialogText',
        'text': text
    }, function(response) {});
}

function setTextql(text) {
    chrome.tabs.sendRequest(selectedTabId, {
        'message': 'openDialog'
    }, function(response) {});

    type = "N";
    window.seltext = text;
    sleep(1000, dotoken, null);
}