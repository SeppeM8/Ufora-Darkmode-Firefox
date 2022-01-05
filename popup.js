function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}

localizeHtmlPage();

function checkJson(cjson) {
    try {
        cjson = JSON.parse(cjson);
    } catch (error) {
        return false;
    }


    const keys = ["accent", "accent2", "background", "link", "linkvisited", "selected", "text", "textaccent", "title", "widgetbackground"];
    for (let key of keys) {
        if (!cjson[key]) {
            return false;
        }
        if (! /^#[0-9a-f]{6}$/.test(cjson[key])) {
            return false;
        }
    }
    return true;
}

var enable = document.getElementById("enable");
var enabled;

if (enable) {
    chrome.storage.sync.get("settings", function(result){
        if (result.settings.state) {
            enable.textContent = chrome.i18n.getMessage("popup_disable");
            enabled = true;
        } else {
            enable.textContent = chrome.i18n.getMessage("popup_enable");
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
            enabled = false;
        }
    });

    enable.addEventListener("click", function() {
        chrome.storage.sync.get("settings", function(result) {
            if (enabled) {
                result.settings.state = true;
                enable.textContent = chrome.i18n.getMessage("popup_disable");
            } else {
                result.settings.state = false;
                enable.textContent = chrome.i18n.getMessage("popup_enable");
            }
            chrome.storage.sync.set({"settings": result.settings});
        });  
        enabled = !enabled;      
    });
}

var reset = document.getElementById("reset");

if (reset) {
    reset.addEventListener("click", function () {
        const presets = {
            "colors":{"accent":"#0077ff","accent2":"#00ccff","background":"#000000","link":"#00bbff","linkvisited":"#1279d3","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#0084ff","widgetbackground":"#202020"},
            "colors1":{"accent":"#37ff00","accent2":"#2f9e00","background":"#000000","link":"#44ff00","linkvisited":"#17bb02","selected":"#353535","text":"#eeeeee","textaccent":"#000000","title":"#44ff00","widgetbackground":"#202020"},
            "colors2":{"accent":"#ffa726","accent2":"#c77800","background":"#000000","link":"#ffd95d","linkvisited":"#c77800","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#ffa726","widgetbackground":"#333333"},
            "colors3":{"accent":"#ff0000","accent2":"#ffae00","background":"#000000","link":"#ff6600","linkvisited":"#b92804","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#ff0000","widgetbackground":"#202020"},
            "colors4":{"accent":"#ff00dd","accent2":"#ff0088","background":"#000000","link":"#fb00ff","linkvisited":"#b60295","selected":"#353535","text":"#eeeeee","textaccent":"#ffffff","title":"#ff00dd","widgetbackground":"#202020"}
        };
        chrome.storage.sync.get("presetNum", function(result){
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.set({[preset]: presets[preset]});
        });
    });
}

var presetText = document.getElementById("presetText");

if (presetText) {
    chrome.storage.sync.get("presetNum", function(result){
        presetText.textContent = chrome.i18n.getMessage("popup_preset") + " " + (result.presetNum + 1);
    });
}

var prev = document.getElementById("presetPrev");

if (prev) {
    prev.addEventListener("click", function(e) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = (result.presetNum + 4) % 5;        
            chrome.storage.sync.set({"presetNum": preset});
            presetText.textContent = chrome.i18n.getMessage("popup_preset") + " " + (preset + 1);
        });
    });

}

var next = document.getElementById("presetNext");

if (next) {
    next.addEventListener("click", function(e) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = (result.presetNum + 1) % 5;        
            chrome.storage.sync.set({"presetNum": preset});
            presetText.textContent = chrome.i18n.getMessage("popup_preset") + " " + (preset + 1);
        });
    });
}


var logo = document.getElementById("logo");

if (logo) {
    chrome.storage.sync.get("settings", function(result){
        logo.value = result.settings.logo
    })

    logo.addEventListener("change", function(e) {
        chrome.storage.sync.get("settings", function(result) {
            result.settings.logo=logo.value;
            chrome.storage.sync.set({"settings": result.settings});
        })
    })
}

var login = document.getElementById("login");

