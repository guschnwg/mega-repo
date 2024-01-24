#include <stdbool.h>

#include <SDL2/SDL.h>
#include <SDL2/SDL_image.h>
#include <SDL2/SDL_pixels.h>
#include <SDL2/SDL_render.h>
#include <psp2common/ctrl.h>
#include <psp2/ctrl.h>
#include <psp2/power.h>
#include <psp2/kernel/processmgr.h>

enum { VITA_SCREEN_WIDTH = 960, VITA_SCREEN_HEIGHT = 544 };

typedef struct Vector2 {
    float x, y;
} Vector2;

// Generic linked list
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
    Vector2 position;
    Vector2 velocity;
    int speed;
    SDL_Texture* texture;
    Vector2 aimPosition;
    float shootCooldown;
    float currentShootCooldown;
    BulletList bullets;
} Player;

SceCtrlData ctrl;

SDL_Window* gWindow;
SDL_Renderer* gRenderer;

Player playerOne;
Player playerTwo;


bool isZero(Vector2* vector) {
    return vector->x == 0 && vector->y == 0;
}

void normalize(Vector2* vector) {
    if (isZero(vector)) return;

    float length = sqrt(vector->x * vector->x + vector->y * vector->y);
    vector->x /= length;
    vector->y /= length;
}

Vector2 normalized(Vector2 vector) {
    if (isZero(&vector)) return vector;

    float length = sqrt(vector.x * vector.x + vector.y * vector.y);
    Vector2* newVector = malloc(sizeof(Vector2));
    newVector->x = vector.x / length;
    newVector->y = vector.y / length;
    return *newVector;
}

void add (Vector2* vector, Vector2 other) {
    vector->x += other.x;
    vector->y += other.y;
}

void scale(Vector2* vector, float scale) {
    vector->x *= scale;
    vector->y *= scale;
}


void input() {
    printf("handleInputs\n");
    sceCtrlSetSamplingMode(SCE_CTRL_MODE_ANALOG);
    sceCtrlPeekBufferPositive(0, &ctrl, 1);
    printf("Buttons %d\n", ctrl.buttons);

    printf("LX %d\n", ctrl.lx);
    printf("LY %d\n", ctrl.ly);
    printf("RX %d\n", ctrl.rx);
    printf("RY %d\n", ctrl.ry);
}

void shoot(Player* player, Vector2 direction, int ttl, int power) {
    Bullet* bullet = malloc(sizeof(Bullet));
    bullet->ttl = ttl;
    bullet->power = power;
    bullet->next = NULL;
    bullet->previous = player->bullets.tail;
    bullet->position = player->aimPosition;
    bullet->velocity = direction;
    bullet->speed = 5;

    if (player->bullets.head == NULL) {
        player->bullets.head = bullet;
        player->bullets.tail = bullet;
    } else {
        player->bullets.tail->next = bullet;
        player->bullets.tail = bullet;
    }
}

void process(float deltaTime) {
    if (ctrl.buttons & SCE_CTRL_RIGHT) playerOne.velocity.x = 1;
    else if (ctrl.buttons & SCE_CTRL_LEFT) playerOne.velocity.x = -1;
    else playerOne.velocity.x = 0;

    if (ctrl.buttons & SCE_CTRL_DOWN) playerOne.velocity.y = 1;
    else if (ctrl.buttons & SCE_CTRL_UP) playerOne.velocity.y = -1;
    else playerOne.velocity.y = 0;

    playerOne.position.x += playerOne.velocity.x * playerOne.speed * deltaTime;
    playerOne.position.y += playerOne.velocity.y * playerOne.speed * deltaTime;

    Vector2 aimDirection = { ctrl.lx - 127, ctrl.ly - 127 };
    normalize(&aimDirection);

    playerOne.aimPosition = aimDirection;
    scale(&playerOne.aimPosition, 50);
    add(&playerOne.aimPosition, playerOne.position);

    playerOne.currentShootCooldown -= deltaTime;
    if (playerOne.currentShootCooldown < 0) playerOne.currentShootCooldown = 0;

    if (playerOne.currentShootCooldown <= 0) {
        if (!isZero(&aimDirection)) {
            shoot(&playerOne, aimDirection, 5, 1);

            playerOne.currentShootCooldown = playerOne.shootCooldown;
        }
    }

    Bullet* current = playerOne.bullets.head;
    while (current != NULL) {
        current->ttl -= deltaTime;
        if (current->ttl < 0) current->ttl = 0;

        if (current->ttl <= 0){
            if (current->previous != NULL) current->previous->next = current->next;
            if (current->next != NULL) current->next->previous = current->previous;
            if (current == playerOne.bullets.head) playerOne.bullets.head = current->next;
            if (current == playerOne.bullets.tail) playerOne.bullets.tail = current->previous;
            Bullet* next = current->next;
            free(current);
            current = next;
            continue;
        }

        current->position.x += current->velocity.x * current->speed * deltaTime;
        current->position.y += current->velocity.y * current->speed * deltaTime;

        current = current->next;
    }
}


