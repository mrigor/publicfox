var dlwatchPref = Components.classes["@mozilla.org/preferences-service;1"]
.getService(Components.interfaces.nsIPrefService)
.getBranch("extensions.dlwatch.");

if (!dlwatchPref.prefHasUserValue("lock")) dlwatchPref.setBoolPref("lock",false);
var dlwatch_lock=dlwatchPref.getBoolPref("lock");
var dlwatch_addonsref;

alert("overlay");

function dlwatch_enable_addons(){
  var auth=false;
  
  if(!dlwatch_authenticate()) return;
  d("enabling");
  
  if(dlwatch_addonsref){
    dlwatchPref.setBoolPref("lock",false);
    dlwatch_addonsref.hidden = false;
    document.getElementById('dlwatch-menu').hidden = true;
    
    //document.getElementById('menu_ToolsPopup').appendChild(dlwatch_addonsref);
  }
}

function dlwatch_init(){
  try{
    
    //for hiding Addons
    // don't execute in options window
    if ('undefined'==typeof gBrowser) return;
    
    if(dlwatchPref.getBoolPref("lock") == false){
      document.getElementById("dlwatch-menu").hidden = true;
      return;
    }
    
    //find the main menu
    var menubar=document.getElementById('menu_ToolsPopup');
    //find our menu popup
    var menusub=document.getElementById('tinymenu-popup');
    var menuaddons = document.getElementById('menuedit-menu_ToolsPopup-Add45ons');
    
    var menubar=document.getElementById('menu_ToolsPopup');
    
    /*	var dlwatch_XUL_NS= "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";	
     var ele = document.createElementNS(dlwatch_XUL_NS,"menuitem");
     ele.id = "fakeAddons";
     ele.label = "Addons Locked";
     ele.visibility = "visible";
     //menubar.insertBefore(ele,menubar.firstChild);
     menubar.appendChild(ele);
     document.getElementById("fakeAddons").label = "Addons Locked";
     */
    
    
    
    
    var el, r;
    
    for (var i=menubar.childNodes.length-1; i>=0; i--) {
      el=menubar.childNodes[i];
      
      //d("id-"+el.id + " " + el.label+" "+el.oncommand+" " + el.id.indexOf("Add") );
      
      if(el.label == "Add-ons"){
        
        d("found add-ons");
        dlwatch_addonsref = el;
        
        
        el.hidden=true;
        
        
      }
      //r=new RegExp('\\b'+el.id+'\\b');
      //if (r.exec(tinymenu.doNotCollapse)) continue;
      
      //menubar.removeChild(el);
      //menusub.insertBefore(el, menusub.firstChild);
    }
    
    
    
    
    
    
    window.removeEventListener("load", dlwatch_init, true);
    
    // Add download observer
    /*var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
     
     observerService.addObserver(dlwatchObserver, "dl-start", false);		
     */
    
    // Add pref listener		
    //var oPref	= Components.classes["@mozilla.org/preferences;1"].createInstance(Components.interfaces.nsIPrefBranchInternal);
    //	oPref.addObserver("extensions.dlwatch.lock", dlwatchPrefObserver, false);
    
    dlwatchPref.QueryInterface(Components.interfaces.nsIPrefBranch2);
    dlwatchPref.addObserver("", dlwatchPrefObserver, false);
    
    if (!dlwatchPref.prefHasUserValue("lock")) dlwatchPref.setBoolPref("lock",true);
    if(!dlwatchPref.getBoolPref("lock")){
      dlwatch_lock = false;
    }
    
    
  }catch(e){ alert("dlwatch (200)\nCould not initialize dlwatch extension.\n"+ e); }
}

const dlwatchPrefObserver = {
  observe : function(subject, topic, data){ 
    if (topic != "nsPref:changed")
    {
      return;
    }
    
    switch(data)
    {
    case "lock": /*alert("lock");*/
      if(!dlwatchPref.getBoolPref("lock")){
        dlwatch_lock = true;
      }
      else 
      {
        var pref = dlwatchPref.getBoolPref("lock");
        d("lock-"+pref);
        document.getElementById('dlwatch-menu').hidden = !pref;
        dlwatch_addonsref.hidden = pref;
        
      }
      break;
    }
    
  }
}

const dlwatchObserver = {
  observe: function (subject, topic, state) {
    //This is being run for every window - FIX
    
    const NS_BINDING_ABORTED = 0x80020006;
    
    dlwatch_lock=dlwatchPref.getBoolPref("lock");
    if (!dlwatch_lock) return;
    
    //EXIT if password entered - DON'T CANCEL
    //if(dlwatch_authenticate() ) return;
    var oDownload 	= subject.QueryInterface(Components.interfaces.nsIDownload);
    //alert(oDownload.cancelable);
    var oFile	= null;
    try{
      oFile = oDownload.targetFile;  // New firefox 0.9
    } catch (e){
    oFile = oDownload.target;      // Old firefox 0.8
    }
    
    
    var found=false;
    //var list = Components.classes["@mozilla.org/preferences;1"].getService(Components.interfaces.nsIPrefBranch);
    //list = list.getCharPref("extensions.dlwatch.ext");
    if(!dlwatchPref.prefHasUserValue("ext")) dlwatchPref.setCharPref("ext","exe,zip,bat,cmd,rar,tar,bin,gz,iso,que");
    var list = dlwatchPref.getCharPref("ext");
    
    
    var badExtArr = list.split(",");// = [ "exe","zip","];
    
    if(topic == "dl-start"){
      
      for(i=0;i<badExtArr.length;i++){
        if(oFile.path.indexOf("."+badExtArr[i]) >= 0 ){
          found = true;/*alert(oFile.path + " contains "+badExtArr[i]);*/}
        
        
      }
      
      if(found){
        
        oDownload.cancelable.cancel(NS_BINDING_ABORTED);
        var dm = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);
        
        //if(dm.canCleanUp) dm.cleanUp();
        
        try{
          dm.cancelDownload(oFile.path);
          
        }
        catch(err){/*alert("cant cancelDownload");*/}
        
      }
      
      
    }
    
  }
}

function dlwatch_shutdown(){
  dlwatchPref.removeObserver("", dlwatchPrefObserver);
  
  
}
function d(msg){
  var acs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces["nsIConsoleService"]);
  acs.logStringMessage(msg);
}
function dlwatch_authenticate(){
  
  //promptPassword
  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
  .getService(Components.interfaces.nsIPromptService);
  input = {value:""};
  check = {value:false};
  okorcancel = prompts.promptPassword(window, 'Authenticate', 'Enter your password to unlock.', input, null, check);
  //return input.value;//return check.value;//return okorcancel;
  
  //d("in:"+hex_md5(input.value)+" stored:"+dlwatchPref.getCharPref("pass"));
  if( okorcancel && hex_md5(input.value)  == dlwatchPref.getCharPref("pass") ) return true; else{ alert("Wrong password"); return false;}
}
