# Use Node 16 alpine as parent image
FROM node:18-alpine

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY package.json package-lock.json ./

# Copy the .env file into the container
COPY config.env config.env

# Set environment variables from the .env file
ENV $(cat config.env | grep -v ^# | xargs)

# Install dependencies
RUN npm install

# Copy the rest of project files into this image
COPY . .

# Expose application port
EXPOSE 3000

# Start the application
CMD npm start
