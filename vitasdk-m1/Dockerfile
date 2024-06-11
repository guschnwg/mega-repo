FROM bitnami/minideb

RUN apt-get update
RUN apt-get install -y make git-core cmake python-is-python3 curl wget sudo libbz2-dev bzip2 xz-utils

ENV VITASDK=/usr/local/vitasdk
ENV PATH=$VITASDK/bin:$PATH

RUN git clone https://github.com/SonicMastr/vdpm.git /vdpm

WORKDIR /vdpm
RUN ./bootstrap-vitasdk.sh
RUN ./install-all.sh

RUN rm -rf /vdpm

WORKDIR /
