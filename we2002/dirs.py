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

def parse_dir(f, data, per_sector, data_per_sector):
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
        children.append(parse_dir(f, file_data, per_sector, data_per_sector))

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

def get_dirs_from_file(f, sector_size, header_size, valid_data_in_sector_size, garbage_size):
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
        "Directory entry for the root directory": parse_dir(f, root_directory_data, sector_size, valid_data_in_sector_size)
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

    dirs = get_dirs_from_file(f, sector_size, header_size, valid_data_in_sector_size, garbage_size)
    if not dirs:
        print("No dirs found")
        sys.exit(1)

    f.seek(0)
    content = f.read()
    f.close()
