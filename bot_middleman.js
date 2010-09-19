var irc = require("irc");
var DNode = require("dnode");
var client = new irc.Client("localhost", "raimob0t", {
  userName: "lol",
  realName: "Seppo Taalasmaa",
  showErrors: true,
  channels:["#channel"]
});

DNode(function(rpcClient,conn) {
  var authenticated = false;
  var addedListener = null;
  this.auth = DNode.sync(function(secret) {
    if (secret == "mysecret")
      authenticated = true;
  });
  this.client = DNode.sync(function() { return client; });
  this.addListener = authReq(function(f) {
    addedListener = f;
    client.addListener("message", f);
  });
  this.send = authReq(function() {
    client.send.apply(client, arguments);
  });
  this.join = authReq(function(channel) {
    client.join(channel);
  });
  this.part = authReq(function(channel) {
    client.part(channel);
  });
  conn.addListener("end", function() {
    if (addedListener != null) {
      client.removeListener("message", addedListener);
    }
  });
  
  function authReq(f) {
    return function() {
      if (!authenticated) {
        console.log("Disconnecting unauthorized client");
        conn.stream.end();
        return;
      }
      f.apply(f, arguments);
    };
  } 
}).listen(6060);

