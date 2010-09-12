var pref = dlwatch.getPrefs();

function dlwatch_initializeOptions() {
  var allLocks = [
    'lock',
    'aboutconfiglock',
    'addonslock',
    'optionslock',
    'addbookmarklock',
    'bookmarkSidebarLock',
    'customizeToolbarLock',
    'sanitizeLock',
    'historylock',
    'blocklinks'];

  for(var ii= 0, len = allLocks.length; ii< len; ii++){
    if (!pref.prefHasUserValue( allLocks[ii] )){
      pref.setBoolPref(allLocks[ii], false);
    }
    var el = document.getElementById( allLocks[ii] );
    el.checked = pref.getBoolPref( allLocks[ii] );
  }

  if (!pref.prefHasUserValue("ext")) pref.setCharPref("ext", "exe,bat");
  this.ext = PF.get("badext");
  this.ext.value = pref.getCharPref("ext");

  if(!pref.prefHasUserValue("pass")) pref.setCharPref("pass","");
  this.pass = PF.get("pass");
  this.pass2 = PF.get("pass2");
  this.pass.value = this.pass2.value = pref.getCharPref("pass");
}

function dlwatch_saveOptions(){
  var p1 = PF.get("pass");
  var p2 = PF.get("pass2");
  if(p1.value != p2.value){
    alert("Passwords don't match.");
    return false;
  }

  this.pass = PF.get("pass").value;
  if(this.pass != pref.getCharPref("pass"))
    pref.setCharPref("pass",hex_md5(this.pass));

  this.lock = PF.get("lock").checked;
  pref.setBoolPref("lock", this.lock);

  var allLocks = [
    'aboutconfiglock',
    'addonslock',
    'addbookmarklock',
    'bookmarkSidebarLock',
    'customizeToolbarLock',
    'sanitizeLock',
    'historylock',
    'optionslock',
    'blocklinks'
    ];

  for(var ii = 0, len = allLocks.length; ii < len; ii++){
    var checked = document.getElementById( allLocks[ii] ).checked;
    pref.setBoolPref(allLocks[ii], checked);
  }

  this.badext = document.getElementById("badext").value;
  pref.setCharPref("ext", this.badext);

  if(this.pass== "" && this.lock){
    alert(dlwatch.getStr('enterPasswordBeforeLocking'));
    return false;
  }
  dlwatch.savePrefs();
}

function imtranslatorHomePage(){
  var url = "http://www.github.com/mrigor";
  var windowService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var currentWindow = windowService.getMostRecentWindow("navigator:browser");

  if(currentWindow){
    try{
      currentWindow.delayedOpenTab(url);
    }catch(e){
      currentWindow.loadURI(url);
    }
  }else{
    window.open(url);
  }
}
