var PREF_CONST = {
  REDMINE_URL : "extensions.quick-ticket-to-redmine.redmineurlpref",
  ACCESS_KEY : "extensions.quick-ticket-to-redmine.redmineacceskeypref",
  AUTH_METHOD : "extensions.quick-ticket-to-redmine.authmethod"
};
//pref("extensions.quick-ticket-to-redmine.redmineurlpref", "http://example.com:9000/");
//pref("extensions.quick-ticket-to-redmine.redmineacceskeypref", "");
//pref("extensions.quick-ticket-to-redmine.authmethod", 1);
function Options() {
  this.initialize.apply(this, arguments);
}

Options.prototype = {

  httprealm: "Redmine API",

  initialize: function() {
  },

  onLoad: function() {

            //ラジオボタンにイベントを設定
            //※本イベントはradiogroupに設定してあるため、
            //radiogroupに含まれるすべてのradioコンポーネントにイベントが設定される。
            var radiogroup = document.getElementById("auth-radiogroup");
            radiogroup.addEventListener("RadioStateChange", function(event) { 
              options.toggleAuthSettingView(event.target); 
            },false);

            //設定されている認証方式を選択する。
            radiogroup.selectedIndex = nsPreferences.getIntPref(PREF_CONST.AUTH_METHOD);

            //設定表示の初期化。一旦認証設定を画面を切り替えるメソッドを実行し、適切な表示にする。
            var radios = radiogroup.getElementsByTagName("radio");
            for (var i = 0; i<radios.length; i++) {
              this.toggleAuthSettingView(radios[i]);
            }
          },

  toggleAuthSettingView: function(target) {
                           //認証設定の画面を切り替える
                           if(target.getAttribute("id") === "api-radio") {
                             if(target.selected) {
                               document.getElementById("isApi").removeAttribute("disabled");
                             }else{
                               document.getElementById("isApi").setAttribute("disabled", true);
                             }
                           } else {
                             if(target.selected) {
                               document.getElementById("isBasic").removeAttribute("disabled");
                             }else{
                               document.getElementById("isBasic").setAttribute("disabled", true);
                             }
                           }
                         },

  doOK: function() {

          var url = document.getElementById("redmineurl_textbox").value;
          nsPreferences.setUnicharPref(PREF_CONST.REDMINE_URL, url);

          var key = document.getElementById("redmineacceskey_textbox").value;
          nsPreferences.setUnicharPref(PREF_CONST.ACCESS_KEY, key);

          var radiogroup = document.getElementById("auth-radiogroup");
          nsPreferences.setIntPref(PREF_CONST.AUTH_METHOD, radiogroup.selectedIndex);

          return true;
        },

  doCancel: function(){
              return true;
            }

  //  saveLoginInfo: function() {
  //
  //                   //マネージャの初期化
  //                   try {
  //                     // ログインマネージャを得る
  //                     var loginManager = Components.classes["@mozilla.org/login-manager;1"]
  //                       .getService(Components.interfaces.nsILoginManager);
  //
  //                     // ユーザを見つける
  //                     var hostname = nsPreferences.copyUnicharPref("extensions.quick-ticket-to-redmine.redmineurlpref");
  //                     var oldlogin = loginManager.findLogins({}, hostname, null, this.httprealm);
  //
  //                     var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
  //                         Components.interfaces.nsILoginInfo,
  //                         "init");
  //
  //                     var username = document.getElementById("id_textbox").value;
  //                     var password = document.getElementById("password_textbox").value;
  //
  //
  //                     var loginInfo = new nsLoginInfo(hostname, null, this.httprealm, username, password,
  //                         "", "");
  //
  //                     if (oldlogin.length > 0) {
  //                       //既に登録されている場合は編集する
  //                       loginManager.modifyLogin(oldlogin[0], loginInfo);
  //                     } else {
  //                       //ユーザが存在しない場合は、新規に追加する
  //                       loginManager.addLogin(loginInfo);
  //                     }
  //
  //                   }
  //                   catch(ex) {
  //                     // nsILoginManger コンポーネントが存在しない場合のみ発生する
  //                     LOG(ex);
  //                   }
  //
  //                 }
};

var options = new Options();

