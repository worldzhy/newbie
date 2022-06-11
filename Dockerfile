FROM ubuntu
WORKDIR /home/ubuntu/
ADD . /home/ubuntu/

# Update to fix 'Unable to locate package' error.
RUN apt update
RUN apt install -y curl

# Install nodejs
# Tip: The -y flag means we're not prompted to confirm our choices.
RUN curl -s https://deb.nodesource.com/setup_18.x | bash
RUN apt install -y nodejs

# Install nestjs
RUN npm install -y -g @nestjs/cli

# Install pulumi
RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH=$PATH:/root/.pulumi/bin
ENV PULUMI_ACCESS_TOKEN=pul-c6b3fdfe891b2afca74c39eabd5649550d95ef0b
RUN pulumi login

# Build application
RUN npm install --production && npm run build

# Start application
CMD npm run start:prod
