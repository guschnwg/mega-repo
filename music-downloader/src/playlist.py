# from this import s
import re
from bs4.element import Script
import requests
from bs4 import BeautifulSoup
import codecs
import json
from downloader import download_music
from mutagen.easyid3 import EasyID3
from mutagen.id3 import APIC, ID3

def download_playlist(playlist_id):
    # Fetch the URL
    url = f"https://music.youtube.com/playlist?list={playlist_id}"
    response = requests.get(url, headers={
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    })
    if not response.ok:
        print(f"Failed to fetch playlist: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, features="html.parser")
    if not soup.body:
        return

    sibling = soup.body.find('ytmusic-app')
    if not sibling:
        return

    script_tag_value = sibling.previous
    if not script_tag_value or not isinstance(script_tag_value, Script):
        return

    regex = r"}\);initialData\.push\((.*)\);ytcfg"
    # bytes = codecs.decode(script_tag_value, 'unicode_escape')
    # decoded_script_tag_value = str(bytes)
    matches = re.findall(regex, str(script_tag_value))

    if len(matches) == 0:
        return

    data_regex = r"data: '(.*)'}"
    data_match = re.search(data_regex, matches[0])
    if not data_match:
        return

    print(playlist_id)

    data = data_match.group(1)
    bytes = codecs.decode(data.replace("\\/", "/"), 'unicode_escape')
    fixed = bytes.encode('latin1').decode('utf-8')

    parsed_data = json.loads(str(fixed))
    renderer = parsed_data["contents"]["twoColumnBrowseResultsRenderer"]
    something = renderer["secondaryContents"]["sectionListRenderer"]["contents"]

    album_data = renderer["tabs"][0]["tabRenderer"]["content"]["sectionListRenderer"]["contents"][0]["musicResponsiveHeaderRenderer"]
    if "straplineTextOne" in album_data:
        artist_name = album_data["straplineTextOne"]["runs"][0]["text"]
    else:
        artist_name = album_data["title"]["runs"][0]["text"]

    album_name = album_data["title"]["runs"][0]["text"]
    cover_url = album_data["thumbnail"]["musicThumbnailRenderer"]["thumbnail"]["thumbnails"][-1]["url"]
    cover_response = requests.get(cover_url, allow_redirects=True)
    album_cover = APIC(encoding=3, mime='image/jpg', type=3, desc=u'Cover', data=cover_response.content)

    if "musicShelfRenderer" in something[0]:
        songs = something[0]["musicShelfRenderer"]["contents"]
    else:
        songs = something[0]["musicPlaylistShelfRenderer"]["contents"]


    for i, song in enumerate(songs):
        renderer = song["musicResponsiveListItemRenderer"]
        music_renderer = renderer["overlay"]["musicItemThumbnailOverlayRenderer"]["content"]["musicPlayButtonRenderer"]
        if "playNavigationEndpoint" not in music_renderer:
            continue

        video_id = music_renderer["playNavigationEndpoint"]["watchEndpoint"]["videoId"]
        name = renderer["flexColumns"][0]["musicResponsiveListItemFlexColumnRenderer"]["text"]["runs"][0]["text"]
        print(name)
        filepath = download_music(f"https://www.youtube.com/watch?v={video_id}", f"{playlist_id}/")

        audio = EasyID3(f"./download/{filepath}")
        audio["title"] = name
        audio["artist"] = artist_name
        audio["album"] = album_name
        audio['albumartist'] = artist_name
        audio["tracknumber"] = str(i + 1)
        audio.save()
        audio = ID3(f"./download/{filepath}")
        audio["APIC"] = album_cover
        audio.save(v2_version=3)

playlists = [
    'OLAK5uy_kDBTPFjTRerD0gAG3g4Xs3UxGQSzZBoZQ',
    'PL-jLSD1zyBYt7ykqJIHwxnG6A20IWeHW3',
    'OLAK5uy_krvx3FeVGumNUfYCsbaL0ikF--a7KJ55U',
    'OLAK5uy_kYC_6pF5jgvbondF2-8YOWivwSW6fIPR4',
    'OLAK5uy_lfNmExJs6xV-8ApZL4zicCfFVzfv-w8cI',
    'OLAK5uy_li-h250L42zyP_1urifS7LzBM3Zck2h50',
    'OLAK5uy_lL9dW1Y3Mm0MHkCrvhc12h1J3Qqrzj7-I',
    'OLAK5uy_lpc8rLjItlSSjL7woDmZ-hmICM84teAfY',
    'OLAK5uy_lSJ2zyW7qmIcIIB1ghyslF_HBOoApLbJM',
    'OLAK5uy_lzoqSoDPX9PH9TC6_jUP3URbLJdQXzRPo',
    'OLAK5uy_m0pvsZbcoyFZ4vqU7Q-umldSOtzyTfads',
    'OLAK5uy_mg4b5NRKEXE_o0nfD9KAnNdC8-wA7mDOU',
    'OLAK5uy_mltfO0w_z0RqazQgrDqny4l7a7kjj_mmA',
    'OLAK5uy_mRWFOwrFa0Yv9l3rfjZjKk3PM9PFh-TaE'
    'OLAK5uy_ncbxWnjKunOOgJ7N1XELrneNgiaMMPXxA',
    'OLAK5uy_nE-SkwNA6lYF99wd-MHzJVqThnUIJGe3I',
    'OLAK5uy_nfuMzIzslkG8efD-YeTVpyu77rMq53sS4',
    'OLAK5uy_nIS-c5OD2p7LJU3n8S_tcu6q2QzBe-vzM',
    'OLAK5uy_nuUaMipJ3x_Kye-IiE1WFQ14y1v26Q6uw',
    'OLAK5uy_nWjwSxBqG1AlCAxcMzZTVcbt9MP-v1Ypk',
]
for playlist_id in playlists:
    try:
        download_playlist(playlist_id)
    except Exception as e:
        print(f"Error downloading playlist {playlist_id}: {e}")
