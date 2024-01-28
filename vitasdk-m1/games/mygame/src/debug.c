#include "psp2common/types.h"
#include "psp2common/kernel/iofilemgr.h"
#include <psp2/kernel/clib.h>
#include <psp2/kernel/processmgr.h>
#include <psp2/io/fcntl.h>

#include <stdio.h>

void debug(char* str, int code) {
    SceUID log = sceIoOpen("ux0:/data/mygame.log", SCE_O_RDWR | SCE_O_APPEND | SCE_O_CREAT, 0777);
    char debugBuf[100];
    snprintf(debugBuf, sizeof(debugBuf), "%s 0x%X\n", str, code);
    sceIoWrite(log, debugBuf, sceClibStrnlen(debugBuf, ~0));
    sceIoClose(log);

    // Could be like this too
    // FILE* logFile = fopen("ux0:/data/mygame.log", "a");
    // fprintf(logFile, "HIHIHI %d\n", 123);
    // fclose(logFile);
}