FROM ubuntu
WORKDIR /home/ubuntu/
ADD . /home/ubuntu/

## 1. Update to fix 'Unable to locate package' error.
RUN apt update
RUN apt install -y curl

## 2. Install (The -y flag means we're not prompted to confirm our choices.)
# Nodejs
RUN curl -s https://deb.nodesource.com/setup_18.x | bash
RUN apt install -y nodejs
# Nestjs
RUN npm install -y -g @nestjs/cli
# Pulumi
RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH=$PATH:/root/.pulumi/bin

## 3. Environment variables
# Node
ENV ENVIRONMENT=development
ENV PORT=3000
# Auth
ENV BCRYPT_SALT_ROUNDS=10
ENV JWT_EXPIRES_IN=6000s
ENV JWT_SECRET=your-own-jwt-secret
# Prisma
ENV DATABASE_URL="postgresql://postgres:postgres@postgres-1.cmkxbdo0yf63.rds.cn-northwest-1.amazonaws.com.cn:5432/postgres?schema=_basic"
# AWS - SQS
ENV SQS_LOGGER_QUEUE_URL=https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1
ENV SQS_EMAIL_QUEUE_URL=https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1
ENV SQS_SMS_QUEUE_URL=https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1
# AWS - Pinpoint
ENV PINPOINT_APP_ID=example-app-id
ENV PINPOINT_EMAIL_FROM_ADDRESS=email@example.com
ENV PINPOINT_SMS_SENDER_ID=example-sender-id
# Pulumi
ENV PULUMI_AWS_VERSION=v5.4.0
ENV PULUMI_ACCESS_TOKEN=pul-c6b3fdfe891b2afca74c39eabd5649550d95ef0b

## Build
RUN npm install --production && npm run build

## Start
RUN pulumi login
CMD npm run start:prod
