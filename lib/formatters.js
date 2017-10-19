/**
 * Created by Vincent on 2017/9/27.
 */
let version = require('../package.json').version;
/**
 * 输出 server 配置
 */
function formatServer(serverName, children) {
  return `server {
  listen 80;
  server_name ${serverName};
${children}
}`;
  // access_log /var/log/nginx/${info.host}.access.log main;
}
/**
 * 输出 server -> location 配置
 */
function formatServerLocation(location, proxyPass) {
  return `  location ${location} {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Powered-By "docker-discovery@${version}";
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://${proxyPass}/;
  }`;
}
/**
 * 输出 upstream 配置
 */
function formatUpstream(upstream, children) {
  // info.host encode
  return `upstream ${upstream} {
${children}
}`;
}
/**
 * 输出 upstream -> server 配置
 */
function formatUpstreamServer(proxyPass) {
  return `  server ${proxyPass};`;
}
module.exports = {
  formatServer,
  formatServerLocation,
  formatUpstream,
  formatUpstreamServer
};
