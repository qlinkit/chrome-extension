/**
 * MIT License
 * Copyright (c) 2016 Lucas Mingarro, Ezequiel Alvarez, César Miquel, Ricardo Bianchi, Sebastián Manusovich
 * https://opensource.org/licenses/MIT
 *
 * @author Ricardo Bianchi <rbianchi@qlink.it>
 */
 
"use strict";

var webServer = "http://qlink";

var typer = "";
var iconURL = webServer + "/images/qlink_it_meta.png";
var spinnerURL = webServer + "/images/spinner.gif";
var errorURL = webServer + "/images/delete.png";

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch (request.message) {
        case 'openDialog':
        createMessageBox();
        break;
        case 'changeDialogText':
        changeDialogText(request.text);
        break;
        default:
        break;
    }
});

var intervalHandle = null;
var propag = "<br/><span style='display: block;float: right;margin-top: 20px;font-size: 10px;'>too Available on: Web App | Play Store | App Store</span>";

function changeDialogText(textID) {
    var text = chrome.i18n.getMessage(textID);
    if (textID == "error") {
        document.getElementById("dialogImage").style.display = 'none';
        document.getElementById("dialogImageE").style.display = 'inline';
    }
    $('#dialogText').html(text + propag);
}



document.addEventListener("DOMContentLoaded", function(e) {
    chrome.extension.sendRequest({
        'message': 'getUrlExtension'
    }, function(response) {
        errorURL = response.errorURL;
        spinnerURL = response.spinnerURL;
    });

    var sha256 = CryptoJS.algo.SHA256.create();

    sha256.update((new Date().getTime()).toString() + e.currentTarget.firstElementChild.innerHTML + e.timeStamp);
    var b = sha256.finalize();

    chrome.extension.sendRequest({
        'message': 'updateStrengthExtension',
        'evento': {
            'pageX': 0,
            'pageY': 0,
            'timeStamp': b
        }
    }, function(response) {});


    if (top.document == document) { 
        var headID = document.getElementsByTagName('head')[0];
        var newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.src = chrome.extension.getURL('xmlrpc.js');
        headID.appendChild(newScript);
    }

    intervalHandle = setInterval(function() {
        check();
    }, 2000);
}, true);

var CONSTANTS = {
    LOCK_IMAGE: 'data:image/png;base64,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',
    UNLOCK_IMAGE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffCgwWGCiA30wiAAADsklEQVRYw+2XP4gdVRTGf+feO7PZ3bebXY2Jf0CjXQTRKIGAnYhgoSBiJyksLDSVFmIXLZJUCkKKaKuNlQRB0IBCRAVtRCEEtIogKBhJNmbfe3PPsZh75723vpnN7NoI3uHxYObO+c6f7zvnDvzXl9zctjf2xWfjk3pY7zSnv9uP7rPio5OX/iWAUwM9rS8LHgcoYza5gRK+WDh28vKuAd5+JH4nFBQEPA4HjLnOFa6gLL14+r3u933343ePyScFJSUlexiwzi2sscYqAxYYsfHUY3d/eW7HAO8flY/B4fDsYS+rLF9burq8vMY6KyxSMOTq4cdXLnzabsN1AZTnDUt+FJ/L/bF8dPXI/odk82B8Z417uJf72Mv1V9+8fUc1OPfhjeeuEQEhPP/CB7NPfziy9M3Y/cLP/IT8unTXCesZwSUpnhmjGJHq+Fbz8MC3Gw+X7OcAt1Hd4Q/0TtHlJwgVyojNr186M2/Hg98Pzyyyzj4WGJ/tDeBPKErkL4avte05dNxYZIUB1dNnXU+A4qihDNmMr19or1P8ylOyjPLboBfA+TIAypDhxS6exYvgKPFY0QtgQWp6jdFhF4AODcMjSN8U1QCGdTaTrBPZmdBqE51PDRTr2Od22e7NyNdOATpD0G3M7zoCM0MTTC+Ag6PaeSV2FyFmgD9HN93s3hrfyoAylBSUFFZWQTxCSJtrhRuRisqN3IgRQ6pqgz945R9qCHNAQ86qIDihUARPRFJJDMEAh+DqXfMtddUgFy+m7GYqCi4ZlZSADDJ/hfl5q2dvNjHhSYZRKmzL1QPAGvHMvl77bVhKGQ1s7wikMScpBsWaqNyUPGwbrYfuXiTJaA2o6b6mCGkc6AlgyWPDqBIPHB7wDYCigOJSvdoaXmjrDg7BkHTc8jgEElWzC9q40d5TwnzuSjqs5ETZ1P26yJMCd/OoI0VKJOJR6sNX7a+kSLQp8LQmehVZZlhiOCzFUJO1AmIjOukDIEn+Hk8gpBr4KR3EGZpaiqdXkSf/miC1iUkaHk2K3DbVQlsFIlVSQdlkXlLfsfRzzdWepDA/QS6dqX3zTWANe3JU2XOdiqFnkbNPLsFIMxGmCdp9qghdzVq3mNKG/5NmuN1BPbRPgqyFmjd10iZpme1HvZQ8SU6oh2aTojyfMrSmj8Kuo0don2iStOxQDJ9Sk3VQx1ClEvdWsjSUzILLUzjrOE+GCTmtX5Gnm0Q99DOTjIhvOuuEurITmk4mtEtzYNpbm6P7/1fv9TcYQ6fgeOURBQAAAABJRU5ErkJggg=='
};
var securedComposer = false;

