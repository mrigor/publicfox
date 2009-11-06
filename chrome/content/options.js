var dlwatchPref = dlwatch.getPrefs();

function dlwatch_initializeOptions() {
  var allLocks = [
    'lock',
    'aboutconfiglock',
    'addonslock',
    'optionslock',
    'addbookmarklock',
    'bookmarkSidebarLock',
    'sanitizeLock',
    'historylock',
    'blocklinks' ];

  for(var ii= 0, len = allLocks.length; ii< len; ii++){
    if (!dlwatchPref.prefHasUserValue( allLocks[ii] )){
      dlwatchPref.setBoolPref( allLocks[ii] ,false);
    }
    var el = document.getElementById( allLocks[ii] );
    el.checked = dlwatchPref.getBoolPref( allLocks[ii] );
  }

  if (!dlwatchPref.prefHasUserValue("ext")) dlwatchPref.setCharPref("ext","exe,bat");
  this.ext = document.getElementById("badext");
  this.ext.value = dlwatchPref.getCharPref("ext");

  if(!dlwatchPref.prefHasUserValue("pass")) dlwatchPref.setCharPref("pass","");
  this.pass = document.getElementById("pass");
  this.pass2 = document.getElementById("pass2");
  this.pass.value = this.pass2.value = dlwatchPref.getCharPref("pass");
}

function dlwatch_saveOptions() {
  var p1 = document.getElementById("pass");
  var p2 = document.getElementById("pass2");
  if(p1.value != p2.value){
    alert("Passwords don't match.");
    return false;
  }

  this.pass = document.getElementById("pass").value;
  if(this.pass != dlwatchPref.getCharPref("pass"))
    dlwatchPref.setCharPref("pass",hex_md5(this.pass));

  this.lock = document.getElementById("lock").checked;
  dlwatchPref.setBoolPref("lock",this.lock);

  var allLocks = [
    'aboutconfiglock',
    'addonslock',
    'addbookmarklock',
    'bookmarkSidebarLock',
    'sanitizeLock',
    'historylock',
    'optionslock',
    'blocklinks' ];

  for(var ii= 0, len= allLocks.length; ii< len; ii++){
    var checked = document.getElementById( allLocks[ii] ).checked;
    dlwatchPref.setBoolPref(allLocks[ii],checked);
  }

  this.badext = document.getElementById("badext").value;
  dlwatchPref.setCharPref("ext",this.badext);

  if(this.pass== "" && this.lock){
    alert(dlwatch.getStr('enterPasswordBeforeLocking'));
    return false;
  }

  dlwatch.savePrefs();
}

function imtranslatorHomePage()
{
  var url = "http://www.userreply.com";
  var windowService = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var currentWindow = windowService.getMostRecentWindow("navigator:browser");

  if(currentWindow)
  {
    try {
      currentWindow.delayedOpenTab(url);
    } catch(e) {
      currentWindow.loadURI(url);
    }
  }
  else
    window.open(url);

}
