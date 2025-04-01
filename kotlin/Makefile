IMAGE = gradle:8.13.0-jdk21
FOLDER = /home/gradle/project
PWD = $(shell pwd)
GRADLE = docker run --rm -u gradle -v $(PWD):$(FOLDER) -w $(FOLDER) $(IMAGE)
JAR_NAME = project-1.0-SNAPSHOT-standalone

clean:
	$(GRADLE) gradle clean

setup:
	docker pull gradle:8.13.0-jdk21

build:
	$(GRADLE) gradle build

run:
	$(GRADLE) java -jar build/libs/$(JAR_NAME).jar