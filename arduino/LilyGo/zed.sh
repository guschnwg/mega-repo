idedata=$(pio -f -c vim run -t idedata )
value=${idedata#*\{}
json_only=$(echo '{' $value | awk -F== '{ print $1 }' )
echo $json_only
# echo $json_only | jq -r '.includes.build'
# echo $json_only | jq -r '.defines'