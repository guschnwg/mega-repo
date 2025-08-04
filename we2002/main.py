import binascii
from struct import unpack
import sys

def print_dict(obj, indent=0):
    if isinstance(obj, list) and len(obj) > 0 and all(isinstance(item, dict) for item in obj):
        for idx, item in enumerate(obj):
            print(f"{' ' * indent}{idx}:")
            print_dict(item, indent + 4)
    elif isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, dict) or isinstance(value, list):
                print(f"{' ' * indent}{key}:")
                print_dict(value, indent + 4)
            else:
                print(f"{' ' * indent}{key}: {value}")
    else:
        print(f"{' ' * indent}{obj}")

def print_dir_structure(dir, indent=-4):
    if isinstance(dir, list):
        for item in dir:
            print_dir_structure(item, indent=indent + 4)
    else:
        print(f"{' ' * indent}{dir['File Identifier']}")
        if 'Children' in dir and isinstance(dir["Children"], list):
            print_dir_structure(dir["Children"], indent=indent + 4)

def get_data(f_or_d, position, sector_size, data_per_sector):
    if isinstance(f_or_d, bytes):
        return f_or_d[position:position + data_per_sector]

    f_or_d.seek(position)
    return f_or_d.read(data_per_sector)

def get_sector_data(f_or_d, sector, per_sector, data_per_sector):
    return get_data(f_or_d, sector * per_sector, per_sector, data_per_sector)

def parse_dir(data, per_sector, data_per_sector):
    item = {
        "Length": data[0],
        "Extended Attribute Record Length": data[1],
        "Location LE": unpack("<I", data[2:6])[0],
        "Location BE": unpack(">I", data[6:10])[0],
        "Lenght LE": unpack("<I", data[10:14])[0],
        "Lenght BE": unpack(">I", data[14:18])[0],
        "Year": 2000 + data[18],
        "Month": data[19],
        "File Flags": data[25],
        "File Unit Size / Interleave Gap Size": data[26:27],
        "Volume Sequence Number LE": unpack("<H", data[28:30])[0],
        "Volume Sequence Number BE": unpack(">H", data[30:32])[0],
        "File Identifier Length": data[32],
        "File Identifier": data[33:33+data[32]]
    }

    dont_enter = [b'\x00', b'\x01']
    if item["File Identifier"] in dont_enter:
        # Is ./ or ../
        return item

    if item["File Identifier"].endswith(b";1"):
        # Is file
        return item

    item["Children"] = get_children(
        f,
        item,
        per_sector,
        data_per_sector,
    )

    return item

def get_children(f, file, per_sector, data_per_sector):
    _, data = split_sectors(get_file_data(f, file), per_sector, 24, data_per_sector, 280)

    offset = 0
    children = []

    while offset < len(data):
        length = data[offset]
        if length == 0:
            offset += 2
            continue

        file_data = data[offset:offset + length]
        children.append(parse_dir(file_data, per_sector, data_per_sector))

        offset += length

    return children

def get_file_data(f, file):
    beginning = file['Location LE'] * 2352
    sectors = int(file['Lenght LE'] / 2048)
    remaining = file['Lenght LE'] % 2048
    to_read = sectors * 2352 + remaining
    print(f"Reading from file from {beginning} to {beginning + to_read}")
    return get_sector_data(f, file['Location LE'], 2352, to_read)

def split_sectors(data, per_sector, header_size, valid_data_in_sector_size, garbage_size):
    joined_data = bytearray()
    sectors = []
    offset = 0

    while offset < len(data):
        header = data[offset:offset + header_size]
        sector_data = data[offset + header_size:offset + header_size + valid_data_in_sector_size]
        garbage = data[offset + header_size + valid_data_in_sector_size:offset + header_size + valid_data_in_sector_size + garbage_size]

        sectors.append((header, sector_data, garbage))
        joined_data += sector_data

        offset += per_sector

    return sectors, joined_data

def join_sector(sectors, data, valid_data_in_sector_size):
    joined_sector = b''
    for index, (header, og_sector_data, garbage) in enumerate(sectors):
        sector_data = data[index * valid_data_in_sector_size:(index + 1) * valid_data_in_sector_size]
        if sector_data != og_sector_data:
            print(f"Warning: Sector data mismatch at index {index}")

        joined_sector += header + sector_data + garbage
    return joined_sector

def write_to_file(f, file, data, offset = 0):
    beginning = file['Location LE'] * 2352 + offset
    f.seek(beginning)
    f.write(data)

