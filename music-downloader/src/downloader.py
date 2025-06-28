import yt_dlp as youtube_dl
import time

def download_music(url, output_folder = None):
    to_return = None

    def my_hook(d):
        nonlocal to_return
        if d['status'] == 'finished':
            to_return = d['info_dict']['filepath'].replace('./download/', '').replace(".webm", ".mp3")

    download(url, {
        'format': 'bestaudio/best',  # Select best audio quality available
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',       # Or 'm4a', 'opus', 'wav', etc.
            'preferredquality': '0',       # '0' is highest quality for mp3
        }],
        'postprocessor_hooks': [my_hook],
    }, output_folder)

    while not to_return:
        time.sleep(1)

    return to_return

def download_video(url, output_folder = None):
    return download(url, {}, output_folder)

def download(url, opts = {}, output_folder = None):
    output_folder = output_folder or "default"
    to_return = None

    def my_hook(d):
        nonlocal to_return
        if d['status'] == 'finished':
            to_return = d['filename'].replace('./download/', '')

    ydl_opts = {
        **opts,
        'outtmpl': f'./download/%(extractor_key)s/{output_folder}/%(id)s.%(ext)s',
        'progress_hooks': [my_hook],
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        # Download and save in the current directory
        ydl.download([url])

    while not to_return:
        time.sleep(1)

    return to_return
