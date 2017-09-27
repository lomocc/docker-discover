let {formatUpstream, formatUpstreamServer} = require('./formatters');
class Upstream{
  constructor(){
    this.children = {};
  }
  addUpstream(upstream, proxyPass) {
    let proxyPasses = this.children[upstream];
    if(!proxyPasses){
      this.children[upstream] = [proxyPass];
    }else{
      if(proxyPasses.indexOf(proxyPass) == -1){
        proxyPasses.push(proxyPass);
      }
    }
  }
  proxyPassParser(proxyPass) {
    for(let upstream in this.children){
      if(this.children.hasOwnProperty(upstream)) {
        let proxyPasses = this.children[upstream];
        if(proxyPasses.length >= 2 && proxyPasses.indexOf(proxyPass) != -1){
          return upstream;
        }
      }
    }
    return proxyPass;
  }
  formatString(){
    return Object.keys(this.children)
      .map((upstream)=>{
        let proxyPasses = this.children[upstream];
        if(proxyPasses.length >= 2){
          let children = proxyPasses.map((proxyPass)=>formatUpstreamServer(proxyPass)).join('\n');
          return formatUpstream(upstream, children);
        }
      })
      .filter((data)=>data != null)
      .join('\n');
  }
}
module.exports = Upstream;
