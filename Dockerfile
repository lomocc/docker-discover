FROM lomocc/nginx-node

COPY log /var/log/nginx

WORKDIR /app

COPY ./ ./

RUN yarn

CMD npm start
