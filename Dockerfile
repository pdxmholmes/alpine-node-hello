FROM node:10-alpine

WORKDIR /var/service

ADD package.json /var/service
RUN [ "npm", "install", "--production" ]

ADD dist/index.js /var/service

EXPOSE 5000
ENTRYPOINT [ "node", "/var/service/index.js" ]
