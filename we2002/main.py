import binascii

with open('THE_GAME.bin', 'rb') as f:
    hexdata = binascii.hexlify(f.read())

    offset = 0x5EAD0
    start = offset * 2
    end = start + 0x8 * 2

    byte_hex = hexdata[start:end]
    print(binascii.unhexlify(byte_hex).decode('ascii'))

    import pdb; pdb.set_trace()