function check() {
    var compose = $('[gh=cm]');
    if (compose) {
        createNewSecureButton();
        clearInterval(intervalHandle);
    }
}

function createNewSecureButton() {
    var compose = $('[gh=cm]');
    var composeParent = compose[0].parentNode;

    compose[0].style.display = 'inline-block';
    compose[0].style.width = '75px';
    compose[0].style.minWidth = '75px';

    var secureCompose = $(document.createElement('div'));
    secureCompose[0].innerHTML = [
    '<div id="securedImage" style="',
    'height: 100%;',
    'width: 26px;',
    'background-image: url(' + CONSTANTS.UNLOCK_IMAGE + ');',
    'background-size: 24px 24px;',
    'background-repeat: no-repeat;',
    'background-position: 1px 2px;',
    '"></div>'
    ].join("");

    secureCompose.addClass('T-I J-J5-Ji T-I-KE L3');
    secureCompose[0].style.display = 'inline-block';
    secureCompose[0].style.minWidth = '20px';
    secureCompose[0].style.marginLeft = '1px';
    secureCompose[0].style.verticalAlign = 'top';

    secureCompose[0].addEventListener('mouseover', function() {
        secureCompose.addClass('T-I-JW');
    });

    secureCompose[0].addEventListener('mouseout', function() {
        secureCompose.removeClass('T-I-JW');
    });

    $(composeParent).append(secureCompose[0]);

    secureCompose[0].addEventListener('click', function(e) {
        if (securedComposer == true) {
            securedComposer = false;
            var secImg = $('#securedImage');
            secImg[0].style.backgroundImage = 'url(' + CONSTANTS.UNLOCK_IMAGE + ')';
            var headID = document.getElementsByTagName('head')[0];
            var newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            newScript.src = chrome.extension.getURL('flagNS.js');
            headID.appendChild(newScript);
        } else {
            securedComposer = true;
            var secImg = $('#securedImage');
            secImg[0].style.backgroundImage = 'url(' + CONSTANTS.LOCK_IMAGE + ')';
            var headID = document.getElementsByTagName('head')[0];
            var newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            newScript.src = chrome.extension.getURL('flag.js');
            headID.appendChild(newScript);
        }
    });

    compose[0].addEventListener('click', function(e) {
        addShortcutSupport();
    });
}

function addShortcutSupport() {
    var editableTextBox = $("div[role='textbox']");
    if ( editableTextBox.length > 0 ) {
        editableTextBox[0].addEventListener('focus', function(event) {
            event.target.removeEventListener('keyup', s1);
            event.target.addEventListener('keyup', s1);
            event.target.removeEventListener('keyup', s2);
            event.target.addEventListener('keydown', s2);

        });
    }
}

document.addEventListener('mousemove', function(e) {
    chrome.extension.sendRequest({
        'message': 'updateStrengthExtension',
        'evento': {
            'pageX': e.pageX,
            'pageY': e.pageY,
            'timeStamp': e.timeStamp
        }
    }, function(response) {});
});

document.addEventListener('focusout', function(e) {
    chrome.extension.sendRequest({
        'message': 'removeContext'
    }, function(response) {});
});

document.addEventListener('focus', function(e) {
    e.target.removeEventListener('keyup', s1);
    e.target.addEventListener('keyup', s1);
    e.target.removeEventListener('keyup', s2);
    e.target.addEventListener('keydown', s2);

    if (generating == true) {
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }

    if (e.target.name == "subjectbox" || e.target.name == "to" || e.target.name == "cc" || e.target.name == "bcc") {
        chrome.extension.sendRequest({
            'message': 'removeContext'
        }, function(response) {});
    } else {
        chrome.extension.sendRequest({
            'message': 'generateContext',
            data: window.location.protocol + "//" + window.location.host + "/*"
        }, function(response) {});
    }
}, true);

var z;
var ztext;

var isCtrl = false;
var isShift = false;
var hiddenMark = "<div style='display:none'>qlmark</div>";

