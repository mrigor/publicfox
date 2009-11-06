var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("sanitizeLock")) dlwatchPref.setBoolPref("sanitizeLock",false);

var lock = dlwatchPref.getBoolPref("sanitizeLock");

function dlwatch_bookmarkSidebar_init(){
  if(lock){
    if(!dlwatch_authenticate()){
      window.close();
    }
  }
}

window.addEventListener("load",dlwatch_bookmarkSidebar_init,false);
