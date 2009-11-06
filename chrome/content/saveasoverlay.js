var dlwatchPref = dlwatch.getPrefs();

if (!dlwatchPref.prefHasUserValue("lock")) dlwatchPref.setBoolPref("lock",false);
var lock = dlwatchPref.getBoolPref("lock");

function dlwatchsaveasinit(){
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
          d(this.url);
          if(this.tempfile.indexOf("."+badExtArr[i].toLowerCase()) >= 0 ){
            found = true;
            d("found- "+badExtArr[i]);
          }


        }
      }
    }
    if(found){
      document.documentElement.setAttribute('ondialogaccept', 'if(dlwatch_authenticate()) { ' + onacceptsave +'} else	return false;');
    }

  }

}
window.addEventListener( "load", dlwatchsaveasinit, false);
window.addEventListener("unload",function(){document.documentElement.removeAttribute('ondialogaccept');},false);

