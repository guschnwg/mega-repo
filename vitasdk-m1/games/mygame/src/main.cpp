#include <psp2/kernel/threadmgr.h>
#include <psp2/kernel/processmgr.h>
#include <psp2/touch.h>
#ifdef __vita__
#include <psp2/power.h>
#endif
#include <SDL2/SDL.h>
#include <SDL2/SDL_render.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdint.h>

#include "debugScreen.h"


SDL_Window* gWindow;
SDL_Renderer* gRenderer;

int main(int argc, char *argv[]) {
	psvDebugScreenInit();
	psvDebugScreenPrintf("Hello, world!\n");

	sceTouchSetSamplingState(SCE_TOUCH_PORT_FRONT, SCE_TOUCH_SAMPLING_STATE_START);
	sceTouchEnableTouchForce(SCE_TOUCH_PORT_FRONT);

	if (SDL_Init(SDL_INIT_VIDEO) < 0) return -1;

    if ((gWindow = SDL_CreateWindow("MeuHello", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, SCREEN_WIDTH, SCREEN_HEIGHT, SDL_WINDOW_SHOWN)) == NULL) return -1;
	psvDebugScreenPrintf("-- %d --\n", gWindow);

	// THIS CRASHEEEES
	if ((gRenderer = SDL_CreateRenderer( gWindow, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC)) == NULL) {
		psvDebugScreenPrintf("\n Error? %s\n\n", SDL_GetError());
		return -1;
	}

	SceTouchData touch;
	while (1) {
		psvDebugScreenPrintf("\e[0;5H");

		sceTouchPeek(0, &touch, 1);
		psvDebugScreenPrintf("\n\n%4i : %-4i", touch.report[0].x, touch.report[0].y);

		if (
			touch.report[0].x > 900
			&& touch.report[0].x < 1100
			&& touch.report[0].y > 500
			&& touch.report[0].y < 600
		) {
			return 0;
		}
	}

	sceKernelDelayThread(3*1000000); // Wait for 3 seconds
	return 0;
}
