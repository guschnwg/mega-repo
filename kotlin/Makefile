IMAGE = gradle:8.13.0-jdk21
CHROME_IMAGE = selenium/standalone-chrome:latest
FOLDER = /home/gradle/project
PWD = $(shell pwd)
GRADLE = docker run --rm -u gradle -v $(PWD):$(FOLDER) -w $(FOLDER) $(IMAGE)
JAR_NAME = project-1.0-SNAPSHOT-standalone
CHROME = docker run --platform linux/amd64 -d -p 4444:4444 -p 7900:7900 --shm-size="2g" --rm --name chrome $(CHROME_IMAGE)

clean:
	$(GRADLE) gradle clean

setup:
	docker pull gradle:8.13.0-jdk21

build:
	$(GRADLE) gradle build
.PHONY: build

run:
	# java -jar build/libs/$(JAR_NAME).jar
	docker kill chrome || true
	$(CHROME)
	sleep 10
	$(GRADLE) java -jar build/libs/$(JAR_NAME).jar
.PHONY: run