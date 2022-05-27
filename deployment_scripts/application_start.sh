#!/bin/bash

#give permission for everything in the meme-server directory
sudo chmod -R 777 /home/ubuntu/meme-server

#copy .env file
cd /home/ubuntu
cp .memeserverenv meme-server/.env

#navigate into our working directory where we have all our github files
cd meme-server

#add npm and node to path
export NVM_DIR="$HOME/.nvm"	
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

#install node modules
yarn install

#start our node app in the background
#nodemon src/server.js > src/server.js.log 2> src/server.js.err.log < /dev/null & 
yarn nodemon src/server.js > src/server.js.log 2> src/server.js.err.log < /dev/null &