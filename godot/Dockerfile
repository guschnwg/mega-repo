FROM ubuntu:22.04

RUN apt-get update

# Ours
RUN apt-get install -y \
    pngquant \
    wget \
    git \
    unzip \
    curl \
    zip

WORKDIR /

# Copy godot_server to the root
COPY /server-editor.zip /server-editor.zip
RUN unzip /server-editor.zip
RUN mv /godot_server.x11.opt.tools.64 /godot_server
RUN chmod +x /godot_server

# Copy the Vita template to Godot folder
COPY /vita_template_3.6.beta.tpz /vita_template_3.6.beta.tpz
RUN mkdir -p /root/.local/share/godot/templates/3.6.beta
RUN unzip /vita_template_3.6.beta.tpz -d /root/.local/share/godot/templates/3.6.beta
# Fix that MacOS mess, TODO: Fix this in the template itself
RUN zip --delete /root/.local/share/godot/templates/3.6.beta/vita_release.zip "__MACOSX/*"

WORKDIR /