def get_player_attributes(current_attributes):
    # POSITION 52D3D in the Memory when running the Game                X   XX                                          XXX
    # OF DF BB ST SP AC PA SP SA JU HE TE DR CU AG RE:
    # 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12: 01000000000038 00000001000000000000000000000000000000000000000000111000
    # 12 19 12 12 12 12 12 12 12 12 12 12 12 12 12 12: 01000007000038 00000001000000000000000000000111000000000000000000111000
    # 12 19 12 12 12 12 12 12 12 12 12 12 12 12 12 19: 1D000007000038 00011101000000000000000000000111000000000000000000111000
    # 12 19 12 12 12 12 12 19 12 12 12 12 12 12 12 19: 1D00003F000038 00011101000000000000000000111111000000000000000000111000
    # 12 19 12 12 12 12 12 19 12 12 12 12 19 12 12 19: 1D70003F000038 00011101011100000000000000111111000000000000000000111000
    # 12 19 12 12 19 12 12 19 12 12 12 12 19 12 12 19: 1DF0033F000038 00011101111100000000001100111111000000000000000000111000
    # 12 19 12 12 19 12 12 19 12 19 12 12 19 12 12 19: 1DF0033F001C38 00011101111100000000001100111111000000000001110000111000
    # 12 19 12 12 19 12 12 19 12 19 12 12 19 12 19 19: 1DF0033F001C3F 00011101111100000000001100111111000000000001110000111111
    # 12 19 19 12 19 12 12 19 12 19 12 12 19 12 19 19: DDF1033F001C3F 11011101111100010000001100111111000000000001110000111111
    # 12 19 19 19 19 12 12 19 12 19 12 12 19 12 19 19: DDFF033F001C3F 11011101111111110000001100111111000000000001110000111111
    # 19 19 19 19 19 12 12 19 12 19 12 12 19 12 19 19: DDFFE33F001C3F 11011101111111111110001100111111000000000001110000111111
    # 19 19 19 19 19 19 12 19 12 19 12 12 19 12 19 19: DDFFFF3F001C3F 11011101111111111111111100111111000000000001110000111111
    # 19 19 19 19 19 19 19 19 12 19 12 12 19 12 19 19: DDFFFF3F0E1C3F 11011101111111111111111100111111000011100001110000111111
    # 19 19 19 19 19 19 19 19 12 19 12 19 19 12 19 19: DDFFFF3F7E1C3F 11011101111111111111111100111111011111100001110000111111
    # 19 19 19 19 19 19 19 19 12 19 12 19 19 19 19 19: DDFFFF3F7EFC3F 11011101111111111111111100111111011111101111110000111111
    # 19 19 19 19 19 19 19 19 19 19 12 19 19 19 19 19: DDFFFFFF7FFC3F 11011101111111111111111111111111011111111111110000111111
    # 19 19 19 19 19 19 19 19 19 19 19 19 19 19 19 19: DDFFFFFFFFFF3F 11011101111111111111111111111111111111111111111100111111

    # OTHER?????
    # OUTSIDE  NO: 4003720270 DD 0100000000000011011100100000001001110000 11011101
    # OUTSIDE YES: 4003728270 DD 0100000000000011011100101000001001110000 11011101
    # POSITION CB: 4103728270 DD 0100000100000011011100101000001001110000 11011101
    # POSITION WG: 4703728270 DD 0100011100000011011100101000001001110000 11011101
    # AGE 26
    # AGE 15     : 4703728210 DC 0100011100000011011100101000001000010000 11011100
    # AGE 45     : 47037282D0 DF 0100011100000011011100101000001011010000 11011111
    # HEIGHT 187
    #              ??--    --    -----XXX--------XXXX----------XX--------
    # HEIGHT 155 : 4703720010 DC 0100011100000011011100100000000000010000 11011111
    # HEIGHT 156 : 4003820010 DC 0100000000000011100000100000000000010000 11011111
    # HEIGHT 157 : 4003920010 DC 0100000000000011100100100000000000010000 11011111
    # HEIGHT 158 : 4003A20010 DC 0100000000000011101000100000000000010000 11011111
    # HEIGHT 159 : 4003B20010 DC 0100000000000011101100100000000000010000 11011111
    # HEIGHT 160 : 4003C20010 DC 0100000000000011110000100000000000010000 11011111
    # ...
    # HEIGHT 164 : 4003020110 DC 0100000000000011000000100000000100010000 11011111
    # HEIGHT 165 : 4003120110 DC 0100000000000011000100100000000100010000 11011111
    # ...
    # HEIGHT 170 : 4003620110 DC 0100000000000011011000100000000100010000 11011111
    # HEIGHT 186 : 4003620210 DC 0100000000000011011000100000001000010000 11011111
    # HEIGHT 187 : 4703720210 DC 0100011100000011011100100000001000010000 11011111
    # HEIGHT 195 : 4003F20210 DC 0100000000000011111100100000001000010000 11011111
    # HEIGHT 209 : 4003D20310 DC 0100000000000011110100100000001100010000 11011111
    # HEIGHT 210 : 4703E20310 DC 0100011100000011111000100000001100010000 11011111
    #
    # Ireland:     700CB00140 DD FFFFFFFFFFB7 476976656E0000000000000000E000 00 - 00000000
    # USA    :     700CB00140 DD FFFFFFFFFFB7 476976656E0000000000000000E000 25 - 00100101
    # NZ     :     700CB00140 DD FFFFFFFFFFB7 476976656E0000000000000000E000 B7 - 10110111
    # Bielo  :     700CB00140 DD FFFFFFFFFFB7 476976656E0000000000000000E000 62 - 01100010
    # Arg    :     700CB00140 DD FFFFFFFFFFB7 476976656E0000000000000000E000 2E - 00101110
    # BRA    :     700CB00140 DD FFFFFFFFFFB7 476976656E0000000000000000E000 29 - 00101001
    #
    # Skin A :     700CB00140 0111000000001100101100000000000101000000
    # Skin D :     700CB00143 0111000000001100101100000000000101000011
    #
    #                             xxxxxxxxxx  xxxxxxxxxxxxxxxxxxxxxxxx
    # Hair P1:     F00FB00141 1111000000001111101100000000000101000001
    # Hair O1:     E00DB00141 1110000000001101101100000000000101000001
    # Hair G1:     200DB00141 0010000000001101101100000000000101000001
    # Hair A1:     000CB00141 0000000000001100101100000000000101000001
    # Hair B5:     600CB00141 0110000000001100101100000000000101000001
    #                             xxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxx
    # Hair I1:     4003728270 0100000000000011011100101000001001110000
    # Hair I2:     5003728270 0101000000000011011100101000001001110000
    # Hair A1:     0002728270 0000000000000010011100101000001001110000
    # Hair A2:     1002728270 0001000000000010011100101000001001110000
    # Hair B1:     3002728270 0011000000000010011100101000001001110000
    # Hair P1:     F003------ 1111000000000011
    # Hair L1:     9003------ 1001000000000011
    #
    # HaCo H + P1: F00F------ 1111000000001111
    # HaCo A + P1: F001------ 1111000000000001
    # HaCo B + L1: 9003------ 1001000000000011
    # HaCo H + L1: 900F------ 1001000000001111
    #
    # Facial A:    900F728010 1001000000001111011100101000000000010000
    # Facial G:    90CF728010 1001000011001111011100101000000000010000
    # Facial C:    906F728010 1001000001101111011100101000000000010000
    # FaCo   G:    906F7C8010 1001000001101111011111001000000000010000
    # FaCo   A:    906F708010 1001000001101111011100001000000000010000
    #
    # Build H :    400372827C 0100000000000011011100101000001001111100
    # Build A :    4003728260 0100000000000011011100101000001001100000
    #
    # Shoes H:     900F7080149C4616393CA53E31 10010000000011110111000010000000000101001001110001000110000101100011100100111100101001010011111000110001
    # Shoes A:     900F7080149C4616393CA50631 10010000000011110111000010000000000101001001110001000110000101100011100100111100101001010000011000110001
    #
    # 400372827099932D6594100D

    other = {
        "country": '00101001', # Ireland 00000000 Bra 00101001
        "outside": "1",

        "position": '000', # GK000 CB001 SB010 DH011 SH100 OH101 CF110 WG111
        "age": "0000", # 15 years 0000 | 45 years 1111
        "height": "000111", # 155 000111 | 210 111110
        "foot": '00', # FOOT - 00 LEFT, 01 RIGHT, 10 BOTH
        'skin': '00', # 00 A, 01 B, 10 C, 11 D
        'hair': '11001', # A1 00000 L1 11001 P1 11111
        'hair color': '111', # A 000 H 111
        'facial': '000', # A 000 G 110
        'facial color': '000', # A 000 G 110
        'build': '101', # A 000 H 111
        'shoes': '110', # A 000 H 111
    }

    other_bin = ''
    other_bin += other['hair'][1:]
    other_bin += '0'
    other_bin += other['position']
    other_bin += other['facial']
    other_bin += '0'
    other_bin += other['hair color']
    other_bin += other['hair'][1]
    other_bin += other['height'][2:]
    other_bin += other['facial color']
    other_bin += '0'
    other_bin += other['outside']
    other_bin += '00000'
    other_bin += other['height'][0:2]
    other_bin += '0'
    other_bin += other['age'][0] + other['age'][1]
    other_bin += other['build']
    other_bin += other['skin']

    attrs = {
        "attack": 12,
        "defense": 13,
        "balance": 14,
        "stamina": 15,
        "speed": 16,
        "accel": 17,
        "pass": 18,
        "shot power": 19,
        "shot accuracy": 12,
        "jump": 13,
        "header": 14,
        "technique": 15,
        "dribble": 16,
        "curve": 17,
        "aggression": 18,
        "response": 19,
    }
    attrs_bin = {key: ''.join('{:03b}'.format(value - 12)) for key, value in attrs.items()}

    the_binary = ''
    the_binary += attrs_bin['balance'][1] + attrs_bin['balance'][2]
    the_binary += '0'
    the_binary += attrs_bin['response']
    the_binary += other['age'][2] + other['age'][3]
    the_binary += attrs_bin['speed'][2]
    the_binary += attrs_bin['dribble']
    the_binary += attrs_bin['stamina']
    the_binary += attrs_bin['balance'][0]
    the_binary += attrs_bin['attack']
    the_binary += attrs_bin['accel']
    the_binary += attrs_bin['speed'][0] + attrs_bin['speed'][1]
    the_binary += attrs_bin['shot accuracy'][:2]
    the_binary += attrs_bin['shot power']
    the_binary += attrs_bin['defense']
    the_binary += attrs_bin['header'][2]
    the_binary += attrs_bin['technique']
    the_binary += attrs_bin['pass']
    the_binary += attrs_bin['shot accuracy'][2]
    the_binary += attrs_bin['curve']
    the_binary += attrs_bin['jump']
    the_binary += attrs_bin['header'][0] + attrs_bin['header'][1]
    the_binary += other['foot']
    the_binary += other['shoes']
    the_binary += attrs_bin['aggression']

    return bytearray.fromhex(hex(int(other_bin + the_binary, 2)).replace('0x', ''))

