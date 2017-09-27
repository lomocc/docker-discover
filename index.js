let Docker = require('dockerode');
let updateNginx = require('./lib/updateNginx');
let docker = new Docker();

console.log(`version: ${require('./package.json').version}`);

const DELAY = 5000; // 轮询间隔

let updateNginxConf = ()=>{
  docker.listContainers((err, containers)=>{
    if(err){
      console.log('________docker ps error________');
    }else{
      updateNginx(containers);
    }
  });
};
// 每隔 5 秒尝试刷新一次
setInterval(updateNginxConf, DELAY);

updateNginxConf();// first run
