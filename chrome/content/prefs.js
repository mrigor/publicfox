var dlwatchPref = dlwatch.getPrefs();

var lock = dlwatchPref.getBoolPref("optionslock");

function dlwatch_prefs_init(){
  if(lock){
    if(!dlwatch_authenticate()){
      window.close();
    }
  }
}
window.addEventListener("load",dlwatch_prefs_init,false);
