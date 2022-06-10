FROM ubuntu
WORKDIR /home/ubuntu/
ADD . /home/ubuntu/

# Install curl
#RUN apt-get install -y curl
RUN apt update

# Install nodejs
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
RUN curl -s https://deb.nodesource.com/setup_18.x | bash 
RUN apt install -y nodejs

# Install nestjs
RUN npm i -g @nestjs/cli -y

# Install pulumi
RUN curl -fsSL https://get.pulumi.com | sh 
RUN export PATH=$PATH:/home/ubuntu/.pulumi/bin
RUN export PULUMI_ACCESS_TOKEN=pul-c6b3fdfe891b2afca74c39eabd5649550d95ef0b
RUN pulumi login

# Build application
RUN npm install --production && npm run build

# Start application
CMD npm run start:prod
