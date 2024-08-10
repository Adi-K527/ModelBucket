FROM node:16.8.0

WORKDIR /app

#exposes port to run app on cloud run
ENV PORT 8080

# copy package.json and package-lock.json into working directory
COPY package*.json ./ 

RUN npm ci

#copy all code from project to cloud run's working directory
COPY . .

# Default command to be run, defined in package.json start script
CMD npm start