function e1(e) {
    if (e.which == 27) {
        replaceSelectionMark("", true);
        removeDialogMessageUserBox();
    } 
}

function s1(e) {
    if (e.which == 17) isCtrl = false;
    if (e.which == 16) isShift = false;
}

var savedSel;
function s2(e) {
    if (e.which == 17) isCtrl = true;
    if (e.which == 16) isShift = true;
    if (e.which == 90 && isCtrl == true && isShift == true) {
        isShift = false;
        isCtrl = false;
        var editableTextBox = $("div[role='textbox']");
        savedSel = rangy.saveSelection();


        chrome.extension.sendRequest({
            'message': 'shortOpen',
            'context': window.location.protocol + "//" + window.location.host + "/*"
        }, function(response) {
            generating = false;
            if (canceled) {
                removeMessageBox();
                typer = "";
                return;
            }

            if (response.data == false) {
                typer = "";
                changeDialogText("error");
                return;
            }

            var sel = ztext;
            rangy.restoreSelection(savedSel);
            replaceSelection("<a href='" + response.data + "' style='padding: 1px;text-decoration: blink;'><img style='width: 16px;vertical-align: middle;' src='" + iconURL + "'>qlinkedContent</a>", true);

            typer = "";
            removeMessageBox();
        });
        createDialogMessageBox();
        return false;
    }

    if (e.which == 88 && isCtrl == true && isShift == true) {
        isShift = false;
        isCtrl = false;
        if (generating == true) {
            event.stopPropagation();
            event.preventDefault();
            event.cancelBubble = true;
            event.returnValue = false;
            return false;
        } else {
            ztext = window.getSelection().toString();
        }

        var sel = ztext;

        chrome.extension.sendRequest({
            'message': 'setWin',
            'data': sel,
            'context': window.location.protocol + "//" + window.location.host + "/*"
        }, function(response) {});

        if (sel.length) {
            typer = "M";
            createMessageBox();
            var editableTextBox = $("div[role='textbox']");
            savedSel = rangy.saveSelection();


            chrome.extension.sendRequest({
                'message': 'setTextShort',
                'data': sel,
                'context': window.location.protocol + "//" + window.location.host + "/*"
            }, function(response) {
                generating = false;
                if (canceled) {
                    removeMessageBox();
                    typer = "";
                    return;
                }

                if (response.data == false) {
                    typer = "";
                    changeDialogText("error");
                    return;
                }

                rangy.restoreSelection(savedSel);
                replaceSelection("<a href='" + response.data + "' style='padding: 1px;text-decoration: blink;'><img style='width: 16px;vertical-align: middle;' src='" + iconURL + "'>qlinkedContent</a>", true);

                typer = "";
                removeMessageBox();
            });
        } else {
            typer = "";
        }
        return false;
    }
}

function nodeInsertedCallback(event) {
    var index;
    for (index = 0; index < event.srcElement.parentElement.classList.length; ++index) {
        if (event.srcElement.parentElement.classList[index] == "oG" && securedComposer) {
            event.srcElement.data = "Preventing save";
            event.stopPropagation();
            event.preventDefault();
            event.cancelBubble = true;
            event.returnValue = false;
            return false;
        }
    }
};
document.addEventListener('DOMNodeInserted', nodeInsertedCallback);


document.addEventListener('click', function(event) {
    event.target.removeEventListener('keyup', s1);
    event.target.addEventListener('keyup', s1);
    event.target.removeEventListener('keyup', s2);
    event.target.addEventListener('keydown', s2);

    if (generating == true) {
        event.stopPropagation();
        event.preventDefault();
        event.cancelBubble = true;
        event.returnValue = false;
        return false;
    } else {
        z = window.getSelection();
    }

    var auxsel = window.getSelection().toString();

    if (!z || !z.baseNode) {
        return;
    }
    var el = z.baseNode.firstElementChild;
    if (el && (el.name == "subjectbox" || el.name == "to" || el.name == "cc" || el.name == "bcc")) 
    {
        chrome.extension.sendRequest({
            'message': 'removeContext'
        }, function(response) {});
    } else if (z.baseNode && z.baseNode.name && z.baseNode.name == "to") {
        chrome.extension.sendRequest({
            'message': 'removeContext'
        }, function(response) {});
    } else {
        if (auxsel.length == 0) {
            chrome.extension.sendRequest({
                'message': 'generateContext',
                data: window.location.protocol + "//" + window.location.host + "/*"
            }, function(response) {});
        }
    }
});

var wrapperDiv;
var modalDialogParentDiv;

