# sh ./send_text_as_image.sh black hi

magick -size 960x540 xc:$1 +repage \
 -size 960x540 -fill white -background None  \
 -font Comic-Sans-MS -gravity center caption:"$2" +repage \
 -gravity Center  -composite -strip  text.jpg

sh ./send_image.sh text.jpg
rm text.jpg
