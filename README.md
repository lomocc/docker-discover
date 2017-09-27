# Docker Discovery (Web)

Docker Web 容器转发管理

## 为什么用它

解决多容器共享主机时的域名分配问题，启动容器后会 **自动** 扫描本机 Docker 容器，并写入 nginx 配置。

## 启动 Docker Discovery

```
docker run -itd -p 80:80 -v /var/run/docker.sock:/var/run/docker.sock:ro lomocc/discovery
```

## 参数说明
* network

```
--network bridge
```
（docker run 中默认为 bridge，docker-compose 需要指定 network_mode: "bridge"）
* VIRTUAL_HOST

```
--label VIRTUAL_HOST=www.a.com/api;www.b.com/test
```
多域名使用 **;** 分隔

## docker run:

```
docker run -itd --label VIRTUAL_HOST=www.a.com/api;www.b.com/test example-image
```
## docker-compose.yml:

```
version: '3'
services:
  example:
    image: example-image
    network_mode: "bridge"
    labels:
      - VIRTUAL_HOST=www.a.com/api;www.b.com/test
```
## 配置本地 hosts 文件:

```
10.82.12.86 www.example.com
```
打开浏览器访问 *www.example.com/api*

## 注意事项
仅支持通过 80 端口。
