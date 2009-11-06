var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("bookmarkSidebarLock")) dlwatchPref.setBoolPref("bookmarkSidebarLock",false);

var lock = dlwatchPref.getBoolPref("bookmarkSidebarLock");

function dlwatch_bookmarkSidebar_init(){
  if(lock){
    if(!dlwatch_authenticate()){
      top.toggleSidebar('viewBookmarksSidebar');
    }
  }
}

window.addEventListener("load",dlwatch_bookmarkSidebar_init,false);
