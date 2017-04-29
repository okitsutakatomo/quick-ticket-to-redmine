function ContextmenuOverlay(...args) {
  this.initialize(...args);
}

ContextmenuOverlay.prototype = {

  url:"chrome://quick-ticket-to-redmine/content/ticket-dialog.xul",

  initialize() {
  },

  showTicketDialog(args) {
                      window.openDialog(this.url, "_blank", "chrome,titlebar,resizable", args);
                    }
};

var contextmenuOverlay = new ContextmenuOverlay();


