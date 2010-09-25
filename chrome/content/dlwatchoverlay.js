var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("lock")){
  dlwatchPref.setBoolPref("lock",false);
}
if (!dlwatchPref.prefHasUserValue("aboutconfiglock")){
  dlwatchPref.setBoolPref("aboutconfiglock",false);
}

var dlwatch_lock=dlwatchPref.getBoolPref("lock");
var dlwatch_aboutconfiglock = dlwatchPref.getBoolPref("aboutconfiglock");
var dlwatch_addonsref;
var dlwatch_addons_oncommand;

function dlwatch_savelink(){
  var lock = dlwatchPref.getBoolPref("lock");
  var l = gContextMenu.getLinkURL().toLowerCase();

  if(lock){
    var found=false;
    var list = dlwatchPref.getCharPref("ext");

    if(!dlwatchPref.prefHasUserValue("ext")) 
      dlwatchPref.setCharPref("ext","exe,zip,bat,cmd,rar,tar,bin,gz,iso,que");

    if(list == "*" ){
      found = true;
    }else{
      var badExtArr = list.split(",");

      if(badExtArr.length >=1 && badExtArr[0] != "" ) {
        for(var i=0,len=badExtArr.length;i<len;i++){
          if(l.indexOf("."+badExtArr[i].toLowerCase()) >= 0 ){
            found = true;
            break;
          }
        }
      }
    }

    if(found){
      if(!dlwatch_authenticate()){
        return false;
      }
    }

  }
  gContextMenu.saveLink();
}
function dlwatch_init(){
  try{
    d("init");

    //for hiding Addons
    // don't execute in options window
    if ('undefined'==typeof gBrowser) return;

    window.removeEventListener("load", dlwatch_init, true);

    // Add pref listener
    var oPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    oPref.addObserver("extensions.dlwatch.lock", dlwatchPrefObserver, false);

    dlwatchPref.QueryInterface(Components.interfaces.nsIPrefBranch2);
    dlwatchPref.addObserver("", dlwatchPrefObserver, false);

    if (!dlwatchPref.prefHasUserValue("lock")){
      dlwatchPref.setBoolPref("lock", true);
    }
    if (!dlwatchPref.prefHasUserValue("addbookmarklock")){
      dlwatchPref.setBoolPref("addbookmarklock", false);
    }

    if(!dlwatchPref.getBoolPref("lock")){
      dlwatch_lock = false;
    }

    var savelink = document.getElementById("context-savelink");
    savelink.setAttribute('oncommand','dlwatch_savelink()');

  }catch(e){
    alert("dlwatch (200)\nCould not initialize dlwatch extension.\n"+ e);
  }
}
const dlwatchPrefObserver = {
  observe : function(subject, topic, data){ 
    if (topic != "nsPref:changed"){
      return;
    }

    switch(data){
    case "lock":
      if(!dlwatchPref.getBoolPref("lock")){
        dlwatch_lock = true;
      }else{
        var pref = dlwatchPref.getBoolPref("lock");
        d("lock-"+pref);
      }
      break;
    case "aboutconfiglock":
      dlwatch_aboutconfiglock = dlwatchPref.getBoolPref("aboutconfiglock");

    default:
      break;
    }

  }
}
function dlwatch_shutdown(){
  dlwatchPref.removeObserver("", dlwatchPrefObserver);
}

function dlwatch_checkurl(){
  var location = window._content.location.href.toLowerCase();
  d(location);
  if( (location.toLowerCase().indexOf("about:config") != -1 && dlwatch_aboutconfiglock) ||
    (location.toLowerCase().indexOf("about:addons") != -1 && pref.getBoolPref("addonslock")) ||
    (location.toLowerCase().indexOf("chrome://mozapps/content/extensions/extensions.xul") != -1 && pref.getBoolPref('addonslock'))){
    if(!dlwatch_authenticate()) {
      window._content.location = "about:blank";
    }
  }
}
function dlwatch_overwrite_commands(){
  // bookmarks
  (function(){
      var old = PlacesCommandHook.bookmarkPage;
      PlacesCommandHook.bookmarkPage = function(){
        var lock = dlwatchPref.getBoolPref('addbookmarklock');
        if(lock){
          if(!dlwatch_authenticate()){
            return;
          }
        }
        old.apply(this, arguments);
      };
  })();

  // sidebars
  (function(){
      var old = toggleSidebar;
      toggleSidebar = function(id){
        // only if sidebar is open
        if(dlwatch.get(id).getAttribute('checked') != "true"){
          // list of sidebar commands and corresponding pref names
          var ids = {
            'viewBookmarksSidebar': 'bookmarkSidebarLock',
            'viewHistorySidebar': 'historylock'
          };
          if(id in ids){
            var lock = dlwatchPref.getBoolPref(ids[id]);
            if(lock){
              if(!dlwatch_authenticate()){
                return;
              }
            }
          }
        }
        old.apply(this, arguments);
      }
  })();
  // bookmarks toolbar
  (function(){
      var old = setToolbarVisibility;
      setToolbarVisibility = function(toolbar, visible){
        var id = toolbar.id
        // TODO: use new pref for toolbar hiding
        var ids = {
          'PersonalToolbar': 'bookmarkSidebarLock',
        }
        if(visible && id in ids){
          var lock = dlwatchPref.getBoolPref(ids[id]);
          if(lock){
            if(!dlwatch_authenticate()){
              return;
            }
          }
        }
        old.apply(this, arguments);
      };
  })();
  // customize toolbar
  (function(){
      var old = BrowserCustomizeToolbar;
      BrowserCustomizeToolbar = function(){
        var lock = dlwatchPref.getBoolPref('customizeToolbarLock');
        if(lock){
          if(!dlwatch_authenticate()){
            return;
          }
        }
        old.apply(this, arguments);
      }
  })();
}
