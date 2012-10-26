const main = require("main"),
      tabs = require("tabs"),
      self = require("self"),
      windows = require("windows").browserWindows,
      prefs = require("preferences-service"),

      ABOUT_BLANK = "about:blank";

main.main();

exports.test_test_run = function(test) {
  test.pass("Unit test running!");
};

exports.test_id = function(test) {
  test.assert(require("self").id.length > 0);
};

exports.test_multiple_urls = function(test) {
  let URLS = ["http://cnn.com/", "http://npr.org/", "http://nyt.com/"];

  test.waitUntilDone();
  prefs.set("browser.startup.homepage", URLS.join("|"));

  resetWindow();

  tabs.on('ready', function test_multiple_urls_onOpen(tab) {
    test.assert(tabs.activeTab == tabs[0], "first tab is not the activeTab");
    //console.log("tabs.length === URLS.length ", tabs.length + " == " + URLS.length);
    if (tabs.length === URLS.length) {
      tabs.removeListener('ready', test_multiple_urls_onOpen);
      test.done();
    }
  });

  sendClickEvent(test);
}

exports.test_multiple_windows = function(test) {
  let HOMES =         [ABOUT_BLANK, ABOUT_BLANK];
  let BACKGROUNDS =   [ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK];
  let DISTRACTIONS =  [ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK];

  test.waitUntilDone();
  prefs.set("browser.startup.homepage", HOMES.join("|"));

  resetWindow();

  let current = windows.activeWindow;

  for (var d in DISTRACTIONS) {
    current.tabs.open({
        url : DISTRACTIONS[d],
        inBackground : true
      });
  }

  DISTRACTIONS.push(current.tabs.activeTab.url);

  let background = BACKGROUNDS[0];

  windows.open({
    url: background,
    onOpen: function(w) {
      var bgs = BACKGROUNDS.slice(1,BACKGROUNDS.length);
      for (var burl in bgs) {
        w.tabs.open({
            url : BACKGROUNDS[burl],
            inBackground : true
          });
      }
      current.activate();

      tabs.on('ready', function test_multiple_windows_onOpen(tab) {
        //console.log("windows.length == " + windows.length)
        test.assert(windows.length == 2, "There should always be 2 windows open");
        if (windows.activeWindow.tabs.length == HOMES.length) {
          // Close the active window which should be all your homepages
          windows.activeWindow.close();
          //console.log("windows.activeWindow.tabs.length == BACKGROUNDS.length", windows.activeWindow.tabs.length + " == " + BACKGROUNDS.length)
          // Ensure that the background window, now the active window, has the correct number of pages open
          test.assert(windows.activeWindow.tabs.length == BACKGROUNDS.length)
          tabs.removeListener('ready', test_multiple_windows_onOpen);
          test.done();
        }
      });

      sendClickEvent(test);
    }
  })

}

exports.test_single_url = function(test) {
  let URL = "http://clarkbw.net/tmp/";

  console.log("test_single_url");

  test.waitUntilDone();
  prefs.set("browser.startup.homepage", URL);

  resetWindow();

  tabs.on('ready', function test_single_url_onOpen(tab) {
    //console.log("test_single_url : tabs.length === urls.length ", tabs.length + " == " + urls.length);
    if (tabs.length === 1) {
      tabs.removeListener('ready', test_single_url_onOpen);
      test.done();
    }
  });

  sendClickEvent(test);
}


exports.test_closing_multiple_urls = function(test) {
  let URL = "http://clarkbw.net/";
  let blankURLS = [ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK,
                   ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK, ABOUT_BLANK];

  console.log("test_closing_multiple_urls");

  test.waitUntilDone();
  prefs.set("browser.startup.homepage", URL);

  resetWindow();

  let currentTabs = tabs.length;

  for each (var url in blankURLS) {
    tabs.open({ url : url });
  }

  console.log("tabs.length: " + tabs.length);

  test.assert(tabs.length === blankURLS.length + currentTabs, "number of open tabs is off");

  tabs.on('ready', function test_closing_multiple_urls_onOpen(tab) {
    var urls = [URL];
    //console.log("test_closing_multiple_urls : tabs.length === urls.length ", tabs.length + " == " + urls.length);
    if (tab.url == URL && tabs.length === urls.length) {
      tabs.removeListener('ready', test_closing_multiple_urls_onOpen);
      test.done();
    }
  });

  sendClickEvent(test);
}

function resetWindow() {
  for each (var [i,tab] in Iterator(tabs)) {
    // close every tab but the first one
    if (i !== 0) {
      tab.close();
    }
  }
  tabs.activeTab.url = ABOUT_BLANK;
}

function sendClickEvent(test) {
  let doc = require("window-utils").activeBrowserWindow.document;
  let id = "widget:" + self.id + "-" + main.ID;
  let widget = doc.getElementById(id);
  test.assert(widget, "could not find the widget with id " + id);

  // grab the iframe document
  let idoc = widget.firstChild.contentDocument;
  let evt = idoc.createEvent('HTMLEvents');
  evt.initEvent('click', true, true );
  idoc.dispatchEvent(evt);
}
