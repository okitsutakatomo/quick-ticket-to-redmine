function ContextmenuOverlay() {
  this.initialize.apply(this, arguments);
}

ContextmenuOverlay.prototype = {

  url:"chrome://quick-ticket-to-redmine/content/ticket-dialog.xul",

  initialize: function() {
  },

  showTicketDialog: function(args) {
                      window.openDialog(this.url, "_blank", "chrome,titlebar,resizable", args);
                    }
};

var contextmenuOverlay = new ContextmenuOverlay();


