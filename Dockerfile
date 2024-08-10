FROM node:16.8.0

WORKDIR /app

ARG DB_URI
ARG AWS_ACCESS_KEY
ARG AWS_SECRET_ACCESS_KEY
ARG GH_TOKEN
ARG JWT_SECRET

ENV PORT                  8080
ENV DB_URI                ${DB_URI}
ENV AWS_ACCESS_KEY        ${AWS_ACCESS_KEY}
ENV AWS_SECRET_ACCESS_KEY ${AWS_SECRET_ACCESS_KEY}
ENV GH_TOKEN              ${GH_TOKEN}
ENV JWT_SECRET            ${JWT_SECRET}

# copy package.json and package-lock.json into working directory
COPY package*.json ./ 

RUN npm ci

#copy all code from project to cloud run's working directory
COPY . .

# Default command to be run, defined in package.json start script
CMD npm start