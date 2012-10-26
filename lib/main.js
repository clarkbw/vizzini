const widgets = require("widget"),
      tabs = require("windows").browserWindows.activeWindow.tabs,
      prefs = require("preferences-service");

const ID = exports.ID = "go-back-to-the-beginning";

exports.main = function (options, callbacks) {
  var widget = widgets.Widget({
    id: ID,
    label: "Reset Your Tabs",
    contentURL: "http://www.mozilla.org/favicon.ico",
    onClick: function() {
      for each (var [i,tab] in Iterator(tabs)) {
        // close every tab but the first one
        if (i !== 0) {
          tab.close();
        }
      }
      for each (var [i,url] in Iterator(prefs.get("browser.startup.homepage").split("|"))) {
        // reuse the first tab
        if (i === 0) {
          tabs.activeTab.url = url;
        // open new tabs for all other urls
        } else {
          tabs.open({ url: url, inBackground: true });
        }
      }
    }
  });
}

