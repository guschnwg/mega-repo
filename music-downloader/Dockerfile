FROM python:3.11.7
RUN pip install --upgrade youtube-dl
RUN pip install --upgrade yt-dlp
RUN pip install --upgrade requests
RUN pip install --upgrade beautifulsoup4
RUN pip install --upgrade mutagen
RUN apt-get update
RUN apt-get install libmagic1 ffmpeg -y
RUN pip install --upgrade python-magic
EXPOSE 8080
WORKDIR /code
COPY src src
CMD ["python", "src/main.py"]
