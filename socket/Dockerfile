FROM ubuntu:22.04

RUN apt update -y
RUN apt install curl vim lsof -y

RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
ENV NODE_VERSION=18.14.0
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN npm i -g npm@latest
RUN npm i -g cross-env nodemon dotenv

RUN mkdir -p /home/ubuntu/socket

WORKDIR /home/ubuntu/socket

COPY . .

RUN npm i

RUN npm run build
