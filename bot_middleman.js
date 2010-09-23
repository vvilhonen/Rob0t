var irc = require("irc");
var sys = require("sys");
var DNode = require("dnode");
var client = new irc.Client("localhost", "Suppo", {
  userName: "lol",
  realName: "Seppo Taalasmaa",
  showErrors: true,
  channels:[]
});

DNode(function(rpcClient,conn) {
  var authenticated = false;
  var cleanups = [];
  this.auth = DNode.sync(function(secret) {
    if (secret == "mysecret")
      authenticated = true;
  });
  this.client = DNode.sync(function() { return client; });
  client.addListener("error", function(err) { sys.puts("middleman:"+err) });
  this.addListener = authReq(function(eventName, f) {
    client.addListener("message", f);
    cleanups.push(function() {
      client.removeListener("message", f);
    });
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
    for(ind in cleanups) {
      cleanups[ind]();
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

