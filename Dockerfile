FROM node:10-alpine

RUN apk add bash

WORKDIR /var/service

COPY package.json /var/service
RUN [ "npm", "install", "--production" ]

COPY dist/index.js /var/service
COPY ./docker-entrypoint.sh /bin

EXPOSE 5000

ENTRYPOINT ["/bin/docker-entrypoint.sh"]
CMD ["server"]
