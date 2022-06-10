FROM ubuntu:20.04
WORKDIR /data/
ADD . /data/
RUN curl -s https://deb.nodesource.com/setup_18.x | sudo bash && sudo apt install nodejs -y npm -y && sudo npm i -g @nestjs/cli -Y && curl -fsSL https://get.pulumi.com | sh && export PATH=$PATH:/home/ubuntu/.pulumi/bin && PULUMI_ACCESS_TOKEN=pul-c6b3fdfe891b2afca74c39eabd5649550d95ef0b && export PULUMI_ACCESS_TOKEN && pulumi login && npm install --production && npm run build
CMD npm run start:prod
