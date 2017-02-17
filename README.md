[ ![Codeship Status for jlroo/distributed](https://app.codeship.com/projects/7007bb40-d53a-0134-7e99-3a0ebfcad274/status?branch=master)](https://app.codeship.com/projects/202422)

# Distributed Systems
### MEAN (Mongo, Express, -Angular, Node) Application

This is a simple Node.js web application clothing archive application using [Express 4](http://expressjs.com/).

## Running the app with Docker-compose
To run the app with docker follow these steps, here is a link to download Docker: [http://www.docker.com](http://www.docker.com).

First make sure to set the path to the docker-machine in your bash profile:

```sh
set -gx DOCKER_TLS_VERIFY "1";
set -gx DOCKER_HOST "tcp://192.168.99.100:2376";
set -gx DOCKER_CERT_PATH "/PATH_TO_HOME/.docker/machine/machines/default";
set -gx DOCKER_MACHINE_NAME "default";
```

Now start the docker-machine with the command `docker-machine start default`

### Download the repo
```sh
git clone git@github.com:jlroo/clothesdb.git
cd clothesdb
```
Now inside the repository run `docker-compose up` command that uses the docker-compose.yml file to setup the docker containers if all goes well you should a similar output:

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

To verify the status of the machine and ports run the following command:

```sh
> docker-compose ps

Name                 Command          State          Ports
------------------------------------------------------------------------
clothesdb_mongo_1   /entrypoint.sh mongod   Up      27017/tcp
clothesdb_web_1     npm start               Up      0.0.0.0:80->8080/tcp

```

If all is correct the app should be running in your docker local machine, to confirm the  what is the ip address of your docker-machine you can run `docker-machine ip` command. After confirming the app ip address you can go to the browser [http://192.168.99.100](http://192.168.99.100) :

```sh
>docker-machine ip
192.168.99.100
```

# Running Locally

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
    'url' : 'mongodb://mongo/box'       // <--- UNCOMMENT IF USING DOCKER
    //'url' : 'mongodb://localhost/box' // <--- UNCOMMENT FOR LOCAL
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

## Local Repo to Docker Hub

Here are the steps on how to dockerize a NodeJS application and that image available in our docker Hub account [https://hub.docker.com/](https://hub.docker.com/). First create a Dockerfile inside the folder of the application.

```sh
FROM node:4-onbuild

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./../clothesDB/   # <- PATH TO LOCAL REPO
RUN npm install

# Bundle app source
COPY . ./../clothesDB/              # <- PATH TO LOCAL REPO

EXPOSE 8080
CMD [ "npm", "start" ]
```

Now we can create a local docker image to push to docker Hub and use it later to build the AWS docker image. Inside the app folder containing the Dockerfile build the docker image:

`docker build -t jlroo/clothesdb:latest . `

After the image should be part of your local images repo make sure that the name of the local image follows the convention of docker Hub, `username/docker_image` , then push your image to docker hub.

`docker push jlroo/clothesdb`

Here is a link to this app image in docker Hub [https://hub.docker.com/r/jlroo/clothesdb/](https://hub.docker.com/r/jlroo/clothesdb/) Now we should have an image in our docker Hub that we are going to use with docker-compose to pull our app from docker Hub. Path to the docker Hub image: `docker.io/jlroo/clothesdb`

# Amazon ECS cluster setup

### Configure AWS ECS Command Line

You can install AWS ECS Command Line tools from here [Installing the Amazon ECS CLI](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html). In mac we can install AWS ECS using brew: `brew install amazon-ecs-cli`

Now after installing ECS Command Line tools we need to setup the credentials.

```
> cat ~/.ecs/config

[ecs]
cluster                     = aws_cluster_name
aws_profile                 =
region                      = us-east-1
aws_access_key_id           = xxxxxxxxxxxxxxxx
aws_secret_access_key       = xxxxxxxxxxxxxxxxxxxxxxxxxxxx
compose-project-name-prefix = ecscompose-
compose-service-name-prefix = ecscompose-service-
cfn-stack-name-prefix       = amazon-ecs-cli-setup-
```

### Create a ECS2 Cluster
To create a custer make sure that you have a keypair in your AWS EC2 resources (ec2-key-pairs)[https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html]. Now lets use the ecs-cli command line tool to create a cluster with 2 instances. Make sure that `--keypair KEYNAME_ON_AWS` not your local keypair.pem , if everything works you should get a similar output:

```
> ecs-cli up --force --keypair jlroo --capability-iam --size 2 --instance-type t2.small

INFO[0000] Created cluster                               cluster=node-app
INFO[0001] Waiting for your cluster resources to be created...
INFO[0001] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
INFO[0062] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
INFO[0123] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
INFO[0184] Cloudformation stack status                   stackStatus="CREATE_IN_PROGRESS"
```

The cluster is now up and running and we need to add tasks using the docker images. To do that we need to
create an YAML (YML) file with the parameters to upload the docker containers:

### Docker Compose file (YAML)
This file will help us to create/pull the images from docker Hub, connect different applications. In this case the nodejs app and mongodb, we can also open the port for the app and more see [aws-docker-basics](http://docs.aws.amazon.com/AmazonECS/latest/developerguide/docker-basics.html).

Here is the docker-compose.yml file:

```
> docker-compose.yml

version: "2"
services:
  web:
    image: docker.io/jlroo/clothesdb  # <- PATH TO IMAGE IN DOCKER HUB
    ports:
      - "80:8080"
    links:
      - mongo
  mongo:
    image: mongo
    volumes:
      - /data/mongodb/db:/data/db     # <- DB PATH DOCKER IMAGE TO HOST
```

After creating the docker-compose.yml file we are ready to deploy it to the Cluster. Now if we are inside the app directory, just type: `ecs-cli compose up` or we can also enter the full path to the YAML file: `ecs-cli compose --file docker-compose.yml up`

You should see a similar output:

```
> ecs-cli compose up
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

Now app should be up and running, you can access the app in the selected open port of the cluster (:80) for the app web container. We can see also see the running containers in the cluster with the following command: `ecs-cli ps`

```
> ecs-cli ps
Name                                        State    Ports                        TaskDefinition
acdf3435-ee54-418b-bdcf-05f3ed210b52/web    RUNNING  54.000.000.225:80->8080/tcp  ecscompose-clothesDB:4
acdf3435-ee54-418b-bdcf-05f3ed210b52/mongo  RUNNING                               ecscompose-clothesDB:4
de2ce5d3-9e4c-49da-8ff9-c6a1a55a5da3/mongo  RUNNING                               ecscompose-clothesDB:4
de2ce5d3-9e4c-49da-8ff9-c6a1a55a5da3/web    RUNNING  0.0.0.0:80->8080/tcp         ecscompose-clothesDB:4
```

When done we can DELETE the instances and the cluster with the following command: `ecs-cli down --force`

# Using the API v1.0

To make API calls you are going to need to register and receive an apikey. After getting the API key you are going to need to authenticate your key to receive a user token.

## User authentication

Get the apikey from the user profile page and authenticate your key to get an API token:

`http://192.168.99.100/api/v1/auth`

```sh
> curl -X POST 'http://192.168.99.100/api/v1/auth?apikey=amcvLkRQaHMwLm1'

{
  "success":true,
  "message":"Enjoy your token!",
  "token":"iWUJXRFFmRGZSNEJDLjF1YmJpQ2VWcHRZZXgLm1ObVgxVylIj"
}

```

You should get an user token to make API queries.

### Testing API token

Using the token we test the API by sending a GET request, you should get a HOLA! message.
```sh
> curl -X GET 'http://localhost:8080/api/v1/?token=iWUJXRFFmRGZSNEJDLjF1YHMwLm1ObVgxV'
{"message":"Hola Bonjour API V.1.0"}
```

### POST Create new user
```sh
curl -X POST 'http://localhost:8080/api/v1/users/new?username=test&email=test@luc.edu&password=test1&token=eyJhbGciOiIISwiZmnGSlc'
{"message": "User created!"}

```

### GET All users

```sh
curl -X GET 'http://localhost:8080/api/v1/users?token=iWUJXRFFmRGZSNEJDLjF1YmJpQ2VWcHRZZXgyOXBsamcvLkRQaHMwLm1ObVgxV'

[
  {
    "_id": "58a51138f296b0740020c23a",
    "__v": 0,
    "local": {
      "apikey": "zDofwTaNtsIH6iQ9",
      "username": "jlroo",
      "password": "$2a$08$fVwJ1Pd0ACf3293egq8rZ/Eu",
      "email": "jrodriguezorjuela@luc.edu",
      "created": "2017-02-16T02:40:56.742Z",
      "items": []
    }
  },
  {
    "_id": "58a51452f296b0740020c23c",
    "__v": 0,
    "local": {
      "apikey": "xoyAZMB7QI6BQONC",
      "password": "$2a$08$ffs3Q3HcAplRvcRZXJZwHRSuK",
      "email": "test@40luc.edu",
      "username": "test",
      "created": "2017-02-16T02:54:10.743Z",
      "items": []
    }
  }
  ....
  ....
]
```
### DELETE Users with ID

```sh
curl -X GET 'http://localhost:8080/api/v1/users/58a51452f296b0740020c23c?token=iWUJXRFFmOXBsamcvLkRQaHMwLm1ObVgxV'
```