void draw() {
    SDL_SetRenderDrawColor(gRenderer, 0, 0, 0, 255);
    SDL_RenderClear(gRenderer);

    for (int i = 0; i < VITA_SCREEN_HEIGHT; i += 10) {
        SDL_SetRenderDrawColor(gRenderer, 0, 0, 255, 255);
        SDL_RenderDrawLine(gRenderer, 0, i, VITA_SCREEN_WIDTH, i);
    }
    for (int i = 0; i < VITA_SCREEN_WIDTH; i += 10) {
        SDL_SetRenderDrawColor(gRenderer, 0, 255, 255, 255);
        SDL_RenderDrawLine(gRenderer, i, 0, i, VITA_SCREEN_HEIGHT);
    }

    SDL_Rect playerRect = { playerOne.position.x - 50, playerOne.position.y - 50, 100, 100 };
    SDL_RenderCopy(gRenderer, playerOne.texture, NULL, &playerRect);

    SDL_Rect aimRect = { playerOne.aimPosition.x - 5, playerOne.aimPosition.y - 5, 10, 10 };
    if (playerOne.currentShootCooldown <= 0) SDL_SetRenderDrawColor(gRenderer, 0, 255, 0, 255);
    else                                     SDL_SetRenderDrawColor(gRenderer, 255, 0, 0, 255);
    printf("playerOne.currentShootCooldown %f\n", playerOne.currentShootCooldown);
    SDL_RenderFillRect(gRenderer, &aimRect);

    Bullet* current = playerOne.bullets.head;
    while (current != NULL) {
        printf("current velocity %f %f\n", current->velocity.x, current->velocity.y);

        if (current->ttl > 0) SDL_SetRenderDrawColor(gRenderer, 255, 255, 0, 255);
        else                  SDL_SetRenderDrawColor(gRenderer, 255, 0, 0, 255);
        SDL_RenderDrawPoint(gRenderer, current->position.x, current->position.y);
        SDL_RenderDrawPoint(gRenderer, current->position.x+1, current->position.y+1);
        SDL_RenderDrawPoint(gRenderer, current->position.x+1, current->position.y-1);
        SDL_RenderDrawPoint(gRenderer, current->position.x-1, current->position.y+1);
        SDL_RenderDrawPoint(gRenderer, current->position.x-1, current->position.y-1);
        current = current->next;
    }

    SDL_SetRenderDrawColor(gRenderer, 255, 255, 0, 255);
    SDL_RenderDrawPoint(gRenderer, playerOne.position.x, playerOne.position.y);

    SDL_RenderPresent(gRenderer);
}


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

    playerOne.texture = IMG_LoadTexture(gRenderer, "app0:/images/dogs.png");
    playerOne.position.x = 100;
    playerOne.position.y = 100;
    playerOne.aimPosition.x = 100;
    playerOne.aimPosition.y = 100;
    playerOne.velocity.x = 0;
    playerOne.velocity.y = 0;
    playerOne.speed = 100;
    playerOne.shootCooldown = 2.0;
    playerOne.currentShootCooldown = playerOne.shootCooldown;

    int lastTime = 0;
    int deltaTime = 0;

    while (true) {
        input();

        if (ctrl.buttons & SCE_CTRL_START) break;

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