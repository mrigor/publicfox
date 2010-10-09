function loadLockCheck(pref){
  window.addEventListener("load", function(){
      var prefs = dlwatch.getPrefs();
      if (!prefs.prefHasUserValue(pref)){
        prefs.setBoolPref(pref, false);
      }
      var lock = prefs.getBoolPref(pref);
      if(lock){
        if(!PF.authenticate()){
          window.close();
        }
      }
  }, false);
}
