let {formatServer, formatServerLocation} = require('./formatters');
class Server{
  constructor(){
    this.children = {};
  }
  addServer(serverName, location, proxyPass) {
    let locations = this.children[serverName];
    if(!locations){
      this.children[serverName] = locations = {[location]: proxyPass};
    }else{
      locations[location] = proxyPass;
    }
  }
  formatString(proxyPassParser){
    return Object.keys(this.children).map((serverName)=>{
      let locations = this.children[serverName];
      let children = Object.keys(locations).map((location)=>{
        let proxyPass = locations[location];
        if(proxyPassParser){
          proxyPass = proxyPassParser(proxyPass);
        }
        return formatServerLocation(location, proxyPass);
      }).join('\n');
      return formatServer(serverName, children);
    }).join('\n');
  }
  toString(){
    return Object.keys(this.children).join('\n');
  }
}
module.exports = Server;
