var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("historylock")) dlwatchPref.setBoolPref("historylock",false);

var lock = dlwatchPref.getBoolPref("historylock");


function dlwatch_addons_init(){
  if(lock){
    if(!dlwatch_authenticate()){
      top.toggleSidebar('viewHistorySidebar');
    }
  }
}

window.addEventListener("load",dlwatch_addons_init,false);
