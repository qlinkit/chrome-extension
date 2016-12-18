/**
 * MIT License
 * Copyright (c) 2016 Lucas Mingarro, Ezequiel Alvarez, César Miquel, Ricardo Bianchi, Sebastián Manusovich
 * https://opensource.org/licenses/MIT
 *
 * @author Ricardo Bianchi <rbianchi@qlink.it>
 */

"use strict";

document.forms[0].onsubmit = function(e) {
    e.preventDefault(); 
    var text = document.getElementById('textql').value;
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        bgWindow.setTextql(text);
        window.close(); 
    });
};

var text = chrome.i18n.getMessage("textql");
document.getElementById("textql").setAttribute("placeholder", text);

document.getElementById("textql").focus();