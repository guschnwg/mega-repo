FROM python:3.11.7
RUN pip install --upgrade youtube-dl
RUN pip install --upgrade yt-dlp
RUN apt-get install libmagic1
RUN pip install --upgrade python-magic
EXPOSE 8080
COPY main.py /main.py
CMD ["python", "/main.py"]
