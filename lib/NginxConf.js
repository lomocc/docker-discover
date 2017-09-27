let Upstream = require('./Upstream');
let Server = require('./Server');

class NginxConf{
  constructor(){
    this.upstream = new Upstream();
    this.server = new Server();
    this.unserver = new Server();
  }

  addUpstream(upstream, proxyPass) {
    this.upstream.addUpstream(upstream, proxyPass);
  }

  addServer(serverName, location, proxyPass) {
    this.server.addServer(serverName, location, proxyPass);
  }
  addUnserver(serverName, location, proxyPass) {
    this.unserver.addServer(serverName, location, proxyPass);
  }

  formatUpstreamString() {
    return this.upstream.formatString();
  }
  formatServerString() {
    return this.server.formatString((proxyPass)=>this.upstream.proxyPassParser(proxyPass));
  }
  formatUnserverString() {
    return this.unserver.toString();
  }
}
// let NginxConf = function () {
//   this.upstreamList = new UpstreamList();
//   this.serverList = new ServerList();
// };
// NginxConf.prototype.addUpstream = function (upstream, upstreamServer) {
//   this.upstreamList.addUpstream(upstream, upstreamServer);
// };
// NginxConf.prototype.addServer = function (serverName, location, proxyPass) {
//   this.serverList.addServer(serverName, location, proxyPass);
// };

module.exports = NginxConf;