function createMessageBox() {
    canceled = false;
    generating = true;
    var text = chrome.i18n.getMessage("wait");

    wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("style", "pointerEvents:none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; position: absolute; left: 0px; top: 0px; background-color: rgb(255, 255, 255); opacity: 0.5; z-index: 2000; height: 1083px; width: 100%;");
    wrapperDiv.setAttribute("unselectable", "on");
    wrapperDiv.onselectstart = function() {
        return false;
    };
    wrapperDiv.onmousedown = function() {
        return false;
    };
    wrapperDiv.onmousemove = function() {
        return false;
    };
    wrapperDiv.onmouseup = function() {
        return false;
    };
    wrapperDiv.oncontextmenu = function() {
        return false;
    };
    wrapperDiv.onselect = function() {
        return false;
    };
    wrapperDiv.onclick = function() {
        return false;
    };

    modalDialogParentDiv = document.createElement("div");
    modalDialogParentDiv.setAttribute("style", "pointerEvents:none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; position: absolute;width: 350px;color: #909090;border: 1px ridge rgb(226, 226, 226);padding: 10px;background-color: rgb(253, 253, 253);z-index: 2001;overflow: auto;text-align: center;top: 149px;left: 50%; margin-left: -175px;font-size: 13px;");
    modalDialogParentDiv.setAttribute("unselectable", "on");
    modalDialogParentDiv.onselectstart = function() {
        return false;
    };
    modalDialogParentDiv.onmousedown = function() {
        return false;
    };
    modalDialogParentDiv.onmousemove = function() {
        return false;
    };
    modalDialogParentDiv.onmouseup = function() {
        return false;
    };
    modalDialogParentDiv.oncontextmenu = function() {
        return false;
    };
    modalDialogParentDiv.onselect = function() {
        return false;
    };
    modalDialogParentDiv.onclick = function() {
        return false;
    };

    var modalDialogSiblingDiv = document.createElement("div");
    modalDialogSiblingDiv.setAttribute("style", "pointerEvents:none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;");
    modalDialogSiblingDiv.setAttribute("unselectable", "on");
    modalDialogSiblingDiv.onselectstart = function() {
        return false;
    };
    modalDialogSiblingDiv.onmousedown = function() {
        return false;
    };
    modalDialogSiblingDiv.onmousemove = function() {
        return false;
    };
    modalDialogSiblingDiv.onmouseup = function() {
        return false;
    };
    modalDialogSiblingDiv.oncontextmenu = function() {
        return false;
    };
    modalDialogSiblingDiv.onselect = function() {
        return false;
    };
    modalDialogSiblingDiv.onclick = function() {
        return false;
    };

    var modalDialogTextDiv = document.createElement("div");
    modalDialogTextDiv.setAttribute("style", "text-align:center;pointerEvents:none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;");
    modalDialogTextDiv.setAttribute("unselectable", "on");
    modalDialogTextDiv.onselectstart = function() {
        return false;
    };
    modalDialogTextDiv.onmousedown = function() {
        return false;
    };
    modalDialogTextDiv.onmousemove = function() {
        return false;
    };
    modalDialogTextDiv.onmouseup = function() {
        return false;
    };
    modalDialogTextDiv.oncontextmenu = function() {
        return false;
    };
    modalDialogTextDiv.onselect = function() {
        return false;
    };
    modalDialogTextDiv.onclick = function() {
        return false;
    };

    var modalDialogTextSpan = document.createElement("span");
    modalDialogTextSpan.setAttribute("unselectable", "on");
    modalDialogTextSpan.onselectstart = function() {
        return false;
    };
    modalDialogTextSpan.onmousedown = function() {
        return false;
    };
    modalDialogTextSpan.onmousemove = function() {
        return false;
    };
    modalDialogTextSpan.onmouseup = function() {
        return false;
    };
    modalDialogTextSpan.oncontextmenu = function() {
        return false;
    };
    modalDialogTextSpan.onselect = function() {
        return false;
    };
    modalDialogTextSpan.setAttribute("style", "display: inline-block; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none");
    modalDialogTextSpan.onclick = function() {
        return false;
    };

    var modalDialogTextSpan2 = document.createElement("span");
    modalDialogTextSpan2.setAttribute("unselectable", "on");
    modalDialogTextSpan2.onselectstart = function() {
        return false;
    };
    modalDialogTextSpan2.onmousedown = function() {
        return false;
    };
    modalDialogTextSpan2.onmousemove = function() {
        return false;
    };
    modalDialogTextSpan2.onmouseup = function() {
        return false;
    };
    modalDialogTextSpan2.oncontextmenu = function() {
        return false;
    };
    modalDialogTextSpan2.onselect = function() {
        return false;
    };
    modalDialogTextSpan2.setAttribute("style", "border: 1px solid #ddd; padding: 1px; float: right; display: inline-block; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none; cursor: pointer;");
    modalDialogTextSpan2.onclick = function() {
        removeMessageUserBox();
        return false;
    };
    modalDialogTextSpan2.innerHTML = "X";

    var modalDialogImage = document.createElement("img");
    modalDialogImage.src = spinnerURL;
    modalDialogImage.setAttribute("unselectable", "on");
    modalDialogImage.onselectstart = function() {
        return false;
    };
    modalDialogImage.onmousedown = function() {
        return false;
    };
    modalDialogImage.onmousemove = function() {
        return false;
    };
    modalDialogImage.onmouseup = function() {
        return false;
    };
    modalDialogImage.oncontextmenu = function() {
        return false;
    };
    modalDialogImage.onselect = function() {
        return false;
    };
    modalDialogImage.setAttribute("id", "dialogImage");
    modalDialogImage.setAttribute("style", "width: 21px; vertical-align: middle;margin-right: 5px;margin-top: -1px;-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none");

    var modalDialogImageE = document.createElement("img");
    modalDialogImageE.src = errorURL;
    modalDialogImageE.setAttribute("unselectable", "on");
    modalDialogImageE.onselectstart = function() {
        return false;
    };
    modalDialogImageE.onmousedown = function() {
        return false;
    };
    modalDialogImageE.onmousemove = function() {
        return false;
    };
    modalDialogImageE.onmouseup = function() {
        return false;
    };
    modalDialogImageE.oncontextmenu = function() {
        return false;
    };
    modalDialogImageE.onselect = function() {
        return false;
    };
    modalDialogImageE.setAttribute("id", "dialogImageE");
    modalDialogImageE.setAttribute("style", "display:none; width: 21px; vertical-align: middle;margin-right: 5px;margin-top: -1px;-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none");


    var modalDialogText = document.createElement("span");
    modalDialogText.setAttribute("unselectable", "on");
    modalDialogText.setAttribute("id", "dialogText");
    modalDialogText.onselectstart = function() {
        return false;
    };
    modalDialogText.onmousedown = function() {
        return false;
    };
    modalDialogText.onmousemove = function() {
        return false;
    };
    modalDialogText.onmouseup = function() {
        return false;
    };
    modalDialogText.oncontextmenu = function() {
        return false;
    };
    modalDialogText.onselect = function() {
        return false;
    };
    modalDialogText.onclick = function() {
        return false;
    };
    modalDialogText.setAttribute("style", "-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none; color:#989898;");
    modalDialogText.innerHTML = text + propag;

    var breakElement = document.createElement("br");

    modalDialogTextSpan.appendChild(modalDialogImage);
    modalDialogTextSpan.appendChild(modalDialogImageE);

    modalDialogTextSpan.appendChild(modalDialogText);
    modalDialogTextDiv.appendChild(modalDialogTextSpan);
    modalDialogTextDiv.appendChild(modalDialogTextSpan2);
    modalDialogTextDiv.appendChild(breakElement);

    modalDialogSiblingDiv.appendChild(modalDialogTextDiv);
    modalDialogParentDiv.appendChild(modalDialogSiblingDiv);

    document.body.appendChild(wrapperDiv);
    document.body.appendChild(modalDialogParentDiv);
}

