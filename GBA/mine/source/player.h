#ifndef PLAYER_H
#define PLAYER_H

typedef struct TSprite {
  int x, y;   //!< Position
  int vx, vy; //!< Velocity
  int state;  //!< Sprite state
  int dir;    //!< Look direction
  int objId;  //!< Object index
  int frame;
} TSprite;

void player_init(TSprite *player, int objId, int x, int y, int palette);
void player_update(TSprite *player, int palette);

#endif