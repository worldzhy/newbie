FROM alpine
WORKDIR /data/
ADD . /data/
RUN apk update && apk add nodejs npm && npm i -g @nestjs/cli && npm install --production && npm run build
CMD npm run start:prod
