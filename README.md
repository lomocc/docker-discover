# Docker Manager (Web)

Docker Web 容器管理

## 为什么用它

解决多容器共享主机时的域名分配问题，启动容器后会 **自动** 扫描本机 Docker 容器，并写入 nginx 配置。

## 启动 Docker Manager

```
docker run -itd -p 80:80 -v /var/run/docker.sock:/var/run/docker.sock:ro lomocc/discovery
```

## 启动项目

* docker run:

```
docker run -itd --label VIRTUAL_HOST=www.example.com/api example-image
```
* docker-compose.yml:

```
version: '3'
services:
  example:
    image: example-image
    network_mode: "bridge"
    labels:
      - VIRTUAL_HOST=www.example.com/api
```
* 配置本地 hosts 文件:

```
10.82.12.86 www.example.com
```
* 打开浏览器访问 *www.example.com/api*

## 注意事项
项目内请使用 **80** 端口暴露服务

## todo
* 支持多域名
