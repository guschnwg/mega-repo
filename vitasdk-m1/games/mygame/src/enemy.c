#include "SDL2/SDL_render.h"

#include "enemy.h"
#include "vector.h"

Enemy* enemies;
int allTimeEnemies = 0;
int currentEnemies = 0;
int maxEnemies = 10;

bool enemyAdded = false;

void initEnemies(SDL_Renderer* gRenderer) {
    enemies = malloc(sizeof(Enemy) * maxEnemies);
}

void processEnemies(float deltaTime, SceCtrlData* ctrl, SceTouchData* touch) {
    if (touch->reportNum > 0) {
        if (currentEnemies < 10 && enemyAdded == false) {
            enemies[allTimeEnemies++ % maxEnemies] = (Enemy) {
                .ttl = 10,
                .power = 1,
                .position = (Vector2) {
                    .x = touch->report[0].x / 2,
                    .y = touch->report[0].y / 2
                },
                .velocity = (Vector2) {
                    .x = 0,
                    .y = 0
                },
                .speed = 0,
                .size = 10
            };
            currentEnemies++;
            enemyAdded = true;
        }
    } else {
        enemyAdded = false;
    }

    for (int i = 0; i < maxEnemies; i++) {
        if (enemies[i].ttl > 0) {
            enemies[i].ttl -= deltaTime;

            if (enemies[i].ttl <= 0) {
                enemies[i].ttl = 0;
                currentEnemies--;
            }

        }
    }
}

void drawEnemies(SDL_Renderer* gRenderer) {
    SDL_SetRenderDrawColor(gRenderer, 255, 0, 0, 255);

    for (int i = 0; i < maxEnemies; i++) {
        if (enemies[i].ttl <= 0) {
            continue;
        }

        SDL_Rect rect = { enemies[i].position.x, enemies[i].position.y, enemies[i].size, enemies[i].size };
        SDL_RenderFillRect(gRenderer, &rect);
    }
}