function createDialogHelpMessageBox() { 
    document.removeEventListener('keyup', e1);
    document.addEventListener('keyup', e1);

    var text = chrome.i18n.getMessage("qhelp");
    wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("style", "position: absolute; left: 0px; top: 0px; background-color: rgb(255, 255, 255); opacity: 0.5; z-index: 2000; height: 1083px; width: 100%;");

    modalDialogParentDiv = document.createElement("div");
    modalDialogParentDiv.setAttribute("style", "position: absolute;width: 350px;color: #909090;border: 1px ridge rgb(226, 226, 226);padding: 0px;background-color: rgb(253, 253, 253);z-index: 2001;overflow: hidden;text-align: center;top: 149px;left: 50%; margin-left: -175px; font-size: 13px;");
    modalDialogParentDiv.setAttribute("class", "nH Hd");

    var modalDialogSiblingDiv = document.createElement("div");
    modalDialogSiblingDiv.setAttribute("style", "");

    var modalDialogTextDiv = document.createElement("div");
    modalDialogTextDiv.setAttribute("style", "text-align:center;");

    var modalDialogTextSpan = document.createElement("span");
    modalDialogTextSpan.setAttribute("style", "display: inline-block;");

    var modalDialogTextSpan2 = document.createElement("span");
    modalDialogTextSpan2.setAttribute("unselectable", "on");
    modalDialogTextSpan2.setAttribute("class", "Ha");
    modalDialogTextSpan2.onselectstart = function() {
        return false;
    };
    modalDialogTextSpan2.onmousedown = function() {
        return false;
    };
    modalDialogTextSpan2.onmousemove = function() {
        return false;
    };
    modalDialogTextSpan2.onmouseup = function() {
        return false;
    };
    modalDialogTextSpan2.oncontextmenu = function() {
        return false;
    };
    modalDialogTextSpan2.onselect = function() {
        return false;
    };
    modalDialogTextSpan2.setAttribute("style", "margin-top: -4px; float: right; display: inline-block; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none; cursor: pointer;");
    modalDialogTextSpan2.onclick = function() {
        replaceSelectionMark("", true);
        removeDialogMessageUserBox();
        return false;
    };
    modalDialogTextSpan2.innerHTML = "";

    var modalDialogText = document.createElement("span");
    modalDialogText.setAttribute("unselectable", "on");
    modalDialogText.setAttribute("id", "dialogText");
    modalDialogText.onselectstart = function() {
        return false;
    };
    modalDialogText.onmousedown = function() {
        return false;
    };
    modalDialogText.onmousemove = function() {
        return false;
    };
    modalDialogText.onmouseup = function() {
        return false;
    };
    modalDialogText.oncontextmenu = function() {
        return false;
    };
    modalDialogText.onselect = function() {
        return false;
    };
    modalDialogText.onclick = function() {
        return false;
    };
    modalDialogText.setAttribute("style", "-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none; color:#ffffff;");
    modalDialogText.innerHTML = text;

    var modalDialogInputText = document.createElement("span");
    modalDialogInputText.setAttribute("id", "helpBoxQlink");
    modalDialogInputText.setAttribute("style", "border: none;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;color: rgb(152, 152, 152); margin: 0px; width: 327px; text-align:justify; display:block; margin-top: 8px;border: none;border-radius: 2px;padding: 10px;");
    modalDialogInputText.innerHTML = chrome.i18n.getMessage("qhelpdescription");

    var modalFooterDiv = document.createElement("div");
    modalFooterDiv.setAttribute("class", "aDh");
    modalFooterDiv.setAttribute("style", "margin-bottom: -16px;border-top: 1px solid #cfcfcf;");

    var breakElement = document.createElement("br");

    var modalHeaderDiv = document.createElement("div");
    modalHeaderDiv.setAttribute("style", "background: #404040; margin: 0px;padding: 8px;height: 19px;text-align: left; ");

    modalDialogTextSpan.appendChild(modalDialogText);
    modalHeaderDiv.appendChild(modalDialogTextSpan);
    modalHeaderDiv.appendChild(modalDialogTextSpan2);
    modalDialogTextDiv.appendChild(modalHeaderDiv);

    modalDialogTextDiv.appendChild(modalDialogInputText);
    modalDialogTextDiv.appendChild(modalFooterDiv);

    modalDialogTextDiv.appendChild(breakElement);

    modalDialogSiblingDiv.appendChild(modalDialogTextDiv);
    modalDialogParentDiv.appendChild(modalDialogSiblingDiv);

    document.body.appendChild(wrapperDiv);
    document.body.appendChild(modalDialogParentDiv);
}

