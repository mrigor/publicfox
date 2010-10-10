PF['linebreak'] = {
  string: function(){
    var mac= /mac/i.test(navigator.platform);
    var win= /win/i.test(navigator.platform);
    var unix= /lin|unix|x11/i.test(navigator.platform);

    if (win)
      return "\r\n";
    else if (mac)
    return "\r";
    else
      return "\n";
  },

  length: function(){
    var win= /win/i.test(navigator.platform);
    return (win) ? 2 : 1;
  }
};
var tempAllowListArray = [];

var dlwatchUrlBlockPrefs = {
  //read existing allowed sites, add new, export them into array
  storeTempAllowList: function(url){
    const urlBlockPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.dlwatch.");

    // Read locations
    var tempAllowSitesString = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

    if(urlBlockPrefBranch.prefHasUserValue("urlblocktempallow")){
      tempAllowSitesString = urlBlockPrefBranch.getComplexValue("urlblocktempallow", Components.interfaces.nsISupportsString).data;
      var tempAllowSitesArray = tempAllowSitesString.split("|||");
    }else{
      var tempAllowSitesArray = [];
    }
    //don't add same url twice, check if it exists already	
    for(var i=0, ilen = tempAllowSitesArray.length;i<ilen;i++){
      if(tempAllowSitesArray[i]==url)
        return;
    }
    tempAllowSitesArray.push(url);
    //Store temporary allowed locations
    var locationNsIString = Components.classes["@mozilla.org/supports-string;1"].
    createInstance(Components.interfaces.nsISupportsString);
    locationNsIString.data = tempAllowSitesArray.join("|||");
    urlBlockPrefBranch.setComplexValue("urlblocktempallow", Components.interfaces.nsISupportsString, locationNsIString);
    tempAllowListArray = tempAllowSitesArray;
  },
  //get rid of old allowed sites from previous sessions
  killTempAllowList: function(){
    const urlBlockPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.dlwatch.");	
    var locationNsIString = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    locationNsIString.data = "";
    urlBlockPrefBranch.setComplexValue("urlblocktempallow", Components.interfaces.nsISupportsString, locationNsIString);
    tempAllowListArray.length = 0;
  },
  storePrefs: function(){
    const urlBlockPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].
    getService(Components.interfaces.nsIPrefService).getBranch("extensions.dlwatch.");

    // Store enabled
    urlBlockPrefBranch.setBoolPref("urlblockenabled", document.getElementById("blockSiteCheckbox").checked);

    // Store listtype
    urlBlockPrefBranch.setCharPref("urlblocklisttype", document.getElementById("listtypeRadiogroup").selectedItem.id);

    // Store locations
    var locationList = document.getElementById("BlockedWebsitesList");
    var locationCount = locationList.getRowCount();
    var locationArray = [];
    var locationNsIString = Components.classes["@mozilla.org/supports-string;1"].
    createInstance(Components.interfaces.nsISupportsString);
    for(var i=0; i < locationCount; i++){
      locationArray.push(locationList.getItemAtIndex(i).label);
    }
    locationNsIString.data = locationArray.join("|||");
    urlBlockPrefBranch.setComplexValue("urlblocklocations", Components.interfaces.nsISupportsString, locationNsIString);
  },

  readPrefs: function(){
    const urlBlockPrefBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.dlwatch.");

    // Read enabled
    if(urlBlockPrefBranch.prefHasUserValue("urlblockenabled")){
      document.getElementById("blockSiteCheckbox").checked = urlBlockPrefBranch.getBoolPref("urlblockenabled");
    }else{
      urlBlockPrefBranch.setBoolPref("urlblockenabled", true);
      document.getElementById("blockSiteCheckbox").checked = true;
    }

    // Read listtype
    if(!urlBlockPrefBranch.prefHasUserValue("urlblocklisttype")){
      urlBlockPrefBranch.setCharPref("urlblocklisttype", "blacklistRadio");
    }
    document.getElementById("listtypeRadiogroup").selectedItem = document.getElementById(urlBlockPrefBranch.getCharPref("urlblocklisttype"));
    this.changeListType();

    // Read locations
    var blockedWebsitesString = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

    if(urlBlockPrefBranch.prefHasUserValue("urlblocklocations")){
      blockedWebsitesString = urlBlockPrefBranch.getComplexValue("urlblocklocations", Components.interfaces.nsISupportsString).data;
      var blockedWebsitesArray = blockedWebsitesString.split("|||");
    }else{
      var blockedWebsitesArray = [];
    }

    var locationList = document.getElementById("BlockedWebsitesList");

    for(var i=0; i < blockedWebsitesArray.length; i++){
      if(blockedWebsitesArray[i] != ""){
        locationList.appendItem(blockedWebsitesArray[i]);
      }
    }
  },

  changeListType: function(){
    document.getElementById("listtypeCaption").label = document.getElementById("listtypeRadiogroup").selectedItem.label;
  },

  editLocation: function(){
    var locationList = window.opener.document.getElementById('BlockedWebsitesList');
    var selectedLocation = locationList.getSelectedItem(0);

    var locationTextbox = document.getElementById('blockSiteLocation');
    locationTextbox.value = selectedLocation.label;
  },

  updateLocation: function(){
    var locationList = window.opener.document.getElementById('BlockedWebsitesList');
    var selectedLocation = locationList.getSelectedItem(0);

    var locationTextbox = document.getElementById('blockSiteLocation');
    selectedLocation.label = locationTextbox.value;
  },

  addLocation: function(){
    alert(1);
    var locationList = window.opener.document.getElementById("BlockedWebsitesList");
    alert(2);

    var newLocation = document.getElementById("blockSiteNewLocation").value;
    alert(newLocation);
    if(newLocation){
      locationList.appendItem(newLocation);
    }
  },

  removeLocation: function(){
    var locationList = document.getElementById("BlockedWebsitesList");
    locationList.removeItemAt(locationList.selectedIndex);
  },

  removeAllLocations: function(){
    var locationList = document.getElementById("BlockedWebsitesList");

    while(locationList.getRowCount()){
      locationList.removeItemAt(0);
    }
  },

  importList: function(){
    var filePickerImport = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    var streamImport = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    var streamIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    var overwriteCurrentList = false;
    var input;
    var inputArray;
    var validFile = false;

    filePickerImport.init(window, "Select a File", filePickerImport.modeOpen);
    filePickerImport.appendFilters(filePickerImport.filterText);

    if(filePickerImport.show() != filePickerImport.returnCancel){
      streamImport.init(filePickerImport.file, 0x01, 0444, null);
      streamIO.init(streamImport);
      input = streamIO.read(streamImport.available());
      streamIO.close();
      streamImport.close();


      // now: unix + mac + dos environment-compatible
      linebreakImport = input.match(/(?:\[url[Bb]lock\])(((\n+)|(\r+))+)/m)[1]; // first: whole match -- second: backref-1 -- etc..
      alert(input + " " + linebreakImport);
      inputArray = input.split(linebreakImport);

      var headerRe = /\[url[Bb]lock\]/; // tests if the first line is urlBlock's header
      if (headerRe.test(inputArray[0])){
        inputArray.shift();
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService); 
        var msg = "Do you want to Replace your current locations?\n..or Append to them?", title = "Public Fox Import", appendLabel = "Append", replaceLabel = "Replace", cancelLabel="Cancel Import"; 
        var flags = promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_2 + promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_1 + promptService.BUTTON_TITLE_IS_STRING * promptService.BUTTON_POS_0 + (promptService.BUTTON_POS_0_DEFAULT?promptService.BUTTON_POS_0_DEFAULT:0); 
        var buttonPressed = promptService.confirmEx(window,title,msg,flags,cancelLabel,replaceLabel,appendLabel,null,{});
        if (buttonPressed == 0) return; // second confirm -- user cancelled.
        var shouldAppend = (buttonPressed == 2);

        if(!shouldAppend){
          dlwatchUrlBlockPrefs.removeAllLocations();
        }

        for(var i=0; i<inputArray.length; i++){
          var locationList = document.getElementById("BlockedWebsitesList");

          if(inputArray[i])
            locationList.appendItem(inputArray[i]);
        }
      }
    }
  },

  exportList: function(){
    var filepickerExport = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    var exportStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

    filepickerExport.init(window, "Select a File", filepickerExport.modeSave);
    filepickerExport.defaultExtension=".txt";
    filepickerExport.appendFilters(filepickerExport.filterText);

    if (filepickerExport.show() != filepickerExport.returnCancel) {
      if (filepickerExport.file.exists()){
        filepickerExport.file.remove(true);
      }
      filepickerExport.file.create(filepickerExport.file.NORMAL_FILE_TYPE, 0666);

      exportStream.init(filepickerExport.file, 0x02, 0x200, null);
      exportStream.write("[urlBlock]" + PF.linebreak.string(), 10 + PF.linebreak.length());

      var locationList = document.getElementById("BlockedWebsitesList");
      var locationCount = locationList.getRowCount();

      for(var i=0; i<locationCount; i++){
        var location = locationList.getItemAtIndex(i).label;
        exportStream.write(location, location.length);
        exportStream.write(PF.linebreak.string(), PF.linebreak.length());
      }

      exportStream.close();
    }
  }
};
