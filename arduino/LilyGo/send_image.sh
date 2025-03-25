# sh ./send_image.sh image.jpg

input_image=$1
pixel_values=$(magick "$input_image" -colorspace Gray -depth 8 txt:- | awk -F '[(),]' '/gray/ {printf "%02x", $3}')
rm -f temp.txt
echo $pixel_values > temp.txt
curl -X POST -F "file=@temp.txt" http://lilygo.local/
# curl http://lilygo.local/draw
# curl http://lilygo.local/draw
rm temp.txt