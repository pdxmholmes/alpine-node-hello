FROM mhart/alpine-node:6

WORKDIR /service

ADD package.json /service
RUN [ "npm", "install" ]

ADD index.js /service

EXPOSE 5000
ENTRYPOINT [ "node", "/service/index.js" ]
