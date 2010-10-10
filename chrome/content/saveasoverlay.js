var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("lock")) dlwatchPref.setBoolPref("lock",false);
var lock = dlwatchPref.getBoolPref("lock");

PF['saveasinit'] = function(){
  var onacceptsave = document.documentElement.getAttribute('ondialogaccept');

  if(lock){
    this.dialog = dialog;
    this.url = dialog.mLauncher.source.spec;
    this.tempfile = dialog.mLauncher.targetFile.path.toLowerCase();
    var found=false;

    if(!dlwatchPref.prefHasUserValue("ext")) dlwatchPref.setCharPref("ext","exe,zip,bat,cmd,rar,tar,bin,gz,iso,que");
    var list = dlwatchPref.getCharPref("ext");

    if(list == "*" ){
      found = true 
    }
    else{
      var badExtArr = list.split(",");

      if(badExtArr.length >=1 && badExtArr[0] != "" ) {
        for(var i=0;i<badExtArr.length;i++){
          PF.log(this.url);
          if(this.tempfile.indexOf("."+badExtArr[i].toLowerCase()) >= 0 ){
            found = true;
            PF.log("found- "+badExtArr[i]);
          }


        }
      }
    }
    if(found){
      document.documentElement.setAttribute('ondialogaccept', 'if(PF.authenticate()) { ' + onacceptsave +'} else	return false;');
    }
  }
}
window.addEventListener( "load", PF.saveasinit, false);
window.addEventListener("unload",function(){document.documentElement.removeAttribute('ondialogaccept');},false);
