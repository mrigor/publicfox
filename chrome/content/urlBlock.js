const urlBlockPrefBranch = dlwatch.getPrefs();

var dlwatchUrlBlock = {
  showBlockWarning: function(event){
    event.target.location.href = "chrome://dlwatch/content/blockedError.xhtml";
  },

  checkArrayR: function(arr, value) {
    for (var i=0, len=arr.length; i<len; i++){
      var skip = false;
      var regexp = dlwatch.convert2RegExp(arr[i]);
      if(regexp && regexp.test(value)){
        //attempt to fix multiple window prompts
        tempAllowListArray = urlBlockPrefBranch.getCharPref("urlblocktempallow").split("|||");

        dlwatch.log("tempList-" +tempAllowListArray.join(' '));

        //found pattern and its white
        if(!this.isBlackList(urlBlockPrefBranch)){
          //alert('should allow - white found');
          return false;
        }

        //found pattern and its black

        //compare against temporary allowed sites
        for(var x=0, tempLen=tempAllowListArray.length; x<tempLen; x++){
          dlwatch.log(i + " looking for "+arr[i] + " " + tempAllowListArray[x] + " have " + value + " skip-" + skip);
          if(arr[i] == tempAllowListArray[x]){
            skip = true;
            dlwatch.log("found bad URL in safelist     allow-"+skip + " tittle-" +document.title);
            return false;
          }
          //dlwatch.log("not found skip-"+skip);
        }
        if(skip) return false;
        //dlwatch.log("asking password, " + arr[i] + " value " + value );
        if(!skip && !dlwatch.authenticate_url(value)){
          return true;
        }
        dlwatchUrlBlockPrefs.storeTempAllowList(arr[i]);
        return false;

      }
    }

    //did not find pattern and its white
    //should block
    if(!this.isBlackList(urlBlockPrefBranch)){
      //return true;
      if(!dlwatch.authenticate_url(value)){
        return true;
      }
      return false;
    }
    //did not find pattern and its black
    return false;
  },

  showPrefs: function(notification, description){
    window.open("chrome://dlwatch/content/options.xul",
      "Public Fox "+dlblock.getStr('options'),
      "chrome,centerscreen,resizable=no");
  },
  showBlockWarningBar: function() {

    var messageBarText = dlwatch.getStr('urlBlockedMessage');

    var notificationBox = gBrowser.getNotificationBox();
    var notification = notificationBox.getNotificationWithValue("website-blocked");

    /*var optionsButton;
     optionsButton.accesskey = null;
     optionsButton.callback = BlockSite.showPrefs;
     optionsButton.label = document.getElementById("blocksite.locale").getString("BlockSite.optionsButton");
     optionsButton.popup = null;
     var buttons = new Array();
     buttons.push(optionsButton);*/

    if(notification){
      notification.label = messageBarText;
    }else{
      const priority = notificationBox.PRIORITY_WARNING_MEDIUM;
      //notificationBox.appendNotification(messageBarText, "website-blocked", "chrome://browser/skin/Info.png", priority, buttons);
      notificationBox.appendNotification(messageBarText, "website-blocked", "chrome://browser/skin/Info.png", priority, null);
    }
  },

  isBlackList: function(prefBranch){
    if (!prefBranch.prefHasUserValue("urlblocklisttype"))
      return true;
    return prefBranch.getCharPref("urlblocklisttype") == "blacklistRadio";
  },
  checkLocation: function(location){

    if(urlBlockPrefBranch.prefHasUserValue("urlblocklocations")){
      var blockedLocations = urlBlockPrefBranch.getComplexValue("urlblocklocations", Components.interfaces.nsISupportsString).data;
      if(blockedLocations){

        //if(blockedLocationsArray.inArrayR(location))
        //if(this.checkArrayR(blockedLocationsArray, location))
        //	return this.isBlackList(urlBlockPrefBranch);
        return this.checkArrayR(
          blockedLocations.split("|||"),
          location);
      }
    }

    return !this.isBlackList(urlBlockPrefBranch);
  },

  checkAnchor: function(anchor){
    if(urlBlockPrefBranch.prefHasUserValue("urlblocklocations")){
      var blockedLocationsString = urlBlockPrefBranch.getComplexValue("urlblocklocations", Components.interfaces.nsISupportsString).data;
      if(blockedLocationsString != ""){
        var blockedLocationsArray = blockedLocationsString.split("|||");

        //if(blockedLocationsArray.inArrayR(anchor.href))
        //if(this.checkArrayR(blockedLocationsArray, anchor.href))
        //	return this.isBlackList(urlBlockPrefBranch);
        return this.checkArrayR(blockedLocationsArray,anchor.href);
      }
    }

    return !this.isBlackList(urlBlockPrefBranch);
  },

  processAnchors: function(event){
    var anchorElements = event.target.getElementsByTagName("a");

    for(var i=0, ilen = anchorElements.length; i<ilen; i++){
      if(dlwatchUrlBlock.checkAnchor(anchorElements[i])){
        var tempFragment = document.createDocumentFragment();
        var childNodes = anchorElements[i].childNodes;
        var parentNode = anchorElements[i].parentNode;

        for(var j=0, jlen = childNodes.length; j < jlen; j++){
          tempFragment.appendChild(childNodes[j].cloneNode(true));
        }

        parentNode.replaceChild(tempFragment, anchorElements[i]);
        i--; //List is live, so replacing the node means that anchorElements[i] is refering to the next node already
      }
    }
  },

  processLocations: function(event){
    if(event.type == "DOMContentLoaded"){
      if(dlwatchUrlBlock.checkLocation(event.target.location.href)){
        dlwatchUrlBlock.showBlockWarning(event);
      }
    }else if(event.type == "change"){
      if(dlwatchUrlBlock.checkLocation(gURLBar.value)){
        dlwatchUrlBlock.showBlockWarning(event);
      }
    }
  },

  dlwatchUrlBlockMain: function(event){
    if(urlBlockPrefBranch.prefHasUserValue("urlblockenabled") && urlBlockPrefBranch.getBoolPref("urlblockenabled")){
      if(event.type === "DOMContentLoaded" || event.type == "change"){
        // Locations
        //dlwatchUrlBlock.processLocations(event);

        if(urlBlockPrefBranch.prefHasUserValue("blocklinks") && urlBlockPrefBranch.getBoolPref("blocklinks")){
          // Anchors
          dlwatchUrlBlock.processAnchors(event);
        }
        urlBlockPrefBranch.setBoolPref("authlastreturn",false);
      }
    }
  }
}

