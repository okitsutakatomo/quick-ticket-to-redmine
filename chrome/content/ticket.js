function Ticket(...args) {
  this.initialize(...args);
}
Ticket.prototype = {
  initialize(nsIMsgDBHdr) {
                this.title = null;
                this.description = null;
                this.project_id = null;
                this.tracker_id = null;
                this.assigned_to_id = null;
                this.start_date = null;
                this.due_date = null;
                this.estimated_hours = null;

                if (nsIMsgDBHdr) {

                  //本文を取得する。
                  let msgFolder = nsIMsgDBHdr.folder;
                  let msgUri = msgFolder.getUriForMsg(nsIMsgDBHdr);
                  let messenger = Components.classes["@mozilla.org/messenger;1"]
                    .createInstance(Components.interfaces.nsIMessenger);
                  let streamListener = Components.classes["@mozilla.org/network/sync-stream-listener;1"]
                    .createInstance(Components.interfaces.nsISyncStreamListener);
                  messenger.messageServiceFromURI(msgUri).streamMessage(msgUri,
                      streamListener,
                      null,
                      null,
                      false,
                      "",
                      false);

                  //本文を設定する。
                  this.description = msgFolder.getMsgTextFromStream(streamListener.inputStream,
                      nsIMsgDBHdr.Charset,
                      65536,
                      32768,
                      false,
                      true,
                      {});

                  //サブジェクトを設定する。
                  this.title = nsIMsgDBHdr.mime2DecodedSubject;
                }
              },

  serializeToString() {

                       //  <?xml version="1.0"?>
                       //  <issue>
                       //    <subject>Example</subject>
                       //    <project_id>1</project_id>
                       //    <priority_id>4</priority_id>
                       //  </issue>

                       var string = '<?xml version="1.0"?>';
                       string = string + '<issue>';
                       string = string + '<subject>';
                       string = string + '<![CDATA[' + this.title + ']]>';
                       string = string + '</subject>';
                       string = string + '<project_id>';
                       string = string + '<![CDATA[' + this.project_id + ']]>';
                       string = string + '</project_id>';
                       if(this.tracker_id){
                         string = string + '<tracker_id>';
                         string = string + '<![CDATA[' + this.tracker_id + ']]>';
                         string = string + '</tracker_id>';
                       }
                       if(this.assigned_to_id){
                         string = string + '<assigned_to_id>';
                         string = string + '<![CDATA[' + this.assigned_to_id + ']]>';
                         string = string + '</assigned_to_id>';
                       }
                       if(this.description){
                         string = string + '<description>';
                         string = string + '<![CDATA[' + this.description + ']]>';
                         string = string + '</description>';
                       }
                       if(this.start_date){
                         string = string + '<start_date>';
                         string = string + '<![CDATA[' + this.start_date + ']]>';
                         string = string + '</start_date>';
                       }
                       if(this.due_date){
                         string = string + '<due_date>';
                         string = string + '<![CDATA[' + this.due_date + ']]>';
                         string = string + '</due_date>';
                       }
                       if(this.estimated_hours){
                         string = string + '<estimated_hours>';
                         string = string + '<![CDATA[' + this.estimated_hours + ']]>';
                         string = string + '</estimated_hours>';
                       }
                       string = string + '</issue>';

                       return string;
                     }

};


