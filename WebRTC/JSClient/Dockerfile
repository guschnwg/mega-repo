FROM node:20.11.1

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Install dependencies
WORKDIR /code
COPY . /code
RUN npm install

# Start the server
CMD ["node", "client"]
