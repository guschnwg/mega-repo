#pragma once

#include <psp2/ctrl.h>
#include "psp2/touch.h"
#include "SDL2/SDL_render.h"

#include "vector.h"

typedef struct Enemy {
    float ttl;
    int power;
    Vector2 position;
    Vector2 velocity;
    int speed;
    int size;
} Enemy;


void initEnemies(SDL_Renderer* gRenderer);
void processEnemies(float deltaTime, SceCtrlData* ctrl, SceTouchData* touch);
void drawEnemies(SDL_Renderer* gRenderer);
