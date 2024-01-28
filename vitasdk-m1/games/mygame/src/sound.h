#ifndef SOUND_H
#define SOUND_H

#include <psp2/types.h>

void quackPlay();

void quackInit();

void quackEnd();

int soundThread(SceSize argc, void* argv);

#endif