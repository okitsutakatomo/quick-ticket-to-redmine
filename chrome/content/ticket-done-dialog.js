function TicketDoneDialog(...args) {
  this.initialize(...args);
}

TicketDoneDialog.prototype = {

  dialogurl:"chrome://quick-ticket-to-redmine/content/ticket-done-dialog.xul",

  initialize() {
  },

  show(args) {
          window.openDialog(this.dialogurl, "_blank", "chrome,titlebar,modal,resizable", args);
        },

  onLoad() {
            var href = window.arguments[0];

            if (href) {
              // only allow http(s) hrefs
              var scheme = "";
              var uri = null;
              try {
                uri = makeURI(href);
                scheme = uri.scheme;
              } catch (ex) {}
              if (uri && (scheme == "http" || scheme == "https"))
                href = uri.spec;
              else
                href = null;
            }

            document.getElementById("link_label").value = href;
            document.getElementById("link_label").setAttribute("go", href);

            document.getElementById("ticket-done-dialog").getButton("accept").focus();
          },

  go(event) {
        openURL(event.target.getAttribute("go"));
        window.close();
      },
};

var ticketDoneDialog = new TicketDoneDialog();
