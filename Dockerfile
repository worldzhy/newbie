FROM ubuntu
WORKDIR /home/ubuntu/
ADD . /home/ubuntu/

# Update package list
RUN apt update

# Install nodejs
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
RUN curl -s https://deb.nodesource.com/setup_18.x | bash 
RUN apt install -y nodejs npm

# Install nestjs
RUN npm install -y -g @nestjs/cli

# Install pulumi
RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH=$PATH:/home/ubuntu/.pulumi/bin
ENV PULUMI_ACCESS_TOKEN=pul-c6b3fdfe891b2afca74c39eabd5649550d95ef0b
#RUN pulumi login
RUN find / -name pulumi

# Build application
RUN npm install --production && npm run build

# Start application
CMD npm run start:prod
