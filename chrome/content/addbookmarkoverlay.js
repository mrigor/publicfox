var dlwatchPref = dlwatch.getPrefs();

var lock = dlwatchPref.getBoolPref("addbookmarklock");

function dlwatch_addbookmark_init(){
  if(lock){
    if(!dlwatch_authenticate()){
      window.close();
    }
  }
}

window.addEventListener("load", dlwatch_addbookmark_init,false);
