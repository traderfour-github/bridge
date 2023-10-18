FROM node:19.9.0-alpine AS build

# For handling Kernel signals properly
RUN apk add --no-cache git

# Set the default working directory for the app
WORKDIR /usr/src/app

# Copy package.json, package-lock.json
COPY package*.json ./

# Install dependencies.
RUN npm install --force

# Necessary to run before adding application code to leverage Docker cache
RUN npm cache clean --force

# Add src project
ADD . .

RUN npm run build

EXPOSE 3000
EXPOSE 3001

# Start project
CMD ["npm", "run", "start:prod"]
