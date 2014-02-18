var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("lock")){
  dlwatchPref.setBoolPref("lock", false);
}
if (!dlwatchPref.prefHasUserValue("aboutconfiglock")){
  dlwatchPref.setBoolPref("aboutconfiglock", false);
}

var dlwatch_lock=dlwatchPref.getBoolPref("lock");
var dlwatch_aboutconfiglock = dlwatchPref.getBoolPref("aboutconfiglock");
var dlwatch_addonsref;
var dlwatch_addons_oncommand;

dlwatch['savelink'] = function(){
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
      if(!dlwatch.authenticate()){
        return false;
      }
    }
  }
  gContextMenu.saveLink();
};
dlwatch['init'] = function(){
    dlwatch.log("init");

    //for hiding Addons
    // don't execute in options window
    if('undefined'==typeof gBrowser){
      return;
    }

    window.removeEventListener("load", dlwatch.init, true);

    // Add pref listener
    var oPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    oPref.addObserver("extensions.dlwatch.lock", dlwatch.prefObserver, false);

    dlwatchPref.QueryInterface(Components.interfaces.nsIPrefBranch2);
    dlwatchPref.addObserver("", dlwatch.prefObserver, false);

    if(!dlwatchPref.prefHasUserValue("lock")){
      dlwatchPref.setBoolPref("lock", true);
    }
    if(!dlwatchPref.prefHasUserValue("addbookmarklock")){
      dlwatchPref.setBoolPref("addbookmarklock", false);
    }

    if(!dlwatchPref.getBoolPref("lock")){
      dlwatch_lock = false;
    }

    var savelink = document.getElementById("context-savelink");
    savelink.setAttribute('oncommand','dlwatch.savelink()');

    dlwatch.overwrite_commands();

    dlwatch.showHideMenus();
    dlwatch.checkVersion();
  try{
  }catch(e){
    alert("dlwatch (200)\nCould not initialize dlwatch extension.\n"+ e);
  }
};
dlwatch['prefObserver'] = {
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
        dlwatch.log("lock-"+pref);
      }
      break;
    case "aboutconfiglock":
      dlwatch_aboutconfiglock = dlwatchPref.getBoolPref("aboutconfiglock");

    default:
      break;
    }

  }
}
dlwatch['shutdown'] = function(){
  dlwatchPref.removeObserver("", dlwatch.prefObserver);
}

dlwatch['checkurl'] = function(){
  var location = window._content.location.href.toLowerCase();
  dlwatch.log(location);
  if( (location.toLowerCase().indexOf("about:config") != -1 && dlwatch_aboutconfiglock) ||
    (location.toLowerCase().indexOf("about:addons") != -1 && dlwatchPref.getBoolPref("addonslock")) ||
    (location.toLowerCase().indexOf("chrome://mozapps/content/extensions/extensions.xul") != -1 && dlwatchPref.getBoolPref('addonslock'))){
    if(!dlwatch.authenticate()) {
      window._content.location = "about:blank";
    }
  }
}
dlwatch['overwrite_commands'] = function (){
  // bookmarks
  (function(){
      var old = PlacesCommandHook.bookmarkPage;
      PlacesCommandHook.bookmarkPage = function(){
        var lock = dlwatchPref.getBoolPref('addbookmarklock');
        if(lock){
          if(!dlwatch.authenticate()){
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
              if(!dlwatch.authenticate()){
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
      if(typeof setToolbarVisibility != 'undefined'){
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
              if(!dlwatch.authenticate()){
                return;
              }
            }
          }
          old.apply(this, arguments);
        };
      }
  })();
  // customize toolbar
  (function(){
      var old = BrowserCustomizeToolbar;
      BrowserCustomizeToolbar = function(){
        var lock = dlwatchPref.getBoolPref('customizeToolbarLock');
        if(lock){
          if(!dlwatch.authenticate()){
            return;
          }
        }
        old.apply(this, arguments);
      }
  })();
};
