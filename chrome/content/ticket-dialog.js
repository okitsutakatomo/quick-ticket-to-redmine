function TicketDialog(...args) {
  this.initialize(...args);
}

TicketDialog.prototype = {

  redmineurl: "",
  accesskey: "",
  listing_project_path: "projects.xml",
  listing_issue_path: "issues.xml",
  authmethod: 1,
  dialogurl:"chrome://quick-ticket-to-redmine/content/ticket-dialog.xul",

  initialize() {
  },

  show(args) {
          window.openDialog(this.dialogurl, "_blank", "chrome,titlebar,resizable", args);
        },

  onLoad() {

            try {
              //引数からメール情報を取得する 
              var nsIMsgDBHdr = window.arguments[0];

              //チケットオブジェクトを作成する。
              var ticket = new Ticket(nsIMsgDBHdr);


              //題名を設定する。
              var title_box = document.getElementById("title-box");
              title_box.value = ticket.title;

              //説明を設定する。
              var description_box = document.getElementById("description-box");
              description_box.value = ticket.description;

              //設定値を取得
              this.redmineurl = nsPreferences.copyUnicharPref("extensions.quick-ticket-to-redmine.redmineurlpref");
              this.accesskey = nsPreferences.copyUnicharPref("extensions.quick-ticket-to-redmine.redmineacceskeypref");
              this.authmethod = nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.authmethod");

              if(!this.redmineurl || this.redmineurl == 0 ){
                document.getElementById("notificationbox").appendNotification( 
                    "RedmineのURLが設定されていません。アドオンの設定よりRedmineのURLを設定してください。", 
                    "urlPrefError",
                    null,
                    "PRIORITY_WARNING_HIGH",
                    null);
                return;
              }

              //変数にセットする。（念のため、trimを行う)
              this.redmineurl = this.redmineurl.replace(/(^\s+)|(\s+$)/g, "");

              //最後の文字がスラッシュでなければ、スラッシュを補完する。
              if(this.redmineurl.slice(-1) != "/") {
                this.redmineurl = this.redmineurl + "/";
              }

              //document.getElementById("ticket-dialog").centerWindowOnScreen();

              //プロジェクト一覧を呼び出す
              this.getProjectList();

              //トラッカーと担当の一覧を取得
              this.getTrackerAndAssignedList();

            }catch(ex){
              document.getElementById("notificationbox").appendNotification( 
                  "エラーが発生しました。" + ex,
                  "showTicketdialogError",
                  null,
                  "PRIORITY_CRITICAL_HIGH",
                  null);
            }
          },

  getProjectList() {

                    var self = this;

                    var url = this.redmineurl + this.listing_project_path; 

                    var request = Components.
                      classes["@mozilla.org/xmlextras/xmlhttprequest;1"].
                      createInstance();

                    // オブジェクトに nsIDOMEventTarget インタフェースを照会し、それにイベントハンドラをセット
                    //request.QueryInterface(Components.interfaces.nsIDOMEventTarget);
                    //request.addEventListener("progress", function(evt) {}, false);
                    //request.addEventListener("load", function(evt) {}, false);
                    //request.addEventListener("error", function(evt) {}, false);

                    // nsIXMLHttpRequest を照会し、開き、リクエストを送信
                    request.QueryInterface(Components.interfaces.nsIXMLHttpRequest);

                    //認証情報の設定 
                    if(nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.authmethod") == 0 ) {
                      url = url + "?key=" + this.accesskey; 
                    } 

                    request.open("GET", url, true);
                    request.onreadystatechange = aEvt => {
                      if (request.readyState == 4) {
                        if(request.status == 200) {
                          var projectsXML = request.responseXML;
                          var projects = projectsXML.getElementsByTagName("project");

                          var projectArray = [];

                          for (var i=0; i<projects.length; i++){
                            var hash = {};
                            hash.id = projects[i].getElementsByTagName("id")[0].firstChild.nodeValue;
                            hash.name = projects[i].getElementsByTagName("name")[0].firstChild.nodeValue;
                            projectArray[i] = hash;
                          }

                          //メニューリストに取得したプロジェクトを追加する。
                          var projectlist = document.getElementById("project-list");


                          for (var i=0; i<projectArray.length; i++){
                            projectlist.insertItemAt(i, projectArray[i].name, projectArray[i].id);

                            //以前選択したプロジェクトをデフォルトで選択させるようにする。
                            if(projectArray[i].id == self.loadRecentProjectId()) {
                              projectlist.selectedIndex = i;
                            }
                          }

                          if(projectlist.selectedIndex == -1) {
                            projectlist.selectedIndex = 0;
                          }

                          document.getElementById("project-loading").style.display = "none";

                        } else {
                          document.getElementById("notificationbox").appendNotification( 
                              "Redmineに接続できません。設定を確認して下さい。url=" + self.redmineurl + " status=" + request.status,
                              "getProjectList",
                              null,
                              "PRIORITY_CRITICAL_HIGH",
                              null);
                        }
                      }
                    };
                    request.send(null);
                  },

  getTrackerAndAssignedList() {

                               var self = this;

                               var url = this.redmineurl + this.listing_issue_path + "?assigned_to=me"; 

                               //認証情報の設定
                               if(nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.authmethod") == 0 ) {
                                 url = url + "&key=" + this.accesskey; 
                               }

                               var request = Components.
                                 classes["@mozilla.org/xmlextras/xmlhttprequest;1"].
                                 createInstance();

                               // nsIXMLHttpRequest を照会し、開き、リクエストを送信
                               request.QueryInterface(Components.interfaces.nsIXMLHttpRequest);


                               request.open("GET", url, true);
                               request.onreadystatechange = aEvt => {
                                 if (request.readyState == 4) {
                                   if(request.status == 200) {
                                     var xml = request.responseXML;

                                     //トラッカーの一覧をメニューリストに格納
                                     var trackers = xml.getElementsByTagName("tracker");

                                     var trackerArray = [];

                                     for (var i=0; i<trackers.length; i++){
                                       var hash = {};
                                       hash.id = trackers[i].getAttribute("id");
                                       hash.name = trackers[i].getAttribute("name");
                                       trackerArray[i] = hash;
                                     }

                                     //メニューリストに取得したトラッカーを追加する。
                                     var trackerlist = document.getElementById("tracker-list");

                                     var tmp = [];
                                     for (var i=0; i<trackerArray.length; i++){
                                       if(!arrayContains(tmp, trackerArray[i].id)){
                                         trackerlist.insertItemAt(i, trackerArray[i].name, trackerArray[i].id);
                                         tmp.push(trackerArray[i].id);

                                         //以前選択したプロジェクトをデフォルトで選択させるようにする。
                                         if(trackerArray[i].id == self.loadRecentTrackerId()) {
                                           trackerlist.selectedIndex = i;
                                         }
                                       }
                                     }

                                     document.getElementById("tracker-loading").style.display = "none";

                                     //担当者を自分自身に設定
                                     var assigned_tos = xml.getElementsByTagName("assigned_to");

                                     var assignedToArray = [];

                                     for (var i=0; i<assigned_tos.length; i++){
                                       var hash = {};
                                       hash.id = assigned_tos[i].getAttribute("id");
                                       hash.name = assigned_tos[i].getAttribute("name");
                                       assignedToArray[i] = hash;
                                     }

                                     //メニューリストに取得したトラッカーを追加する。
                                     var assignedToList = document.getElementById("assigned-to-list");

                                     var tmp = [];
                                     for (var i=0; i<assignedToArray.length; i++){
                                       if(!arrayContains(tmp, assignedToArray[i].id)){
                                         assignedToList.insertItemAt(i, assignedToArray[i].name, assignedToArray[i].id);
                                         tmp.push(assignedToArray[i].id);

                                         //以前選択したプロジェクトをデフォルトで選択させるようにする。
                                         if(assignedToArray[i].id == self.loadRecentAssignedToId()) {
                                           assignedToList.selectedIndex = i;
                                         }
                                       }
                                     }

                                     document.getElementById("assigned-to-loading").style.display = "none";

                                   } else {
                                     document.getElementById("notificationbox").appendNotification( 
                                         "Redmineに接続できません。設定を確認して下さい。url=" + self.redmineurl + " status=" + request.status,
                                         "getTrackerAndAssignedList",
                                         null,
                                         "PRIORITY_CRITICAL_HIGH",
                                         null);
                                   }
                                 }
                               };
                               request.send(null);
                             },

  createIssue(ticket) {

                 var self = this;

                 //選択した値を保存する
                 this.saveRecentProjectId(ticket.project_id);
                 this.saveRecentTrackerId(ticket.tracker_id);
                 this.saveRecentAssignedToId(ticket.assigned_to_id);

                 var url = this.redmineurl + this.listing_issue_path; 

                 var request = Components.
                   classes["@mozilla.org/xmlextras/xmlhttprequest;1"].
                   createInstance();

                 // オブジェクトに nsIDOMEventTarget インタフェースを照会し、それにイベントハンドラをセット
                 //request.QueryInterface(Components.interfaces.nsIDOMEventTarget);
                 //request.addEventListener("progress", function(evt) {}, false);
                 //request.addEventListener("load", function(evt) {}, false);
                 //request.addEventListener("error", function(evt) {}, false);

                 // nsIXMLHttpRequest を照会し、開き、リクエストを送信
                 request.QueryInterface(Components.interfaces.nsIXMLHttpRequest);

                 //認証情報の設定 
                 if(nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.authmethod") == 0 ) {
                   url = url + "?key=" + this.accesskey;
                 }

                 request.open("POST", url, true);
                 request.setRequestHeader("Content-Type", "application/xml; charset=utf-8");
                 request.onreadystatechange = aEvt => {
                   if (request.readyState == 1){
                     //プログレスバーを表示
                     self.showProgress();
                   }

                   if (request.readyState == 4) {
                     //プログレスバーを非表示にする
                     self.hideProgress();

                     if(request.status == 201) {
                       var responseXML = request.responseXML;
                       var id = responseXML.getElementsByTagName("id")[0].firstChild.nodeValue;
                       var created_pageurl = ticketDialog.redmineurl + "issues/" + id;

                       ticketDoneDialog.show(created_pageurl);
                       document.getElementById("ticket-dialog").cancelDialog();

                     } else if(request.status == 422) {
                       var responseXML = request.responseXML;
                       var errors = responseXML.getElementsByTagName("error");
                       var message = "";
                       for(var i = 0; i<errors.length; i++){
                         message = message + errors[i].firstChild.nodeValue + "\n";
                       }
                       ALERT(message, "チケットの登録に失敗しました");
                     } else {
                       ALERT("status: " + request.status, "チケットの登録に失敗しました");
                     }
                   }
                 };
                 request.send(ticket.serializeToString());
               },

  onAccept() {

              //チケットオブジェクトにデータを格納する。
              var ticket = new Ticket(); 

              try{

                ticket.title = document.getElementById("title-box").value;
                ticket.project_id = document.getElementById("project-list").selectedItem.value;
                if(document.getElementById("tracker-list").selectedItem){
                  ticket.tracker_id = document.getElementById("tracker-list").selectedItem.value;
                }
                if(document.getElementById("assigned-to-list").selectedItem){
                  ticket.assigned_to_id = document.getElementById("assigned-to-list").selectedItem.value;
                }
                ticket.description = document.getElementById("description-box").value;
                ticket.start_date = document.getElementById("start-date-box").value;
                if(document.getElementById("end-date-checkbox").checked){
                  ticket.due_date = document.getElementById("end-date-box").value;
                }
                ticket.estimated_hours = document.getElementById("estimated-hours-box").value;

                this.createIssue(ticket);

              }catch(ex){
                document.getElementById("notificationbox").appendNotification( 
                    "エラーが発生しました。" + ex,
                    "onAccept",
                    null,
                    "PRIORITY_CRITICAL_HIGH",
                    null);
                return;
              }

              return false;
            },

  onCancel() {
              return true;
            },

  showProgress() {
                  document.getElementById("progressbar").style.visibility = "visible";
                },

  hideProgress() {
                  document.getElementById("progressbar").style.visibility = "hidden";
                },

  saveRecentProjectId(id) {
                         nsPreferences.setIntPref("extensions.quick-ticket-to-redmine.recentprojectid", id);
                       },

  loadRecentProjectId() {
                         return nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.recentprojectid");
                       },
  saveRecentTrackerId(id) {
                         nsPreferences.setIntPref("extensions.quick-ticket-to-redmine.recenttrackerid", id);
                       },

  loadRecentTrackerId() {
                         return nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.recenttrackerid");
                       },
  saveRecentAssignedToId(id) {
                            nsPreferences.setIntPref("extensions.quick-ticket-to-redmine.recentassignedtoid", id);
                          },

  loadRecentAssignedToId() {
                            return nsPreferences.getIntPref("extensions.quick-ticket-to-redmine.recentassignedtoid");
                          },

  onCommandEndDate(event) {
                      var target = event.target;
                      if(target.checked){
                        document.getElementById("endDateBroadcast").removeAttribute("disabled");
                      }else{
                        document.getElementById("endDateBroadcast").setAttribute("disabled", true);
                      }
                    },

  showTicketDoneDialog(args) {
                          window.openDialog(this.dialogurl, "_blank", "chrome,titlebar,resizable", args);
                        },
};

var ticketDialog = new TicketDialog();

