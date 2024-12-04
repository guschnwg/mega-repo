FROM ubuntu:22.04

RUN apt update
RUN apt install wget unzip python2 build-essential -y
RUN ln -s /usr/bin/python2 /usr/bin/python

RUN wget https://codeberg.org/andybalaam/igcc/archive/igcc-0.2.zip
RUN unzip igcc-0.2.zip

WORKDIR /igcc

CMD ["./igcc"]

# docker build -t igcc .
# docker run -it igcc
