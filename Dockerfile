# Use an official Node runtime as a parent image
FROM node:18.20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /app
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install --production


RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libpango-1.0-0 \
    libgbm1 \
    libxshmfence1 \
    libx11-6 \
    libxext6 \
    libxcb1 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Bundle app source inside Docker image
COPY . .
# Heroku pupeteer
RUN npm run heroku-postbuild

# Define environment variable
ENV NODE_ENV=production


# Run the app when the container launches

CMD ["node", "index.js"]
