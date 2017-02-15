FROM node:4-onbuild

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /Users/jlroo/clothesDB/
RUN npm install

# Bundle app source
COPY . /Users/jlroo/clothesDB/

EXPOSE 8080
CMD [ "npm", "start" ]
