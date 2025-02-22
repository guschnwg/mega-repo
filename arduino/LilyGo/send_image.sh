input_image=$1

pixel_values=$(magick "$input_image" -colorspace Gray -depth 8 txt:- | awk -F '[(),]' '/gray/ {printf "%d,", $3}' | sed 's/,$//')

# Convert the comma-separated values into an array
IFS=',' read -r -a array <<< "$pixel_values"

# Get the total number of pixels
total_pixels=${#array[@]}

# Determine the chunk size (integer division)
chunk_size=$((total_pixels / 54))

ESP32_IP="http://lilygo.local"
send() {
    HEIGHT=$1  # Get height from parameter
    image_data=$2

    # Validate input
    if ! [[ "$HEIGHT" =~ ^[0-9]+$ ]]; then
        echo "Error: Please provide a valid height (integer)."
        exit 1
    fi

    # Send the data using cURL
    response=$(curl -X POST "$ESP32_IP/$HEIGHT" \
        -H "Content-Type: text/plain" \
        --data "$image_data")

    # Print the ESP32 response
    echo "ESP32 Response: $response"
}

# Print the values in 54 chunks
for ((i = 0; i < 54; i++)); do
    start=$((i * chunk_size))
    end=$((start + chunk_size))
    
    # Handle last chunk to include any remaining values
    if ((i == 53)); then
        end=$total_pixels
    fi
    
    pixels=$(echo "${array[@]:start:end-start}" | sed 's/ /,/g')
    send $(($i * 10)) $pixels
done