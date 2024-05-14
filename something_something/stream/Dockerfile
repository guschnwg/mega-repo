FROM python:3.11.7
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install --upgrade mjpeg-streamer
EXPOSE 8080
COPY main.py /main.py
CMD ["python", "/main.py"]
