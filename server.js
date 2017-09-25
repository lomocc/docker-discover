#!/usr/bin/env node

var fs = require('fs-extra');
var Docker = require('dockerode');
var process = require('child_process');//直接调用命令

var nginx_conf_file  = '/etc/nginx/conf.d/default.conf';

var docker = new Docker(); //defaults to above if env variables are not used
/**
 * 获取容器在内网的 ip 地址
 * @param networks
 * @returns {*}
 */
function getNetworks(networks) {
  var info = networks.bridge || networks.host;
  if(info){
    return info;
  }
  // fix key xxx_default
  for (var key in networks){
    if(networks[key])
      return networks[key];
  }
}
/**
 * 往字典里追加数据
 * @param dict
 * @param name
 * @param value
 */
function appendDictValue(dict, name, value) {
  if(!dict[name]){
    dict[name] = [value];
  }else{
    dict[name] = dict[name].concat([value]);
  }
}
function renderServer(info) {
  return `
server {
  listen 80;
  server_name ${info.host};
  # access_log /var/log/nginx/${info.host}.access.log main;
  {{children}}
}
`;
}
function renderLocation(info) {
  return `
  location ${info.path} {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_pass http://${info.ip}:${info.port}/;
  }
`;
}
/**
 * 刷新 nginx_conf_file 配置
 */
function updateNginxConf() {
  // 列出所有容器
  docker.listContainers(function (err, containers) {
    var containerMap = {}; // 应用
    var containerMap_unserver = {};// 未启动的应用
    containers.forEach(function (containerInfo) {
      var name = containerInfo.Names[0].substr(1);
      var port = (containerInfo.Labels.PORT || '80').trim();
      var virtualHosts = (containerInfo.Labels.VIRTUAL_HOST || '').split(';'); // 多域名直接以分号分隔
      var networksInfo = getNetworks(containerInfo.NetworkSettings.Networks) || {IPAddress: ''};
      var ip = networksInfo.IPAddress;

      virtualHosts.forEach(function (virtualHostStr) {
        var virtualHost = virtualHostStr.trim();
        var indexSep = virtualHost.indexOf('/');
        var host;
        var path;
        if(indexSep != -1){
          host = virtualHost.substring(0, indexSep);
          path = virtualHost.substring(indexSep);

          if(!/\/$/.test(path)){
            path = path + '/';
          }
        }else{
          host = virtualHost;
          path = '/';
        }

        var info = {host, path, ip, port};
        if(host && ip) {
          appendDictValue(containerMap, name, info);
        }else{
          // unserver
          appendDictValue(containerMap_unserver, name, info);
        }
      });
    });

    // 生成 default.conf
    var serverConfigMap = {};
    Object.keys(containerMap).forEach(function (name) {
      var infoArr = containerMap[name];
      infoArr.forEach(function (info) {
        if(!serverConfigMap[info.host]){
          serverConfigMap[info.host] = {
            text: renderServer(info),
            children: []
          };
        }
        serverConfigMap[info.host].children.push(renderLocation(info));
      });
    });
    var nginxConfigData = Object.keys(serverConfigMap).map(function (host) {
      var serverInfo = serverConfigMap[host];
      return serverInfo.text.replace('{{children}}', serverInfo.children.join('\n'));
    }).join('');
    // end

    // 更新 nginx.conf 并且重启 nginx
    if(nginxConfigDataLast != nginxConfigData) {
      var firstRun = nginxConfigDataLast == undefined;
      nginxConfigDataLast = nginxConfigData;
      console.log('________server________');
      console.log(nginxConfigData);
      var unserver = Object.keys(containerMap_unserver);
      console.log('________unserver________');
      console.log(unserver.join('\n'));

      fs.outputFileSync(nginx_conf_file, nginxConfigData);

      firstRun?nginxStart():nginxReload();
    }
  });
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
// function whoami() {
//   console.log('________whoami________');
//   process.exec('whoami', function (error, stdout, stderr) {
//     if (error !== null) {
//       console.log('[error]' + error);
//     } else {
//       console.log('[success]' + stdout);
//     }
//   });
// }
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

var nginxConfigDataLast;

var DELAY = 5000; // 轮询间隔

// 每隔 5 秒尝试刷新一次
setInterval(function() {
  updateNginxConf();
}, DELAY);

updateNginxConf();// first
