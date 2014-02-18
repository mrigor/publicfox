var dlwatch = {
  id: "{9AA46F4F-4DC7-4c06-97AF-6665170634FE}",

  get: function(id){
    return document.getElementById(id);
  },

  getService: function(aCID, aIID) {
    return Components.classes["@mozilla.org/"+aCID]
    .getService(Components.interfaces[aIID]);
  },

  getPrefs: function(){
    return dlwatch.getService('preferences-service;1', 'nsIPrefService')
    .getBranch("extensions.dlwatch.");
  },

  savePrefs: function(){
    dlwatch.getService('preferences-service;1', 'nsIPrefService')
    .savePrefFile(null);
  },

  getPrompt: function(){
    return dlwatch.getService('embedcomp/prompt-service;1', 'nsIPromptService');
  },
  getStr: function(msg){
    return dlwatch.stringBundle.GetStringFromName(msg);
  },

  log: function(msg){
    return;
    var acs = dlwatch.getService('consoleservice;1', 'nsIConsoleService');
    acs.logStringMessage(msg);
  }
};
var dlwatchPref = dlwatch.getPrefs();

dlwatch['stringBundle'] = dlwatch.getService('intl/stringbundle;1', 'nsIStringBundleService')
.createBundle("chrome://dlwatch/locale/strings.properties");


dlwatch['showHideMenus'] = function(){
  // hide menues if necessary
  var hideBookmarks = dlwatchPref.getBoolPref("hideBookmarksMenu");
  dlwatch.get('bookmarksMenuPopup').parentNode.hidden = hideBookmarks;
  dlwatch.get('personal-bookmarks').parentNode.hidden = hideBookmarks;
  dlwatch.get('history-menu').hidden =
    dlwatchPref.getBoolPref("hideHistoryMenu");
  dlwatch.get('helpSafeMode').hidden =
    dlwatchPref.getBoolPref("hideSafeMode");
};
// enumerate browser/mail windows, calling f() on each of them
dlwatch['enumerateEditableWindows'] = function(f) {
  var wm = dlwatch.getService("appshell/window-mediator;1", "nsIWindowMediator");
  var windows = wm.getEnumerator("");
  while(windows.hasMoreElements()) {
    var w = windows.getNext();
    if("dlwatch" in w)
      if(!f(w)) break;
  }
};
dlwatch['getRecentWindowForType'] = function() {
  var recentWindow = null;
  dlwatch.enumerateEditableWindows(function(w) {
    recentWindow = w;
    return false;
  });

  //if(!recentWindow) {
  //  alert(dlwatch.getString("needAppWindow"));
  //}
  return recentWindow;
};

dlwatch['authenticate'] = function(showAlert){
  var prompts = dlwatch.getPrompt();
  var input = {value:""};
  var check = {value:false};
  var okorcancel = prompts.promptPassword(null, 'Public Fox '+dlwatch.getStr('authentication'),
    dlwatch.getStr('enterPassword'), input, null, check
  );

  //return input.value;
  //return check.value;
  //return okorcancel;

  dlwatch.log("in:"+hex_md5(input.value)+" stored:"+dlwatchPref.getCharPref("pass"));
  if( okorcancel && hex_md5(input.value)  == dlwatchPref.getCharPref("pass") || dlwatchPref.getCharPref("pass")==""){
    return true;
  }
  if( showAlert ){
    alert(dlwatch.getStr('wrongPassword'));
  }
  return false;
}


dlwatch['authenticate_url'] = function(url){
  if( dlwatchPref.getBoolPref("authopen") == true ){
    dlwatch.log('auth opened');
    dlwatch.log(dlwatchPref.getBoolPref('authlastreturn'));
    return dlwatchPref.getBoolPref('authlastreturn');
  }

  dlwatchPref.setBoolPref("authopen", true);

  //promptPassword
  var prompts = dlwatch.getPrompt();
  var input = {value:""};
  var check = {value:false};
  var okorcancel = prompts.promptPassword(
    null,
    'Public Fox '+dlwatch.getStr('authentication'),
    url+dlwatch.getStr('urlFoundOnBlockedList'),
    input, null, check
  );

  if( okorcancel && hex_md5(input.value)  == dlwatchPref.getCharPref("pass") || dlwatchPref.getCharPref("pass")=="") {
    setTimeout(function(){dlwatchPref.setBoolPref('authopen', false);}, 1000);
    dlwatchPref.setBoolPref('authlastreturn',true);
    return true;
  }else{
    setTimeout(function(){
        dlwatchPref.setBoolPref('authopen',false);
    }, 1000);
    dlwatchPref.setBoolPref('authlastreturn',false);
    alert(dlwatch.getStr('wrongPassword'));
    return false;
  }
}

dlwatch['authenticate_url2'] = function(url){
  if(!dlwatchPref.prefHasUserValue("authopen") || dlwatchPref.getBoolPref("authopen") == false){
    dlwatchPref.setBoolPref("authopen",true);
    var params = {
      inn:{
        name:"Public Fox"+dlwatch.getStr('authentication'),
        description:dlwatch.getStr('loginPage'),
        enabled:true
      },
      out:null
    };
    window.openDialog("chrome://dlwatch/chrome/login.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();
  }
};
dlwatch['convert2RegExp'] = function(pattern){
// This script converts patterns to regexps.
  var res = "";
  if (/^\/.*\/$/.test(pattern)){  // pattern is a regexp already
    res = pattern.substr(1, pattern.length - 2);
  }else {
    res = pattern.replace(/\*+/g, "*")
    .replace(/(\W)/g, "\\$1")
    .replace(/\\\*/g, ".*")
    .replace(/^\\\|/, "^")
    .replace(/\\\|$/, "$");
  }
  try {
    return new RegExp('^' + res, "i");
  } catch(error) {
    return false;
  }
};

dlwatch['checkVersion'] = function(){
  var showAbout = false,
      currVersion = 'none',
      oldVersion = 'none';
  var pref = dlwatch.getPrefs();
  try {
    oldVersion = pref.getCharPref("currVersion");
  } catch (e) {}

  function displayReleaseNotes(){
    if(oldVersion != currVersion && currVersion != "none") {
      window.setTimeout(function() {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
        var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
        var win = wmed.getMostRecentWindow("navigator:browser");

        var content = win.document.getElementById("content");
        content.selectedTab = content.addTab('chrome://dlwatch/content/releaseNotes.html');
      }, 1300);

      pref.setCharPref("currVersion", currVersion);

    }
  }
  try {
    // Firefox <= 3.6
    var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(
      Components.interfaces.nsIExtensionManager);
    currVersion = gExtensionManager.getItemForID(dlwatch.id).version;
  } catch(e) {
    // Firefox >=4.0
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.getAddonByID(dlwatch.id, function(addon) {
      currVersion = addon.version;
    });
  }
  displayReleaseNotes();
};