if (login) {
    chrome.storage.sync.get("sites", function(result){
        login.checked = result.sites.login;
    });

    login.addEventListener("change", function(e) {
        chrome.storage.sync.get("sites", function(result){
            result.sites.login = login.checked;
            chrome.storage.sync.set({"sites": result.sites});
        });
    })
}

var removeWhite = document.getElementById("removeWhite");

if (removeWhite) {
    chrome.storage.sync.get("settings", function(result){
        removeWhite.checked = result.settings.removeWhite;
    });

    removeWhite.addEventListener("change", function() {
        chrome.storage.sync.get("settings", function(result) {
            if (removeWhite.checked) {
                result.settings.removeWhite = true;
            } else {
                result.settings.removeWhite = false;
            }
            chrome.storage.sync.set({"settings": result.settings});
        });        
    });
}

var darkTest = document.getElementById("darkTest");

if (darkTest) {
    chrome.storage.sync.get("settings", function(result){
        darkTest.checked = result.settings.darkTest;
    });

    darkTest.addEventListener("change", function() {
        chrome.storage.sync.get("settings", function(result) {
            if (darkTest.checked) {
                result.settings.darkTest = true;
            } else {
                result.settings.darkTest = false;
            }
            chrome.storage.sync.set({"settings": result.settings});
        });        
    });
}

// Storage listener
chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.sync.get("settings", function(result){
        if (result.settings.state) {
            document.body.style.backgroundColor = "black";
            document.body.style.color = "white";
        } else {
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
        }
    });
    initColors();
});



// init
function initColors() {
    chrome.storage.sync.get("presetNum", function(result) {
        var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
        chrome.storage.sync.get(preset, function(result) {
            var colors = result[preset];
            cbackground.value = colors.background;
            cwidgetbackground.value = colors.widgetbackground;
            cselected.value = colors.selected;
            caccent.value = colors.accent;
            caccent2.value = colors.accent2;
            ctextaccent.value = colors.textaccent;
            ctext.value = colors.text;
            ctitle.value = colors.title;
            clink.value = colors.link;
            clinkvisited.value = colors.linkvisited;
            cjson.value = JSON.stringify(colors);
        });
    });
}

initColors();

function checkHexColor(color) {
    return /^#[0-9a-f]{6}$/i.test(color)
}


// Listeners
cbackground.addEventListener("change", function() {
    if (checkHexColor(cbackground.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].background = cbackground.value;
                chrome.storage.sync.set({[preset]: result[preset]});
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

cwidgetbackground.addEventListener("change", function() {
    if (checkHexColor(cwidgetbackground.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].widgetbackground = cwidgetbackground.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

cselected.addEventListener("change", function() {    
    if (checkHexColor(cselected.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].selected = cselected.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

caccent.addEventListener("change", function() {
    if (checkHexColor(caccent.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].accent = caccent.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

caccent2.addEventListener("change", function() {
    if (checkHexColor(caccent2.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].accent2 = caccent2.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

ctextaccent.addEventListener("change", function() {
    if (checkHexColor(ctextaccent.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].textaccent = ctextaccent.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

ctext.addEventListener("change", function() {
    if (checkHexColor(ctext.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].text = ctext.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

ctitle.addEventListener("change", function() {
    if (checkHexColor(ctitle.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].title = ctitle.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

clink.addEventListener("change", function() {
    if (checkHexColor(clink.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].link = clink.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

clinkvisited.addEventListener("change", function() {
    if (checkHexColor(clinkvisited.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            chrome.storage.sync.get(preset, function(result) {
                result[preset].linkvisited = clinkvisited.value;
                chrome.storage.sync.set({[preset]: result[preset]});        
                cjson.value = JSON.stringify(result[preset]);
            });
        });
    }
});

cjson.addEventListener("change", function() {
    if (checkHexColor(cbackground.value)) {
        chrome.storage.sync.get("presetNum", function(result) {
            var preset = result.presetNum == 0 ? "colors" : "colors" + result.presetNum;
            if (checkJson(cjson.value)) {
                chrome.storage.sync.set({[preset]: JSON.parse(cjson.value)});
            } else {
                alert(chrome.i18n.getMessage("popup_invalid_json"));        
                chrome.storage.sync.get(preset, function(result) {
                    cjson.value = JSON.stringify(result.colors);
                });
            }
        });
    }
});
