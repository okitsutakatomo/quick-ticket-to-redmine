function arrayContains(array, value) {
  for(var i in array){
    if( array.hasOwnProperty(i) && array[i] === value){
      return true;
    }
  }
  return false;
}

function LOG(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
    .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}

function ALERT(msg, title) {

  if(!title){
    title = null;
  }
  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService);
  prompts.alert(window, title, msg);
}

function showErrorDialog(message, detail) {
  var dialogurl = "chrome://quick-ticket-to-redmine/content/error-prompt.xul";
  window.openDialog(dialogurl, "_blank", "chrome,titlebar,modal,resizable", message, detail);
}

function trim(string) {
  if(!string) {
    return string;
  }
  return string.replace(/(^\s+)|(\s+$)/g, "");
}
