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

#define M_PI 3.14159265358979323846264338327950288
#define degToRad(angleInDegrees) ((angleInDegrees) * M_PI / 180.0)
#define radToDeg(angleInRadians) ((angleInRadians) * 180.0 / M_PI)

SceCtrlData ctrlData;
SceTouchData touchData;

SDL_Window* gWindow;
SDL_Renderer* gRenderer;

typedef struct Ray {
    float angle;
    float cameraDistance;
    float realDistance;
    float startX;
    float startY;
    float endX;
    float endY;
    int side;
    int type;
} Ray;

enum {
    VITA_SCREEN_HEIGHT = 544,
    VITA_SCREEN_WIDTH = 960,
    TILE_SIZE = 32,
    HALF_TILE_SIZE = TILE_SIZE / 2,
    RAY_STEP = 10,
    RAYS_COUNT = VITA_SCREEN_WIDTH / RAY_STEP,
    PLAYER_SIZE = 5,
    HALF_PLAYER_SIZE = PLAYER_SIZE / 2,
};

float playerX = TILE_SIZE * 3;
float playerY = TILE_SIZE * 10;
float playerAngle = -45;
float playerFov = 40;
Ray playerRays[RAYS_COUNT];

int view = 0;

int world[VITA_SCREEN_WIDTH / TILE_SIZE][VITA_SCREEN_HEIGHT / TILE_SIZE] = {
    {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
};



void updateRays() {
    float step = playerFov / VITA_SCREEN_WIDTH * RAY_STEP;
    float angle = playerAngle - playerFov / 2;

    for (int i = 0; i < RAYS_COUNT; i++) {
        Ray* ray = &playerRays[i];
        ray->angle = angle;
        ray->startX = playerX + HALF_PLAYER_SIZE;
        ray->startY = playerY + HALF_PLAYER_SIZE;
        ray->endX = ray->startX;
        ray->endY = ray->startY;

        int prevInWorldX = (int)(ray->endX / TILE_SIZE);

        float incrementX = cos(degToRad(angle)) / 4;
        float incrementY = sin(degToRad(angle)) / 4;
        while (true) {
            int inWorldX = (int)(ray->endX / TILE_SIZE);
            int inWorldY = (int)(ray->endY / TILE_SIZE);
            int inWorld = world[inWorldX][inWorldY];
            if (inWorld > 0) {
                ray->type = inWorld;
                ray->realDistance = sqrt(pow(ray->endX - ray->startX, 2) + pow(ray->endY - ray->startY, 2));
                ray->cameraDistance = ray->realDistance * cos(degToRad(ray->angle - playerAngle));
                ray->side = inWorldX != prevInWorldX ? 0 : 1;
                break;
            }

            ray->endX += incrementX;
            ray->endY += incrementY;
            prevInWorldX = inWorldX;
        }

        angle += step;
    }
}

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
    if (ctrlData.buttons & SCE_CTRL_LTRIGGER) playerFov -= 1;
    if (ctrlData.buttons & SCE_CTRL_RTRIGGER) playerFov += 1;
    if (ctrlData.buttons & SCE_CTRL_LEFT) playerAngle -= 1;
    if (ctrlData.buttons & SCE_CTRL_RIGHT) playerAngle += 1;
    if (ctrlData.buttons & SCE_CTRL_UP || ctrlData.buttons & SCE_CTRL_DOWN) {
        float incrementX = cos(degToRad(playerAngle));
        float incrementY = sin(degToRad(playerAngle));

        if (ctrlData.buttons & SCE_CTRL_DOWN) {
            playerX -= incrementX;
            playerY -= incrementY;
        } else if (ctrlData.buttons & SCE_CTRL_UP) {
            playerX += incrementX;
            playerY += incrementY;
        }
    }
    if (ctrlData.buttons & SCE_CTRL_SELECT) {
        view = 1;
    } else {
        view = 0;
    }

    updateRays();
}

