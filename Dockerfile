FROM lomocc/nginx-node

COPY log /var/log/nginx

WORKDIR /app

COPY ./ ./

RUN npm install

CMD npm start
