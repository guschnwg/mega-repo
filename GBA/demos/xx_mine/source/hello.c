//
//! \file hello_demo.c
//!   Screen-entry text demo
//! \date 20060228 - 20080416
//! \author cearn
//
// === NOTES ===

#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "demo.h"

OBJ_ATTR obj_buffer[128];
OBJ_AFFINE *obj_aff_buffer = (OBJ_AFFINE *)obj_buffer;

int main() {
  // Demos

  // level_one();
  // level_two();
  // level_three();
  // level_four();
  // level_five();
  // level_six();
  // level_seven();
  level_eight();

  return 0;
}
