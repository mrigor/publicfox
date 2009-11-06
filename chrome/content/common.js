var dlwatch={
  get:function(id){
    return document.getElementById(id);
  },
  getPrefs:function(){
    return Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.dlwatch.");

  },
  savePrefs:function(){
    Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefService).savePrefFile(null);
  },
  getPrompt:function(){
    return Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService);
  },

  stringBundle:Components.classes["@mozilla.org/intl/stringbundle;1"]
  .getService(Components.interfaces.nsIStringBundleService)
  .createBundle("chrome://dlwatch/locale/strings.properties"),

  getStr:function(msg){
    return this.stringBundle.GetStringFromName(msg);
  }
};

function d(msg){
  return;
  var acs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces["nsIConsoleService"]);
  acs.logStringMessage(msg);
}
function dlwatch_authenticate(showAlert){

  var prompts = dlwatch.getPrompt();
  input = {value:""};
  check = {value:false};
  okorcancel = prompts.promptPassword(null,
    'Public Fox '+dlwatch.getStr('authentication'),
    dlwatch.getStr('enterPassword'),
    input, null, check
  );

  //return input.value;
  //return check.value;
  //return okorcancel;

  d("in:"+hex_md5(input.value)+" stored:"+dlwatchPref.getCharPref("pass"));
  if( okorcancel && hex_md5(input.value)  == dlwatchPref.getCharPref("pass") || dlwatchPref.getCharPref("pass")==""){
    return true;
  }
  if( showAlert ){
    alert(dlwatch.getStr('wrongPassword'));
  }
  return false;
}


function dlwatch_authenticate_url(url){
  if( dlwatchPref.getBoolPref("authopen") == true ){
    d('auth opened');
    d(dlwatchPref.getBoolPref('authlastreturn'));
    return dlwatchPref.getBoolPref('authlastreturn');
  }

  dlwatchPref.setBoolPref("authopen",true);

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

  if( okorcancel && hex_md5(input.value)  == dlwatchPref.getCharPref("pass") || dlwatchPref.getCharPref("pass")=="") {
    setTimeout(function() {dlwatchPref.setBoolPref('authopen', false);}, 1000);
    dlwatchPref.setBoolPref('authlastreturn',true);
    return true;
  }
  else{
    setTimeout(function() {dlwatchPref.setBoolPref('authopen',false);}, 1000);
    dlwatchPref.setBoolPref('authlastreturn',false);
    alert(dlwatch.getStr('wrongPassword'));
    return false;
  }
}

function dlwatch_authenticate_url2(url){
  var dlwatchPref = dlwatch.getPrefs();

  if(!dlwatchPref.prefHasUserValue("authopen") || dlwatchPref.getBoolPref("authopen") == false)
  {
    dlwatchPref.setBoolPref("authopen",true);
    var params = {
      inn:{
        name:"Public Fox"+dlwatch.getStr('authentication'),
        description:dlwatch.getStr('loginPage'),
        enabled:true},
      out:null
    };
    window.openDialog("chrome://dlwatch/chrome/login.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();
  }
}

function login_doSubmit()
{
  var dlwatchPref = dlwatch.getPrefs();

  if(hex_md5(document.getElementById("textbox-password").value) == dlwatchPref.getCharPref("pass") || dlwatchPref.getCharPref("pass")== "")
  {

    //setTimeout(function() {dlwatchPref.setBoolPref("authopen",false);}, 1000);
    dlwatchPref.setBoolPref("authopen",false);
    return true;
    //window.close();
    //var params = {inn:{name:"FoxFilter Preferences", description:"Set filtering preferences", enabled:true}, out:null};       
    //window.openDialog("chrome://foxfilter/chrome/settings.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();
  }
  else
  {
    document.getElementById("label-message").value = dlwatch.getStr('invalidPassword');
    //return false;
  }

}

function login_doCancel()
{
  var dlwatchPref = dlwatch.getPrefs();

  //setTimeout(function() {dlwatchPref.setBoolPref("authopen",false);}, 1000);
  dlwatchPref.setBoolPref("authopen",false);

  window.close();
  return false;
}
