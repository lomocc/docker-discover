FROM lomocc/nginx-node

RUN npm install

COPY log /var/log/nginx

WORKDIR /app

COPY ./ ./

CMD npm start