function createDialogMessageBox() {
    document.removeEventListener('keyup', e1);
    document.addEventListener('keyup', e1);

    var text = chrome.i18n.getMessage("textql");

    wrapperDiv = document.createElement("div");
    wrapperDiv.setAttribute("style", "position: absolute; left: 0px; top: 0px; background-color: rgb(255, 255, 255); opacity: 0.5; z-index: 2000; height: 1083px; width: 100%;");

    modalDialogParentDiv = document.createElement("div");
    modalDialogParentDiv.setAttribute("style", "position: absolute;width: 350px;color: #909090;border: 1px ridge rgb(226, 226, 226);padding: 0px;background-color: rgb(253, 253, 253);z-index: 2001;overflow: hidden;text-align: center;top: 149px;left: 50%; margin-left: -175px;font-size: 13px;");
    modalDialogParentDiv.setAttribute("class", "nH Hd");

    var modalDialogSiblingDiv = document.createElement("div");
    modalDialogSiblingDiv.setAttribute("style", "");

    var modalDialogTextDiv = document.createElement("div");
    modalDialogTextDiv.setAttribute("style", "text-align:center;");

    var modalDialogTextSpan = document.createElement("span");
    modalDialogTextSpan.setAttribute("style", "display: inline-block;");

    var modalDialogTextSpan2 = document.createElement("span");
    modalDialogTextSpan2.setAttribute("unselectable", "on");
    modalDialogTextSpan2.setAttribute("class", "Ha");
    modalDialogTextSpan2.onselectstart = function() {
        return false;
    };
    modalDialogTextSpan2.onmousedown = function() {
        return false;
    };
    modalDialogTextSpan2.onmousemove = function() {
        return false;
    };
    modalDialogTextSpan2.onmouseup = function() {
        return false;
    };
    modalDialogTextSpan2.oncontextmenu = function() {
        return false;
    };
    modalDialogTextSpan2.onselect = function() {
        return false;
    };
    modalDialogTextSpan2.setAttribute("style", "margin-top: -4px; float: right; display: inline-block; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none; cursor: pointer;");
    modalDialogTextSpan2.onclick = function() {
        replaceSelectionMark("", true);
        removeDialogMessageUserBox();
        return false;
    };
    modalDialogTextSpan2.innerHTML = "";

    var modalDialogText = document.createElement("span");
    modalDialogText.setAttribute("unselectable", "on");
    modalDialogText.setAttribute("id", "dialogText");
    modalDialogText.onselectstart = function() {
        return false;
    };
    modalDialogText.onmousedown = function() {
        return false;
    };
    modalDialogText.onmousemove = function() {
        return false;
    };
    modalDialogText.onmouseup = function() {
        return false;
    };
    modalDialogText.oncontextmenu = function() {
        return false;
    };
    modalDialogText.onselect = function() {
        return false;
    };
    modalDialogText.onclick = function() {
        return false;
    };
    modalDialogText.setAttribute("style", "-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none; pointerEvents:none; color:#ffffff;");
    modalDialogText.innerHTML = text;

    var modalDialogInputText = document.createElement("textarea");
    modalDialogInputText.setAttribute("id", "textBoxQlink");
    modalDialogInputText.setAttribute("style", "border: none;outline: none;-webkit-box-shadow: none;-moz-box-shadow: none;box-shadow: none;color: rgb(152, 152, 152); margin: 0px; width: 327px; height: 123px;margin-top: 8px;border: none;border-radius: 2px;padding: 10px;");

    var modalFooterDiv = document.createElement("div");
    modalFooterDiv.setAttribute("class", "aDh");
    modalFooterDiv.setAttribute("style", "margin-bottom: -16px;border-top: 1px solid #cfcfcf;");

    var modalDialogButton = document.createElement("div");
    modalDialogButton.setAttribute("class", "T-I J-J5-Ji aoO T-I-atl L3");
    modalDialogButton.setAttribute("style", "float: left;margin-left: 4px;");
    modalDialogButton.setAttribute("tabindex", "0");
    modalDialogButton.onkeypress = function(e) {
        if (e.keyCode == 13) {
            sendText();
            removeDialogMessageUserBox();
        }
    };
    modalDialogButton.onclick = function() {
        sendText();
        removeDialogMessageUserBox();
    };
    modalDialogButton.innerHTML = "Qlink it";

    var breakElement = document.createElement("br");

    var modalHeaderDiv = document.createElement("div");
    modalHeaderDiv.setAttribute("style", "background: #404040; margin: 0px;padding: 8px;height: 19px;text-align: left; ");

    modalDialogTextSpan.appendChild(modalDialogText);
    modalHeaderDiv.appendChild(modalDialogTextSpan);
    modalHeaderDiv.appendChild(modalDialogTextSpan2);
    modalDialogTextDiv.appendChild(modalHeaderDiv);

    modalDialogTextDiv.appendChild(modalDialogInputText);
    modalFooterDiv.appendChild(modalDialogButton);
    modalDialogTextDiv.appendChild(modalFooterDiv);

    modalDialogTextDiv.appendChild(breakElement);

    modalDialogSiblingDiv.appendChild(modalDialogTextDiv);
    modalDialogParentDiv.appendChild(modalDialogSiblingDiv);

    document.body.appendChild(wrapperDiv);
    document.body.appendChild(modalDialogParentDiv);

    $('#textBoxQlink').focus();
}

