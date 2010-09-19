var DNode = require("dnode");
var sys = require("sys");

DNode.connect(6060, function(remote) {
  var client = null;
  function say(target, text) {
    remote.send("PRIVMSG", target, text);
  }
  remote.auth("mysecret", function() {
    remote.client(function(c) {
      client = c;
      remote.addListener(function(from, to, msg) {
        onMessage(from, to, msg);
      });
    });
  });

  function onMessage(from, to, msg) {
    if (to == client.opt.nick) {
      say(from, "yo!");
    }
  }
});

