FROM debian

COPY . .

RUN apt-get update
RUN apt-get install -y make git-core cmake python-is-python3 curl wget sudo libbz2-dev bzip2 xz-utils

ENV VITASDK=/usr/local/vitasdk
ENV PATH=$VITASDK/bin:$PATH

WORKDIR /vdpm
RUN ./bootstrap-vitasdk.sh
RUN ./install-all.sh

WORKDIR /
