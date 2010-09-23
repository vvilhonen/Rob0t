var DNode = require("dnode");
var sys = require("sys");
var handlers = require("./mybot").handlers

function log(msg) {
  console.log((new Date()).toUTCString() + ": " + msg);
}

DNode.connect(6060, function(remote) {
  var client = null;
  remote.auth("mysecret", function() {
    remote.client(function(c) {
      client = c;
      client.say = function(target, text) {
        remote.send("PRIVMSG", target, text);
      };
      client.irc = remote;
      remote.addListener("message", function(from, to, msg) {
        onMessage(from, to, msg);
      });
    });
  });

  function onMessage(from, to, msg) {
    for(ind in handlers) {
      if (!handlers[ind](client, from, to, msg)) {
        break;
      }
    }
  }
});
