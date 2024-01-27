#include <psp2/types.h>
#include "psp2/audioout.h"
#include "sounds/quack.h"
#include <stdbool.h>

int audioPort;
bool play = false;
int16_t audioBuf[SCE_AUDIO_MAX_LEN] = {0};

void quackPlay() {
    play = true;
}

void quackInit() {
    int vol = SCE_AUDIO_VOLUME_0DB;
    audioPort = sceAudioOutOpenPort(SCE_AUDIO_OUT_PORT_TYPE_BGM, quackLength, quackSampleRate, SCE_AUDIO_OUT_MODE_MONO);

    int setVolume = sceAudioOutSetVolume(audioPort, SCE_AUDIO_VOLUME_FLAG_L_CH | SCE_AUDIO_VOLUME_FLAG_R_CH, (int[]){vol,vol});
    for (int n = 0 ; n < quackLength ; ++n) audioBuf[n] = quackData[n] * 8;
}

void quackEnd() {
    sceAudioOutReleasePort(audioPort);
}

int soundThread(SceSize argc, void* argv) {
    quackInit();

    while (1) {
        if (play) {
            sceAudioOutOutput(audioPort, audioBuf);
            play = false;
        }
    }

    quackEnd();
}