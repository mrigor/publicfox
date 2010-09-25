var dlwatch = {
  get: function(id){
    return document.getElementById(id);
  },

  getPrefs: function(){
    return Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.dlwatch.");

  },

  savePrefs: function(){
    Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefService).savePrefFile(null);
  },

  getPrompt: function(){
    return Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService);
  },

  stringBundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
  .getService(Components.interfaces.nsIStringBundleService)
  .createBundle("chrome://dlwatch/locale/strings.properties"),

  getStr: function(msg){
    return this.stringBundle.GetStringFromName(msg);
  },
};
var PF = dlwatch;
var dlwatchPref = dlwatch.getPrefs();
var pref = dlwatchPref;

function d(msg){
  return;
  var acs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces["nsIConsoleService"]);
  acs.logStringMessage(msg);
}
function dlwatch_authenticate(showAlert){
  var prompts = dlwatch.getPrompt();
  input = {value:""};
  check = {value:false};
  okorcancel = prompts.promptPassword(null, 'Public Fox '+dlwatch.getStr('authentication'),
    dlwatch.getStr('enterPassword'), input, null, check
  );

  //return input.value;
  //return check.value;
  //return okorcancel;

  d("in:"+hex_md5(input.value)+" stored:"+pref.getCharPref("pass"));
  if( okorcancel && hex_md5(input.value)  == pref.getCharPref("pass") || pref.getCharPref("pass")==""){
    return true;
  }
  if( showAlert ){
    alert(dlwatch.getStr('wrongPassword'));
  }
  return false;
}


function dlwatch_authenticate_url(url){
  if( pref.getBoolPref("authopen") == true ){
    d('auth opened');
    d(pref.getBoolPref('authlastreturn'));
    return pref.getBoolPref('authlastreturn');
  }

  pref.setBoolPref("authopen", true);

  //promptPassword
  var prompts = dlwatch.getPrompt();
  input = {value:""};
  check = {value:false};
  okorcancel = prompts.promptPassword(
    null,
    'Public Fox '+dlwatch.getStr('authentication'),
    url+dlwatch.getStr('urlFoundOnBlockedList'),
    input, null, check
  );

  if( okorcancel && hex_md5(input.value)  == pref.getCharPref("pass") || pref.getCharPref("pass")=="") {
    setTimeout(function(){pref.setBoolPref('authopen', false);}, 1000);
    pref.setBoolPref('authlastreturn',true);
    return true;
  }else{
    setTimeout(function(){
        pref.setBoolPref('authopen',false);
    }, 1000);
    pref.setBoolPref('authlastreturn',false);
    alert(dlwatch.getStr('wrongPassword'));
    return false;
  }
}

function dlwatch_authenticate_url2(url){
  if(!pref.prefHasUserValue("authopen") || pref.getBoolPref("authopen") == false){
    pref.setBoolPref("authopen",true);
    var params = {
      inn:{
        name:"Public Fox"+dlwatch.getStr('authentication'),
        description:dlwatch.getStr('loginPage'),
        enabled:true
      },
      out:null
    };
    window.openDialog("chrome://dlwatch/chrome/login.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();
  }
}