// Event listener
window.document.getElementById("appcontent").addEventListener(
  "DOMContentLoaded",
  dlwatchUrlBlock.dlwatchUrlBlockMain,
  false);
//gURLBar.addEventListener("change", BlockSite.BlockSiteMain, false);

// Observer for HTTP requests to block the sites we don't want
dlwatch['observer'] = {
  observe: function(aSubject, aTopic, aData){
    //alert(aSubject + "\n\n" + aTopic + "\n\n" + aData);
    if (aTopic != 'http-on-modify-request')
      return;

    aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);

    if(urlBlockPrefBranch.prefHasUserValue("urlblockenabled") && urlBlockPrefBranch.getBoolPref("urlblockenabled")){
      if (dlwatchUrlBlock.checkLocation(aSubject.URI.spec)){
        dlwatchUrlBlock.showBlockWarningBar();
        aSubject.loadFlags = Components.interfaces.nsICachingChannel.LOAD_ONLY_FROM_CACHE;
        aSubject.cancel(Components.results.NS_ERROR_FAILURE);

      }
    }
  },

  QueryInterface: function(iid){
    if (!iid.equals(Components.interfaces.nsISupports) &&
      !iid.equals(Components.interfaces.nsIObserver))
    throw Components.results.NS_ERROR_NO_INTERFACE;

    return this;
  }
};

// Add our observer
var observerService = Components.classes["@mozilla.org/observer-service;1"].
getService(Components.interfaces.nsIObserverService);
observerService.addObserver(dlwatch.observer, "http-on-modify-request", false);

// Remove observer when current window closes
window.addEventListener(
  "unload",
  function() { observerService.removeObserver(dlwatch.observer, "http-on-modify-request");},
  false
);
