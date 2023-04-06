FROM rgriffogoes/scraper-notebook

ENV JUPYTER_TOKEN giovanna

USER root

RUN sudo apt-get update
RUN sudo apt-get -y install build-essential

USER ${NB_UID}

RUN npm config set prefix $HOME
RUN npm install -g ijavascript
RUN ~/bin/ijsinstall --spec-path=full

RUN pip install spotipy numpy pandas matplotlib

WORKDIR "${HOME}"

# docker build -t giovanna-jupyter .
# docker run --rm -p 8888:8888 --name giovanna-jupyter --volume "${PWD}":/home/jovyan/work:rw giovanna-jupyter