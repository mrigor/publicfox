var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("addonslock")){
  dlwatchPref.setBoolPref("addonslock",false);
}
var lock = dlwatchPref.getBoolPref("addonslock");

function dlwatch_addons_init(){
  if(lock){
    if(!dlwatch.authenticate()){
      window.close();
    }
  }
}

window.addEventListener("load",dlwatch_addons_init,false);