function sendText() {
    var textQl = $('#textBoxQlink').val();
    chrome.extension.sendRequest({
        'message': 'setTextql',
        'data': textQl,
        'context': window.location.protocol + "//" + window.location.host + "/*"
    }, function(response) {});
}

function removeMessageBox() {

    replaceSelectionMark("", true);
    canceled = false;
    generating = false;
    if (wrapperDiv != null) {
        typer = "";
        document.body.removeChild(wrapperDiv);
        document.body.removeChild(modalDialogParentDiv);
    }
}

function removeMessageUserBox() {

    replaceSelectionMark("", true);
    generating = false;
    canceled = true;
    typer = "";
    document.body.removeChild(wrapperDiv);
    document.body.removeChild(modalDialogParentDiv);
    wrapperDiv = null;
    modalDialogParentDiv = null;
}

function removeDialogMessageUserBox() {
    document.removeEventListener('keyup', e1);

    document.body.removeChild(wrapperDiv);
    document.body.removeChild(modalDialogParentDiv);
    wrapperDiv = null;
    modalDialogParentDiv = null;
}

var canceled = false;
document.addEventListener('mouseup', function(event) {
    if (generating == true) {
        event.stopPropagation();
        event.preventDefault();
        event.cancelBubble = true;
        event.returnValue = false;
        return false;
    } else {
        ztext = window.getSelection().toString();
    }

    var sel = ztext;

    chrome.extension.sendRequest({
        'message': 'setWin',
        'data': sel,
        'context': window.location.protocol + "//" + window.location.host + "/*"
    }, function(response) {});

    if (typer == "C")
        return;

    if (sel.length) {
        typer = "M";

        chrome.extension.sendRequest({
            'message': 'setText',
            'data': sel,
            'context': window.location.protocol + "//" + window.location.host + "/*"
        }, function(response) {
            generating = false;
            if (canceled) {
                removeMessageBox();
                typer = "";
                return;
            }

            if (response.data == false) {
                typer = "";
                changeDialogText("error"); 
                return;
            }

            rangy.restoreSelection(savedSel);
            replaceSelection("<a href='" + response.data + "' style='padding: 1px;text-decoration: blink;'><img style='width: 16px;vertical-align: middle;' src='" + iconURL + "'>qlinkedContent</a>", true);

            typer = "";
            removeMessageBox();
        });
    } else {
        typer = "";
    }
});

