FROM lomocc/nginx-node

COPY log /var/log/nginx

WORKDIR /app

COPY ./ ./

CMD npm start
