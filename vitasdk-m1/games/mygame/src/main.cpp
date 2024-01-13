#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>
#include <SDL2/SDL_pixels.h>
#include <SDL2/SDL_render.h>
#include <psp2/ctrl.h>
#include <psp2common/ctrl.h>
#include <psp2/kernel/processmgr.h>
#ifdef __vita__
#include <psp2/power.h>
#endif

enum { VITA_SCREEN_WIDTH = 960, VITA_SCREEN_HEIGHT = 544 };

SDL_Window* gWindow;
SDL_Renderer* gRenderer;
SceCtrlData ctrl;

int main(int argc, char* argv[])
{
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

    int rectX = 100;
    int rectY = 100;
    while (true) {
        printf("Tick %d\n", SDL_GetTicks());
        printf("handleInputs\n");
        sceCtrlPeekBufferPositive(0, &ctrl, 1);
        printf("Buttons %d\n", ctrl.buttons);

        if (ctrl.buttons & SCE_CTRL_START) break;
        if (ctrl.buttons & SCE_CTRL_RIGHT) rectX += 1;
        if (ctrl.buttons & SCE_CTRL_DOWN) rectY += 1;

        SDL_SetRenderDrawColor(gRenderer, 0, 0, 0, 255);
        SDL_RenderClear(gRenderer);

        SDL_Rect fillRect = { rectX, rectY, 100, 100 };
        SDL_SetRenderDrawColor(gRenderer, 255, 0, 0, 255);
        SDL_RenderFillRect(gRenderer, &fillRect);

        SDL_RenderPresent(gRenderer);

        SDL_Delay(1000 / 30);
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