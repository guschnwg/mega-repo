#pragma once

#include "SDL2/SDL_render.h"
#include <psp2/ctrl.h>
#include <psp2/touch.h>

#include "utils.h"

typedef struct Bullet {
    float ttl;
    int power;
    Vector2 position;
    Vector2 velocity;
    int speed;
    int size;
    struct Bullet* next;
    struct Bullet* previous;
} Bullet;

typedef struct BulletList {
    Bullet* head;
    Bullet* tail;
} BulletList;

typedef struct Player {
    bool playing;
    Vector2 position;
    Vector2 velocity;
    int speed;
    SDL_Texture* texture;
    Vector2 aimPosition;
    float shootCooldown;
    float currentShootCooldown;
    BulletList bullets;

    SceCtrlButtons upButton;
    SceCtrlButtons downButton;
    SceCtrlButtons leftButton;
    SceCtrlButtons rightButton;
    SceCtrlButtons allButtons;

    Vector2 (*aimFunc)(SceCtrlData* ctrl);
} Player;

void initPlayers(SDL_Renderer* gRenderer);
void processPlayers(float deltaTime, SceCtrlData* ctrl, SceTouchData* touch);
void drawPlayers(SDL_Renderer* gRenderer);
void shoot(Player* player, Vector2 direction, int ttl, int power);
