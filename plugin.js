application.whenConnected(function() {
  for (var i in application.remote) {
    self[i] = application.remote[i];
  }
});

application.setInterface({run: function(code) {
  var indexedDB = void 0;
  var location = void 0;
  var navigator = void 0;
  var onerror = void 0;
  var onmessage = void 0;
  var performance = void 0;
  var webkitIndexedDB = void 0;
  var postMessage = void 0;
  var close = void 0;
  var openDatabase = void 0;
  var openDatabaseSync = void 0;
  var webkitRequestFileSystem = void 0;
  var webkitRequestFileSystemSync = void 0;
  var webkitResolveLocalFileSystemSyncURL = void 0;
  var webkitResolveLocalFileSystemURL = void 0;
  var addEventListener = void 0;
  var dispatchEvent = void 0;
  var removeEventListener = void 0;
  var dump = void 0;
  var onoffline = void 0;
  var ononline = void 0;
  var importScripts = void 0;
  var console = void 0;
  var self = void 0;
  
  var application = void 0;
  
  try {
    eval(code);
  } catch(e) {
    log(e);
    print(e.message, e.stack);
  }
}.bind({})});

function log() {
  self.console.log(arguments);
}