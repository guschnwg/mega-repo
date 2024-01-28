#include <stdbool.h>
#include <psp2common/ctrl.h>
#include <psp2/ctrl.h>
#include <psp2/touch.h>
#include "SDL2/SDL_image.h"

#include "vector.h"
#include "player.h"
#include "sound.h"


Player playerOne;
Player playerTwo;

void initPlayer(
    SDL_Renderer* gRenderer,
    Player* player,
    SceCtrlButtons* moveButtons,
    Vector2 (*aimFunc)(SceCtrlData* ctrl)
) {
    player->playing = false;
    player->position.x = 100;
    player->position.y = 100;
    player->velocity.x = 0;
    player->velocity.y = 0;
    player->speed = 100;
    player->texture = IMG_LoadTexture(gRenderer, "app0:/images/dogs.png");
    player->aimPosition.x = 0;
    player->aimPosition.y = 0;
    player->shootCooldown = 2.0;
    player->currentShootCooldown = 0;
    player->bullets.head = NULL;
    player->bullets.tail = NULL;

    player->upButton = moveButtons[0];
    player->downButton = moveButtons[1];
    player->leftButton = moveButtons[2];
    player->rightButton = moveButtons[3];
    player->allButtons = player->upButton | player->downButton | player->leftButton | player->rightButton;
    player->aimFunc = aimFunc;
}

Vector2 lAxis (SceCtrlData* ctrl) {
    return (Vector2) { ctrl->lx - 127, ctrl->ly - 127 };
}

Vector2 rAxis (SceCtrlData* ctrl) {
    return (Vector2) { ctrl->rx - 127, ctrl->ry - 127 };
}

void initPlayers(SDL_Renderer* gRenderer) {
    SceCtrlButtons playerOneButtons[] = {SCE_CTRL_UP, SCE_CTRL_DOWN, SCE_CTRL_LEFT, SCE_CTRL_RIGHT};
    SceCtrlButtons playerTwoButtons[] = {SCE_CTRL_TRIANGLE, SCE_CTRL_CROSS, SCE_CTRL_SQUARE, SCE_CTRL_CIRCLE};
    initPlayer(gRenderer, &playerOne, playerOneButtons, lAxis);
    initPlayer(gRenderer, &playerTwo, playerTwoButtons, rAxis);
}

void processPlayer(float deltaTime, SceCtrlData* ctrl, Player* player) {
    if (!player->playing) {
        if (player->allButtons & ctrl->buttons) {
            player->playing = true;
        }
        return;
    }

    if (ctrl->buttons & player->rightButton) player->velocity.x = 1;
    else if (ctrl->buttons & player->leftButton) player->velocity.x = -1;
    else player->velocity.x = 0;

    if (ctrl->buttons & player->downButton) player->velocity.y = 1;
    else if (ctrl->buttons & player->upButton) player->velocity.y = -1;
    else player->velocity.y = 0;

    player->position.x += player->velocity.x * player->speed * deltaTime;
    player->position.y += player->velocity.y * player->speed * deltaTime;

    Vector2 aimDirection = player->aimFunc(ctrl);
    handleSomeVariation(&aimDirection, -50, 50);
    normalize(&aimDirection);

    player->aimPosition = aimDirection;
    scale(&player->aimPosition, 50);
    add(&player->aimPosition, player->position);

    player->currentShootCooldown -= deltaTime;
    if (player->currentShootCooldown < 0) player->currentShootCooldown = 0;

    if (player->currentShootCooldown <= 0) {
        if (!isZero(&aimDirection)) {
            shoot(player, aimDirection, 5, 1);

            player->currentShootCooldown = player->shootCooldown;
        }
    }

    Bullet* current = player->bullets.head;
    while (current != NULL) {
        current->ttl -= deltaTime;
        if (current->ttl < 0) current->ttl = 0;

        if (current->ttl <= 0){
            if (current->previous != NULL) current->previous->next = current->next;
            if (current->next != NULL) current->next->previous = current->previous;
            if (current == player->bullets.head) player->bullets.head = current->next;
            if (current == player->bullets.tail) player->bullets.tail = current->previous;
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

void processPlayers(float deltaTime, SceCtrlData* ctrl, SceTouchData* touch) {
    processPlayer(deltaTime, ctrl, &playerOne);
    processPlayer(deltaTime, ctrl, &playerTwo);
}

void drawPlayer(SDL_Renderer* gRenderer, Player* player) {
    if (!player->playing) {
        return;
    }

    SDL_Rect playerRect = { player->position.x - 50, player->position.y - 50, 100, 100 };
    SDL_RenderCopy(gRenderer, player->texture, NULL, &playerRect);

    SDL_Rect aimRect = { player->aimPosition.x - 5, player->aimPosition.y - 5, 10, 10 };
    if (player->currentShootCooldown <= 0) SDL_SetRenderDrawColor(gRenderer, 0, 255, 0, 255);
    else                                     SDL_SetRenderDrawColor(gRenderer, 255, 0, 0, 255);
    printf("player->currentShootCooldown %f\n", player->currentShootCooldown);
    SDL_RenderFillRect(gRenderer, &aimRect);

    Bullet* current = player->bullets.head;
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
    SDL_RenderDrawPoint(gRenderer, player->position.x, player->position.y);
}

void drawPlayers(SDL_Renderer* gRenderer) {
    drawPlayer(gRenderer, &playerOne);
    drawPlayer(gRenderer, &playerTwo);
}

void shoot(Player* player, Vector2 direction, int ttl, int power) {
    Bullet* bullet = malloc(sizeof(Bullet));
    bullet->ttl = ttl;
    bullet->power = power;
    bullet->next = NULL;
    bullet->previous = player->bullets.tail;
    bullet->position = player->aimPosition;
    bullet->velocity = direction;
    bullet->speed = 25;

    if (player->bullets.head == NULL) {
        player->bullets.head = bullet;
        player->bullets.tail = bullet;
    } else {
        player->bullets.tail->next = bullet;
        player->bullets.tail = bullet;
    }

    quackPlay();
}