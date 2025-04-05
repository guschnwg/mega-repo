PWD = $(shell pwd)
FOLDER = /home/gradle/project

IMAGE = wfs-builder
GRADLE = docker run --rm -v $(PWD):$(FOLDER) -w $(FOLDER) --name $(IMAGE) $(IMAGE)

CHROME_IMAGE = selenium/standalone-chrome:latest
CHROME = docker run --rm  --platform linux/amd64 -d -p 4444:4444 -p 7900:7900 --shm-size="2g" --name chrome $(CHROME_IMAGE)

JAR_NAME = project-1.0-SNAPSHOT-standalone

setup:
	docker build . -t $(IMAGE)
.PHONY: setup

build:
	$(GRADLE) gradle build
.PHONY: build

run:
	# docker kill chrome || true
	# $(CHROME)
	# sleep 10
	# $(GRADLE) java -jar build/libs/$(JAR_NAME).jar

	java -jar build/libs/$(JAR_NAME).jar
.PHONY: run
