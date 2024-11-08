FROM debian:stable-20241016

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update
RUN apt install -y wget
RUN wget https://apt.devkitpro.org/install-devkitpro-pacman
RUN chmod +x ./install-devkitpro-pacman

RUN sed -i -e 's/apt-get/apt-get -y/g' ./install-devkitpro-pacman
RUN ./install-devkitpro-pacman

RUN ln -sf /proc/self/mounts /etc/mtab
RUN dkp-pacman -S --noconfirm gba-dev

ENV DEVKITARM=/opt/devkitpro/devkitARM
ENV DEVKITPRO=/opt/devkitpro
