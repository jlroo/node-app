# Distributed Systems
### MEAN (Mongo, Express, -Angular, Node) APP

This is a simple Node.js web application clothing archive application using [Express 4](http://expressjs.com/).

## Running Docker-compose
To run the app with docker you just need to run:

### Download the repo
```sh
git clone git@github.com:jlroo/clothesdb.git
cd clothesdb
```

Then run the docker-compose command, if all goes well you should something similar at the end:

```
> docker-compose up
...
...
...
mongo_1  | 2017-02-14T23:37:11.867+0000 I NETWORK  [thread1] waiting for connections on port 27017
web_1    | npm info it worked if it ends with ok
web_1    | npm info using npm@2.15.11
web_1    | npm info using node@v4.7.3
web_1    | npm info prestart adsapp@
web_1    | npm info start adsapp@
web_1    |
web_1    | > adsapp@ start /usr/src/app
web_1    | > node server.js
web_1    |
mongo_1  | 2017-02-14T23:37:12.033+0000 I FTDC  
mongo_1  | 2017-02-14T23:37:16.438+0000 I NETWORK  
web_1    | App running on port 8080
```

To verify the status and ports of the app run:

```sh
> docker-compose ps

Name                 Command          State          Ports
------------------------------------------------------------------------
clothesdb_mongo_1   /entrypoint.sh mongod   Up      27017/tcp
clothesdb_web_1     npm start               Up      0.0.0.0:80->8080/tcp

```

If all is correct the app should be running in your docker local machine, to confirm the ip address you can run, after confirming the app ip address you can go to the browser `192.168.99.100` :

```sh
>docker-machine ip
192.168.99.100
```

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [MongoDB](https://mongodb.com/) installed.

### Download from source

- MongoDB Install
[https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)
- Nodejs
[https://nodejs.org/en/download/](https://nodejs.org/en/download/)

## Mac Brew install
Using the package manager brew we can install both mongodb and node

```sh
brew install mongodb
brew install node
```
Now before we can start mongo we need to create the data folder using the following command: `mkdir -p /data/db`
Now we can start mongo by running `mongod` command and letting the connection open or we can run mongod -d :

```
> mongod
2017-02-14T18:04:10.091-0600 I CONTROL  [initandlisten] MongoDB starting : pid=78225 port=27017 dbpath=/data/db
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] db version v3.4.1
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] git version: 5e103c4f5583e2566a45d740225dc250baacfbd7
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] OpenSSL version: OpenSSL 1.0.2j  26 Sep 2016
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] allocator: system
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] modules: none
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] build environment:
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten]     distarch: x86_64
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten]     target_arch: x86_64
2017-02-14T18:04:10.092-0600 I CONTROL  [initandlisten] options: {}
...
2017-02-14T18:04:13.464-0600 I CONTROL  [initandlisten]
2017-02-14T18:04:13.502-0600 I NETWORK  [thread1] waiting for connections on port 27017
```

Now for this part you need to change the database configurations, located in `../config/db.js` to your localhost or virtual machine ip address if all looks good we can start the server.

```javascript
module.exports = {
                                  // set to mongodb://mongo/box for docker-compose
    'url' : 'mongodb://mongo/box' // <--- CHANGE HERE Localhost/box
};
```
To start the server go inside the project folder `../clothesdb` and run the following command, if everything is correct you should see the following message:

```sh
> node server.js
App running on port 8080
```

Your app should now be running on [localhost:8080](http://localhost:8080/).

# Commands to build a ECS2 container in AWS using docker Hub image

Useful resources:
- [AWS ECS CLI Cluster Tutorial Create](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_tutorial.html#ECS_CLI_tutorial_cluster_create)
- [Docker Basics](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html#use-ecr)

### Create a Dockerfile inside the folder of the application.

```sh
FROM node:4-onbuild

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./../clothesDB/
RUN npm install

# Bundle app source
COPY . ./../clothesDB/

EXPOSE 8080
CMD [ "npm", "start" ]
```

### Now we can create a local docker image to push to docker Hub and use it later to build the AWS docker image.
Inside the app folder containing the Dockerfile build the docker image:

`docker build -t jlroo/clothesdb:latest . `

After the image is build make sure that the name of the local image follows the convention of docker Hub, `username/docker_image`

`docker push jlroo/clothesdb`

Now we should have an image in our docker Hub that we are going to use with docker-compose to pull our app from docker Hub.
Path to the docker Hub image: `docker.io/jlroo/clothesdb`

# Amazon ECS cluster setup

### Configure AWS ECS Command Line
```
~/.ecs/config
[ecs]
cluster                     = node-app
aws_profile                 = jlroo
region                      = us-east-1
aws_access_key_id           = xxxxxxxxxxxxxxxx
aws_secret_access_key       = xxxxxxxxxxxxxxxxxxxxxxxxxxxx
compose-project-name-prefix = ecscompose-
compose-service-name-prefix = ecscompose-service-
cfn-stack-name-prefix       = amazon-ecs-cli-setup-
```

### Create a ECS2 Cluster
Now lets create a cluster with 2 instances, you should get a similar output:
```
> ecs-cli up --force --keypair jlroo --capability-iam --size 2 --instance-type t2.small

INFO[0000] Created cluster                               cluster=node-app
INFO[0001] Waiting for your cluster resources to be created...
INFO[0001] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
INFO[0062] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
INFO[0123] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
INFO[0184] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
```

The cluster is now up and runnig and we need to add tasks with the docker images. To do that we need to
create an YML file with the parameters to upload the docker containers:

### Docker Compose file (YAML)
This file will help us to create pull the images from docker Hub, create connections between
the nodejs app and the mongodb service, also open the port for the app and more (see aws docs):

```
> docker-compose.yml

version: "2"
services:
  web:
    image: docker.io/jlroo/clothesdb
    ports:
      - "80:8080"
    links:
      - mongo
  mongo:
    image: mongo
    volumes:
      - /data/mongodb/db:/data/db
```

After creating the compose.yml file we are ready to deploy the compose File to a the Cluster. If we are inside
the app directory: `ecs-cli compose up` We can also enter the full path to the YAML file: `ecs-cli compose --file docker-compose.yml up`

You should see a similar output:

```
jlroo@jlroo~/clothesDB> ecs-cli compose up
WARN[0000] Skipping unsupported YAML option...           option name=networks
WARN[0000] Skipping unsupported YAML option for service...  option name=networks service name=mongo
WARN[0000] Skipping unsupported YAML option for service...  option name=networks service name=web
INFO[0000] Using ECS task definition                     TaskDefinition="ecscompose-clothesDB:4"
INFO[0000] Starting container...                         container="acdf3435-ee54-418b-bdcf-05f3ed210b52/mongo"
INFO[0000] Starting container...                         container="acdf3435-ee54-418b-bdcf-05f3ed210b52/web"
INFO[0000] Describe ECS container status                 container="acdf3435-ee54-418b-bdcf-05f3ed210b52/web"
INFO[0000] Describe ECS container status                 container="acdf3435-ee54-418b-bdcf-05f3ed210b52/mongo"
...                 ....              ....            ...                 ....              ....
INFO[0049] Describe ECS container status                 container="acdf3435-ee54-418b-bdcf-05f3ed210b52/mongo"
INFO[0061] Started container...                          container="acdf3435-ee54-418b-bdcf-05f3ed210b52/web"
INFO[0061] Started container...                          container="acdf3435-ee54-418b-bdcf-05f3ed210b52/mongo"
```
Now app should be up and running in the open port :80 of the cluster web container. We can see the
running containers in the cluster with the following command: `ecs-cli ps`

```
> ecs-cli ps
Name                                        State    Ports                        TaskDefinition
acdf3435-ee54-418b-bdcf-05f3ed210b52/web    RUNNING  54.000.000.225:80->8080/tcp  ecscompose-clothesDB:4
acdf3435-ee54-418b-bdcf-05f3ed210b52/mongo  RUNNING                               ecscompose-clothesDB:4
de2ce5d3-9e4c-49da-8ff9-c6a1a55a5da3/mongo  RUNNING                               ecscompose-clothesDB:4
de2ce5d3-9e4c-49da-8ff9-c6a1a55a5da3/web    RUNNING  0.0.0.0:80->8080/tcp         ecscompose-clothesDB:4
```

When done we can DELETE the instances and the cluster with the following command: `ecs-cli down --force`