document.addEventListener('contextmenu', function(event) {
    if (generating == true) {
        event.stopPropagation();
        event.preventDefault();
        event.cancelBubble = true;
        event.returnValue = false;
        return false;
    } else {
        ztext = window.getSelection().toString();
    }

    var sel = ztext;

    chrome.extension.sendRequest({
        'message': 'setWin',
        'data': sel,
        'context': window.location.protocol + "//" + window.location.host + "/*"
    }, function(response) {});


    typer = "C";
    chrome.extension.sendRequest({
        'message': 'setTextNw',
        'data': sel,
        'context': window.location.protocol + "//" + window.location.host + "/*"
    }, function(response) {
        generating = false;
        if (canceled) {
            removeMessageBox();
            typer = "";
            return;
        }

        if (response.data == false) {
            typer = "";
            changeDialogText("error");
            return;
        }

        var sel = ztext;

        rangy.restoreSelection(savedSel);
        replaceSelection("<a href='" + response.data + "' style='padding: 1px;text-decoration: blink;'><img style='width: 16px;vertical-align: middle;' src='" + iconURL + "'>qlinkedContent</a>", true);

        typer = "";
        removeMessageBox();
    });


});

function replaceSelectionMark(html, selectInserted) {
    var editableTextBox = $("div[role='textbox']");
    if ( editableTextBox.length > 0 ) {
        var htmlContent = editableTextBox[0].innerHTML;
        htmlContent = htmlContent.replace(/<div style="display:none">qlmark<\/div>/g, html);

        editableTextBox[0].innerHTML = htmlContent;
        editableTextBox[0].focus();
    }
}

function replaceSelection(html, selectInserted) {
    var sel, range, fragment;

    if (typeof window.getSelection != "undefined") {
        sel = window.getSelection();

        if (sel.getRangeAt && sel.rangeCount) {
            range = window.getSelection().getRangeAt(0);
            range.deleteContents();

            if (range.createContextualFragment) {
                fragment = range.createContextualFragment(html);
            } else {
                var div = document.createElement("div"),
                child;
                div.innerHTML = html;
                fragment = document.createDocumentFragment();
                while ((child = div.firstChild)) {
                    fragment.appendChild(child);
                }
            }
            var firstInsertedNode = fragment.firstChild;
            var lastInsertedNode = fragment.lastChild;
            range.insertNode(fragment);
            if (selectInserted) {
                if (firstInsertedNode) {
                    range.setStartBefore(firstInsertedNode);
                    range.setEndAfter(lastInsertedNode);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        range = document.selection.createRange();
        range.pasteHTML(html);
    }

}

function getFirstIdElement(node) {
    var el = $('#\\' + node.parentElement.id);
    if (node.parentElement.id == "") {
        el = getFirstIdElement(node.parentElement);
    }
    return el;
}

var generating = false;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "wait") {
        if (request.type != "open") {
            var editableTextBox = $("div[role='textbox']");
            savedSel = rangy.saveSelection();
            createMessageBox();
        } else {
            var editableTextBox = $("div[role='textbox']");
            savedSel = rangy.saveSelection();
            createDialogMessageBox();
        }
        chrome.extension.sendRequest({
            'message': 'waitOK',
            'type': request.type
        }, function(response) {});
    }

    if (request.action == "help") {
        if (request.type == "open") {
            createDialogHelpMessageBox();
        } 
    }
})

chrome.extension.sendRequest({
    'message': 'generateContext',
    data: window.location.protocol + "//" + window.location.host + "/*"
}, function(response) {

});