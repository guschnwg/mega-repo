FROM gradle:8.13.0-jdk21

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Build the application
RUN gradle build