void drawViewTop() {
    for (int x = 0; x < VITA_SCREEN_WIDTH / TILE_SIZE; x++) {
        for (int y = 0; y < VITA_SCREEN_HEIGHT / TILE_SIZE; y++) {
            if (world[x][y] > 0) {
                SDL_Rect wallRect = { x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE };
                if (world[x][y] == 1) SDL_SetRenderDrawColor(gRenderer, 210, 14, 255, 255);
                if (world[x][y] == 2) SDL_SetRenderDrawColor(gRenderer, 247, 0, 0, 255);
                if (world[x][y] == 3) SDL_SetRenderDrawColor(gRenderer, 255, 215, 0, 255);
                if (world[x][y] == 4) SDL_SetRenderDrawColor(gRenderer, 173, 216, 230, 255);
                if (world[x][y] == 5) SDL_SetRenderDrawColor(gRenderer, 50, 205, 50, 255);
                SDL_RenderDrawRect(gRenderer, &wallRect);
            }
        }
    }

    SDL_Rect playerRect = { playerX, playerY, PLAYER_SIZE, PLAYER_SIZE };
    SDL_SetRenderDrawColor(gRenderer, 0, 255, 0, 255);
    SDL_RenderFillRect(gRenderer, &playerRect);

    // Draw rays
    SDL_SetRenderDrawColor(gRenderer, 0, 0, 255, 255);
    for (int i = 0; i < RAYS_COUNT; i++) {
        if (playerRays[i].side == 0) {
            SDL_SetRenderDrawColor(gRenderer, 0, 0, 255, 255);
        } else {
            SDL_SetRenderDrawColor(gRenderer, 255, 255, 204, 255);
        }
        SDL_RenderDrawLine(
            gRenderer,
            playerRays[i].startX, playerRays[i].startY,
            playerRays[i].endX, playerRays[i].endY
        );
    }
    //

    SDL_SetRenderDrawColor(gRenderer, 255, 0, 0, 255);
    SDL_RenderDrawLine(
        gRenderer,
        playerX + HALF_PLAYER_SIZE, playerY + HALF_PLAYER_SIZE,
        playerX + HALF_PLAYER_SIZE + cos(degToRad(playerAngle)) * 50, playerY + HALF_PLAYER_SIZE + sin(degToRad(playerAngle)) * 50
    );
}

void drawFake3d() {
    for (int i = 0; i < RAYS_COUNT; i++) {
        Ray* ray = &playerRays[i];

        if (ray->side == 0) {
            if (ray->type == 1) SDL_SetRenderDrawColor(gRenderer, 210, 14, 255, 255);
            else if (ray->type == 2) SDL_SetRenderDrawColor(gRenderer, 247, 0, 0, 255);
            else if (ray->type == 3) SDL_SetRenderDrawColor(gRenderer, 255, 215, 0, 255);
            else if (ray->type == 4) SDL_SetRenderDrawColor(gRenderer, 173, 216, 230, 255);
            else if (ray->type == 5) SDL_SetRenderDrawColor(gRenderer, 50, 205, 50, 255);
        } else {
            if (ray->type == 1) SDL_SetRenderDrawColor(gRenderer, 133, 8, 161, 255);
            else if (ray->type == 2) SDL_SetRenderDrawColor(gRenderer, 147, 0, 0, 255);
            else if (ray->type == 3) SDL_SetRenderDrawColor(gRenderer, 135, 114, 0, 255);
            else if (ray->type == 4) SDL_SetRenderDrawColor(gRenderer, 102, 131, 140, 255);
            else if (ray->type == 5) SDL_SetRenderDrawColor(gRenderer, 25, 105, 25, 255);
        }

        float distance = ray->cameraDistance;
        int wallHeight = (TILE_SIZE * 50) / (distance / TILE_SIZE); // Arbitrary...
        float wallStart = VITA_SCREEN_HEIGHT / 2 - wallHeight / 2;

        SDL_Rect wallRect = { i * RAY_STEP, wallStart, RAY_STEP, wallHeight };
        SDL_RenderFillRect(gRenderer, &wallRect);
    }
}


void draw() {
    SDL_SetRenderDrawColor(gRenderer, 0, 0, 0, 255);
    SDL_RenderClear(gRenderer);

    if (view == 0) {
        drawViewTop();
    } else if (view == 1) {
        drawFake3d();
    }

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

    SDL_Quit();
    printf("SDL destroyed %s...\n", SDL_GetError());

    return 0;
}