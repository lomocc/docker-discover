// let data = require('./data.json');
let NginxConf = require('./NginxConf');

// console.log(data);

function parseNginxConf(containers) {
  let nginxConf = new NginxConf();
  containers.forEach(function (containerInfo) {
    let upstreamId = containerInfo.ImageID.substr(7);
    let name = containerInfo.Names[0].substr(1);
    let virtualHosts = (containerInfo.Labels.VIRTUAL_HOST || '').split(';'); // 多域名直接以分号分隔
    let proxyPass = getNetworks(containerInfo.NetworkSettings.Networks).IPAddress;
    // nginx.conf: upstream
    nginxConf.addUpstream(upstreamId, proxyPass);

    virtualHosts.forEach(function (virtualHostStr) {
      let virtualHost = virtualHostStr.trim();
      let indexSep = virtualHost.indexOf('/');
      let serverName;
      let location;
      if(indexSep != -1){
        serverName = virtualHost.substring(0, indexSep);
        location = virtualHost.substring(indexSep);

        if(!/\/$/.test(location)){
          location = location + '/';
        }
      }else{
        serverName = virtualHost;
        location = '/';
      }
      if(serverName && proxyPass) {
        // nginx.conf: server
        nginxConf.addServer(serverName, location, proxyPass);
      }else{
        // unserver
        nginxConf.addUnserver(name, location, proxyPass);
      }
    });
  });
  return nginxConf;
}
function updateNginxConf(nginxConf){
  // 生成 default.conf
  let upstreamStr = nginxConf.formatUpstreamString();
  let serverStr = nginxConf.formatServerString();
  let nginxConfigData = `${upstreamStr}\n${serverStr}\n`;

  // 更新 nginx.conf 并且重启 nginx
  if(global.nginxConfigDataLast != nginxConfigData) {
    let firstRun = global.nginxConfigDataLast == undefined;
    global.nginxConfigDataLast = nginxConfigData;
    console.log('________server________');
    console.log(nginxConfigData);
    console.log('________unserver________');
    console.log(nginxConf.formatUnserverString());

    fs.outputFileSync(nginx_conf_file, nginxConfigData);

    firstRun?nginxStart():nginxReload();
  }
}
/**
 * 获取容器在内网的 ip 地址
 * @param networks
 * @returns {*}
 */
function getNetworks(networks) {
  let info = networks.bridge || networks.host;
  if(info){
    return info;
  }
  // fix key xxx_default
  for (let key in networks){
    if(networks[key])
      return networks[key];
  }
  return {IPAddress: ''};
}
function nginxStart() {
  console.log('________nginx -g "daemon off;"________');
  process.exec('nginx -g "daemon off;"', function (error, stdout, stderr) {
    if (error !== null) {
      console.log('[error]' + error);
    } else {
      console.log('[success]' + stdout);
    }
  });
}
function nginxReload() {
  console.log('________nginx -s reload________');
  process.exec('nginx -s reload', function (error, stdout, stderr) {
    if (error !== null) {
      console.log('[error]' + error);
    } else {
      console.log('[success]' + stdout);
    }
  });
}
module.exports = function (data) {
  data && updateNginxConf(parseNginxConf(data));
};
