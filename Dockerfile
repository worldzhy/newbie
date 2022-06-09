FROM alpine
WORKDIR /data/
ADD . /data/
RUN apk update && apk add nodejs npm && npm i -g @nestjs/cli && curl -fsSL https://get.pulumi.com | sh && pulumi login && npm install --production && npm run build
CMD npm run start:prod
