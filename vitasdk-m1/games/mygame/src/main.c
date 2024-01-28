#include <stdbool.h>
#include <stdint.h>
#include <math.h>

#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>
#include <SDL2/SDL_pixels.h>
#include <SDL2/SDL_render.h>
#include <psp2common/ctrl.h>
#include <psp2/ctrl.h>
#include <psp2/touch.h>
#include <psp2/power.h>
#include <psp2/kernel/clib.h>
#include <psp2/kernel/processmgr.h>
#include <psp2/io/fcntl.h>

#include "sound.h"
#include "debug.h"
#include "vector.h"
#include "utils.h"
#include "player.h"
#include "enemy.h"

SceCtrlData ctrlData;
SceTouchData touchData;

SDL_Window* gWindow;
SDL_Renderer* gRenderer;


void input() {
    printf("handleInputs\n");
    sceCtrlSetSamplingMode(SCE_CTRL_MODE_ANALOG);
    sceCtrlPeekBufferPositive(0, &ctrlData, 1);
    printf("Buttons %d\n", ctrlData.buttons);

    sceTouchSetSamplingState(SCE_TOUCH_PORT_FRONT, 1);
	sceTouchSetSamplingState(SCE_TOUCH_PORT_BACK, 1);

    sceTouchPeek(SCE_TOUCH_PORT_FRONT, &touchData, 1);
}

void process(float deltaTime) {
    processPlayers(deltaTime, &ctrlData, &touchData);
    processEnemies(deltaTime, &ctrlData, &touchData);
}


void drawBackground() {
    for (int i = 0; i < VITA_SCREEN_HEIGHT; i += 50) {
        SDL_SetRenderDrawColor(gRenderer, 0, 0, 255, 255);
        SDL_RenderDrawLine(gRenderer, 0, i, VITA_SCREEN_WIDTH, i);
    }
    for (int i = 0; i < VITA_SCREEN_WIDTH; i += 50) {
        SDL_SetRenderDrawColor(gRenderer, 0, 255, 255, 255);
        SDL_RenderDrawLine(gRenderer, i, 0, i, VITA_SCREEN_HEIGHT);
    }
}


void draw() {
    SDL_SetRenderDrawColor(gRenderer, 0, 0, 0, 255);
    SDL_RenderClear(gRenderer);

    drawBackground();

    drawPlayers(gRenderer);
    drawEnemies(gRenderer);

    SDL_RenderPresent(gRenderer);
}

int main(int argc, char* argv[]) {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        printf("Error SDL_Init: %s\n\n", SDL_GetError());
        return -1;
    }

    if ((gWindow = SDL_CreateWindow("Giovanna", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, VITA_SCREEN_WIDTH, VITA_SCREEN_HEIGHT, SDL_WINDOW_SHOWN)) == NULL) {
        printf("Error SDL_CreateWindow: %s\n\n", SDL_GetError());
        return -1;
    }

    if ((gRenderer = SDL_CreateRenderer(gWindow, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC)) == NULL){
        printf("Error SDL_CreateRenderer: %s\n\n", SDL_GetError());
        return -1;
    }

    int soundThreadUid = sceKernelCreateThread("sound thread", soundThread, 0x40, 0x10000, 0, 0, NULL);
    sceKernelStartThread(soundThreadUid, 0, NULL);

    initPlayers(gRenderer);
    initEnemies(gRenderer);

    int lastTime = 0;
    int deltaTime = 0;

    while (true) {
        input();

        if (ctrlData.buttons & SCE_CTRL_START) break;

        deltaTime = SDL_GetTicks() - lastTime;
        printf("DELTA TIME %d\n", deltaTime);
        process(deltaTime / 1000.0);
        lastTime = SDL_GetTicks();

        draw();
    }

    printf("Bye, sleeping for 3 seconds...\n");
    sceKernelDelayThread(3 * 1000 * 1000);
    printf("Ready to go...\n");

    SDL_DestroyRenderer(gRenderer);
    printf("Renderer destroyed %s...\n", SDL_GetError());

    SDL_DestroyWindow(gWindow);
    printf("Window destroyed %s...\n", SDL_GetError());

    IMG_Quit();
    printf("IMG destroyed %s...\n", SDL_GetError());

    SDL_Quit();
    printf("SDL destroyed %s...\n", SDL_GetError());

    return 0;
}