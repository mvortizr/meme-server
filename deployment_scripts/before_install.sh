#!/bin/bash

#download node and npm using node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16.11.1
nvm use 16.11.1
npm install --global yarn

#create our working directory if it doesnt exist
DIR="/home/ubuntu/meme-server"
if [ -d "$DIR" ]; then
  echo "${DIR} exists"
  rm -rf ${DIR}
  mkdir ${DIR}
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi
