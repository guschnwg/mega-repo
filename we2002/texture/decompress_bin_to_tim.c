#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

unsigned char *FUN_8001cc9c(unsigned char *param_1, unsigned char *param_2) {
  unsigned char bVar1;
  int iVar2;
  unsigned char *pbVar3;
  unsigned short uVar4;
  unsigned short uVar5;

  uVar5 = 0;
  do {
    uVar5 = uVar5 >> 1;
    while (true) {
      if ((uVar5 & 0x100) == 0) {
        bVar1 = *param_1;
        param_1 = param_1 + 1;
        uVar5 = bVar1 | 0xff00;
      }
      bVar1 = *param_1;
      uVar4 = (unsigned short)bVar1;
      if ((uVar5 & 1) == 0)
        break;
      if ((bVar1 & 0x80) == 0) {
        pbVar3 = param_1 + 1;
        param_1 = param_1 + 2;
        iVar2 = (bVar1 >> 2) + 2;
        uVar4 = (unsigned short)*pbVar3 | (uVar4 & 3) << 8;
      LAB_8001cd20:
        do {
          iVar2 = iVar2 + -1;
          *param_2 = param_2[-uVar4];
          param_2 = param_2 + 1;
        } while (-1 < iVar2);
        uVar5 = uVar5 >> 1;
      } else {
        param_1 = param_1 + 1;
        if ((bVar1 & 0x40) == 0) {
          uVar4 = (uVar4 & 0xf) + 1;
          iVar2 = (bVar1 >> 4) - 7;
          goto LAB_8001cd20;
        }
        iVar2 = uVar4 - 0xb9;
        pbVar3 = param_2;
        if (uVar4 == 0xff) {
          return param_2;
        }
        do {
          bVar1 = *param_1;
          param_1 = param_1 + 1;
          param_2 = pbVar3 + 1;
          iVar2 = iVar2 + -1;
          *pbVar3 = bVar1;
          pbVar3 = param_2;
        } while (-1 < iVar2);
        uVar5 = uVar5 >> 1;
      }
    }
    *param_2 = bVar1;
    param_2 = param_2 + 1;
    param_1 = param_1 + 1;
  } while (true);
}

int main(int argc, char *argv[]) {
  if (argc < 5) {
    return -1;
  }

  char *inputImage = argv[1];
  int inputSize = atoi(argv[2]);
  char *output = argv[3];
  int outputSize = atoi(argv[4]);

  FILE *fptr;
  fptr = fopen(inputImage, "rb");

  unsigned char buffer[inputSize];
  fread(buffer, sizeof(buffer), 1, fptr);

  unsigned char outputBuffer[outputSize];
  unsigned char *result = FUN_8001cc9c(buffer, outputBuffer);

  FILE *fp = fopen(output, "wb");
  fwrite(outputBuffer, 1, outputSize, fp);

  fclose(fptr);
  fclose(fp);

  return 0;
}