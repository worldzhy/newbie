FROM alpine
WORKDIR /data/
ADD . /data/
RUN apk update && apk --no-cache add nodejs npm curl && npm i -g @nestjs/cli && curl -fsSL https://get.pulumi.com | sh && pulumi login && npm install --production && npm run build
CMD npm run start:prod
