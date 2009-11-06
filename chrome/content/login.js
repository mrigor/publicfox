function login_doSubmit()
{

  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  var password = prefs.getCharPref("FoxFilter.password");

  if(document.getElementById("textbox-password").value == password)
  {
    window.close();

    var params = {inn:{name:"FoxFilter Preferences", description:"Set filtering preferences", enabled:true}, out:null};       
    window.openDialog("chrome://foxfilter/chrome/settings.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();

  }
  else
  {
    document.getElementById("label-message").value = "Invalid password";
    return false;
  }

}

function login_doCancel()
{ 
  window.close();
  return true;
}
