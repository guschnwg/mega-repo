# idedata=$(pio -c vim run -t idedata )
# value=${idedata#*\{}
# json_only=$(echo '{' $value | awk -F== '{ print $1 }' )

json_only=$(cat .pio/build/t5-47-plus/idedata.json)
output=".clangd"

rm -f $output
echo "CompileFlags:" >> $output
echo "    Add:" >> $output
echo $json_only | jq -r '.includes.build | map("        - -I"+.) | join("\n")' >> $output
echo "" >> $output
echo $json_only | jq -r '.includes.compatlib | map("        - -I"+.) | join("\n")' >> $output
echo "" >> $output
echo $json_only | jq -r '.includes.toolchain | map("        - -I"+.) | join("\n")' >> $output
echo "" >> $output

echo $json_only | jq -r '.defines | map("        - -D"+.) | join("\n")' >> $output
echo "" >> $output

echo "        - -ferror-limit=0" >> $output
echo "" >> $output
echo "        - -std=gnu++11" >> $output
echo "" >> $output

# echo $json_only | jq -r '.cxx_flags | map("        - \""+.+"\"") | join("\n")' >> $output
# echo "" >> $output

echo $json_only | jq -r '"    Compiler: "+.cxx_path' >> $output
echo "" >> $output

echo "Diagnostics:" >> $output
echo "    Suppress:" >> $output
echo "        - pp_file_not_found" >> $output
echo "        - ovl_no_viable_member_function_in_call" >> $output
echo "        - attribute_section_invalid_for_target" >> $output
