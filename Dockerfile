# Use an official Node runtime as a parent image
FROM node:18.20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /app
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install --production

# Bundle app source inside Docker image
COPY . .
# Heroku pupeteer
RUN npm run heroku-postbuild

# Define environment variable
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y \
    libnss3 \

# Run the app when the container launches

CMD ["node", "index.js"]
