
var siteCSS = {"login.ugent.be" : "login.css", "elosp.ugent.be": "elosp.css", "ufora.ugent.be": "ufora.css"};
var sites = ["://login.ugent.be/", "://elosp.ugent.be/", "://ufora.ugent.be/"];


function siteToCSS (site) {
    var subSite = site.replace(/http[s]{0,1}:\/\/([^\/]*)\/.*$/, "$1");
    return siteCSS[subSite];
}

function darkSite(site) {
    return site.replace(/http[s]{0,1}:\/\/([^\/]*)\/.*$/, "$1") in siteCSS;
}

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "update") {
        if (details.previousVersion === "0.1") {
            chrome.storage.sync.remove("state");
        }
    }

    // Als waardes niet bestaan: aanmaken
    chrome.storage.sync.get({   
        "colors":{"accent":"#0077ff","accent2":"#00ccff","background":"#000000","link":"#00bbff","linkvisited":"#1279d3","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#0084ff","widgetbackground":"#202020"},
        "colors1":{"accent":"#37ff00","accent2":"#2f9e00","background":"#000000","link":"#44ff00","linkvisited":"#17bb02","selected":"#353535","text":"#eeeeee","textaccent":"#000000","title":"#44ff00","widgetbackground":"#202020"},
        "colors2":{"accent":"#ffa726","accent2":"#c77800","background":"#000000","link":"#ffd95d","linkvisited":"#c77800","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#ffa726","widgetbackground":"#333333"},
        "colors3":{"accent":"#ff0000","accent2":"#ffae00","background":"#000000","link":"#ff6600","linkvisited":"#b92804","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#ff0000","widgetbackground":"#202020"},
        "colors4":{"accent":"#ff00dd","accent2":"#ff0088","background":"#000000","link":"#fb00ff","linkvisited":"#b60295","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#ff00dd","widgetbackground":"#202020"},
        "presetNum": 0,
        "settings":{"removeWhite":true,
                    "state":true,
                    "darkTest":false,
                    "logo": "white"},
        "sites":   {"login":true}
        }, function(data) {
            chrome.storage.sync.set(data, function() {
        });
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (darkSite(tab.url)) {
        addCSS(tab);
    }
});

// Storage listener
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.sites) {
        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){
                    var css = siteToCSS(tab.url);
                    if (css && css === "elosp.css") { // Inlogsite
                        if (changes.sites.newValue.login) {
                            addCSS(tab);
                        } else {
                            deleteCSS(tab);
                        }
                    }
                });
            });
        });
    } else if (changes.settings) {      
        removeAllCSS();
        if (changes.settings.newValue.state) {
            addAllCSS();
        }
    } else {
        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){
                    if (darkSite(tab.url)) {
                        cssScript(tab);
                    }
                });
            });
        });
    }
});

function addAllCSS() {
    chrome.storage.sync.get(["settings", "sites"], function(result){
        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach(function(window){
                window.tabs.forEach(function(tab){
                    var css = siteToCSS(tab.url);
                    if (css && (result.sites.login || css === "ufora.css")) {
                        addCSS(tab);
                    }
                });
            });
        });
    });
}

// Verwijder de toegevoegde .css voor alle tabs
function removeAllCSS() {
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach(function(window){
            window.tabs.forEach(function(tab){
                if (darkSite(tab.url)) {
                    deleteCSS(tab);
                }
            });
        });
    });
}

// Voeg gegeven css file toe aan de gegeven tab
function addCSS(tab) {
    var cssFile = siteToCSS(tab.url);
    chrome.storage.sync.get("settings", function(result) {
        if (result.settings.state) {
            if ((! result.settings.darkTest) &&  tab.url.includes("ufora.ugent.be/d2l/lms/quizzing/user/attempt")) {
                return;
            } else {
                chrome.tabs.insertCSS(tab.id, { file: "css/" + cssFile}, function(){chrome.runtime.lastError;});
                cssScript(tab);
            }
        }
    });
}

// Verwijder gegeven css file van gegeven tab
function deleteCSS(tab) {
    chrome.tabs.removeCSS(tab.id, { file: "css/" + siteToCSS(tab.url)},  function(){chrome.runtime.lastError;});
}

function cssScript(tab) {
    chrome.storage.sync.get("presetNum", function(result) {
        var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
        chrome.storage.sync.get(preset, function(result) {
            var colors = result[preset];
            if (tab.url.includes("ufora.ugent.be")) {
                chrome.tabs.executeScript(tab.id, {
                    file : "ufora.js"
                }, function(){chrome.runtime.lastError;});
            }
    
            var command = "var r = document.querySelector(':root'); "; 
            command += "r.style.setProperty('--background','" + colors.background + "');";
            command += "r.style.setProperty('--widget-background','" + colors.widgetbackground + "');";
            command += "r.style.setProperty('--selected','" + colors.selected + "');";
            command += "r.style.setProperty('--accent','" + colors.accent + "');";
            command += "r.style.setProperty('--accent2','" + colors.accent2 + "');";
            command += "r.style.setProperty('--text-accent','" + colors.textaccent + "');";
            command += "r.style.setProperty('--text','" + colors.text + "');";
            command += "r.style.setProperty('--text-title','" + colors.title + "');";
            command += "r.style.setProperty('--text-link','" + colors.link + "');";
            command += "r.style.setProperty('--text-link-visited','" + colors.linkvisited + "');";
            chrome.tabs.executeScript(tab.id, {
                code: command
            }, function(){chrome.runtime.lastError;});
        }); 
    });    
}
