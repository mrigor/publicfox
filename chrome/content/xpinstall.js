var dlwatchPref = dlwatch.getPrefs();

var lock = dlwatchPref.getBoolPref("addonslock") || false;

function dlwatch_xpinstall_init(){
  if(lock){
    if(!dlwatch_authenticate(false)){
      window.close();
    }
  }
}

window.addEventListener("load", dlwatch_xpinstall_init, false);