def main(f, sector_size, header_size, valid_data_in_sector_size, garbage_size):
    hexdata = binascii.hexlify(f.read())

    offset = hexdata.find(b'01434430')
    if offset == -1:
        return

    position = int(offset / 2)
    print(f"Offset of 'CD001': {position}.\n")

    data = get_data(f, position, sector_size, valid_data_in_sector_size)

    root_directory_data = data[156:156+34]

    pvd = {
        "Type": data[0],
        "Identifier": data[1:6].decode(),
        "Version": data[6],
        "System Identifier": data[8:40].decode("ascii").strip(),
        "Volume Identifier": data[40:72].decode("ascii").strip(),
        "Volume Space Size (LE)": unpack("<I", data[80:84])[0],
        "Volume Space Size (BE)": unpack(">I", data[84:88])[0],
        "Volume Set Size": unpack("<H", data[120:122])[0],
        "Volume Sequence Number": unpack("<H", data[124:126])[0],
        "Logical Block Size": unpack("<H", data[128:130])[0],
        "Path Table Size": unpack("<I", data[132:136])[0],
        "Type L Path Table Location": unpack("<I", data[140:144])[0],
        "Optional Type L Path Table Location": unpack("<I", data[144:148])[0],
        "Type M Path Table Location": unpack(">I", data[148:152])[0],
        "Optional Type M Path Table Location": unpack(">I", data[152:156])[0],
        "Directory entry for the root directory": parse_dir(root_directory_data, sector_size, valid_data_in_sector_size)
    }

    print("PVD")
    print_dict(pvd)
    print("")

    data = get_sector_data(f, pvd["Type L Path Table Location"], sector_size, valid_data_in_sector_size)
    data = data[header_size:]

    offset = 0
    directories = []
    while True:
        len_di = data[offset + 0]
        if len_di == 0:
            break

        padding = 0 if len_di % 2 == 0 else 1

        path_table = {
            "Length of Directory Identifier": len_di,
            "Extended Attribute Record Length": data[offset + 1],
            "Location of Extent": unpack("<I", data[offset + 2:offset + 6])[0],
            "Directory number of parent directory": unpack("<H", data[offset + 6:offset + 8])[0],
            "Directory Identifier (name) in d-characters": data[offset + 8:offset + 8 + len_di],
            "Padding Field": None if len_di % 2 == 0 else data[offset + 8 + len_di]
        }

        directories.append(path_table)
        offset += 8 + len_di + padding

    print("Path Table")
    print_dict(directories)
    print("")

    root_dir_children = get_children(
        f,
        pvd["Directory entry for the root directory"],
        sector_size,
        valid_data_in_sector_size,
    )

    print("Root Directory")
    print_dict(root_dir_children)
    print("")

    print("Dir Structure")
    print_dir_structure(root_dir_children)
    print("")

    return root_dir_children

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python main.py <file_path>")
        sys.exit(1)

    f = open(sys.argv[1], 'rb')
    sector_size = 2352 # Got from the CUE, MODE2/2352
    header_size = 24
    valid_data_in_sector_size = 2048 # But the valid data in sector is 2048 bytes
    garbage_size = 280

    dirs = main(f, sector_size, header_size, valid_data_in_sector_size, garbage_size)
    if not dirs:
        print("No dirs found")
        sys.exit(1)

    f.seek(0)
    content = f.read()
    f.close()

    destination_file = open('output.bin', 'wb')
    destination_file.write(content)

    slpm_file = [d for d in dirs if d['File Identifier'] == b'SLPM_870.56;1']
    if not slpm_file:
        print("No SLPM file found")
        sys.exit(1)

    # Handle countries players names

    file_data = get_file_data(content, slpm_file[0])
    sectors, data = split_sectors(file_data, sector_size, header_size, valid_data_in_sector_size, garbage_size)

    sector_in_file = 140
    index_in_sector_data = 2040
    first_player_pos = sector_in_file * valid_data_in_sector_size + index_in_sector_data

    players = []
    player_per_team = 23
    num_of_teams = 63
    while len(players) < player_per_team * num_of_teams:
        current_player_pos = first_player_pos + len(players) * 10
        print(f"Reading from {int(current_player_pos / 2048) * 2352 + current_player_pos % 2048 + slpm_file[0]['Location LE'] * 2352 + 24}")

        player_name = data[current_player_pos:current_player_pos+10]
        shift_jis = player_name.decode('shift-jis')
        print("Shift-JIS:", shift_jis, "Player name:", player_name)
        players.append((shift_jis, player_name))

        new_player_name = f"{len(players)}"
        data[current_player_pos:current_player_pos+10] = bytes(new_player_name, 'utf-8') + (10 - len(new_player_name)) * b'\x00'

    joined_sector = join_sector(sectors, data, valid_data_in_sector_size)
    write_to_file(destination_file, slpm_file[0], joined_sector)

    # Handle countries players attributes

    select_file = [d for d in dirs if d['File Identifier'] == b'SELECT.BIN;1']
    if not select_file:
        print("No select file found")
        sys.exit(1)

    file_data = get_file_data(content, select_file[0])
    sectors, data = split_sectors(file_data, sector_size, header_size, valid_data_in_sector_size, garbage_size)

    sector_in_file = 76
    index_in_sector_data = 1516
    first_player_pos = sector_in_file * valid_data_in_sector_size + index_in_sector_data

    idx = 0
    player_per_team = 23
    num_of_teams = 63
    while idx < player_per_team * num_of_teams:
        current_player_pos = first_player_pos + idx * 12
        print("Player:", idx, "Current attrs:", ''.join('{:02x}'.format(x) for x in data[current_player_pos:current_player_pos+12]), ' - ', ' '.join(format(b, '08b') for b in data[current_player_pos:current_player_pos+12]))
        new_attrs = get_player_attributes(data[current_player_pos:current_player_pos+12])
        print("New attrs:", ''.join('{:02x}'.format(x) for x in new_attrs), ' - ', ' '.join(format(b, '08b') for b in new_attrs))
        data[current_player_pos:current_player_pos+12] = new_attrs

        idx += 1

    joined_sector = join_sector(sectors, data, valid_data_in_sector_size)
    write_to_file(destination_file, select_file[0], joined_sector)

    destination_file.close()
