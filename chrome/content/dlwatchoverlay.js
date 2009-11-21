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

function dlwatch_enable_addons(){
  var auth=false;
  if(!dlwatch_authenticate()){
    return;
  }
  d("enabling");
  if(dlwatch_addonsref){
    dlwatchPref.setBoolPref("lock",false);
    dlwatch_addonsref.hidden = false;
    document.getElementById('dlwatch-menu').hidden = true;
  }
}
function dlwatch_urlcheck(){
  // don't execute in options window
  //if ('undefined'==typeof gBrowser) return;
  //d(content.contentDocument.location.href);
}
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

    content.addEventListener('load',dlwatch_urlcheck,false);
    d("init");

    //for hiding Addons
    // don't execute in options window
    if ('undefined'==typeof gBrowser) return;

    window.removeEventListener("load", dlwatch_init, true);

    // Add pref listener
    var oPref = Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefBranchInternal);
    oPref.addObserver("extensions.dlwatch.lock", dlwatchPrefObserver, false);

    dlwatchPref.QueryInterface(Components.interfaces.nsIPrefBranch2);
    dlwatchPref.addObserver("", dlwatchPrefObserver, false);

    if (!dlwatchPref.prefHasUserValue("lock")){
      dlwatchPref.setBoolPref("lock",true);
    }
    if (!dlwatchPref.prefHasUserValue("addbookmarklock")){
      dlwatchPref.setBoolPref("addbookmarklock",false);
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
  if(location=="about:config" && dlwatch_aboutconfiglock){
    if(!dlwatch_authenticate()) {
      window._content.location = "about:blank";
    }
  }
}
