// make GAME=demos/14_audio run
//
// https://ianfinlayson.net/class/cpsc305/notes/19-sound
//
// One should then compress the tracks to Mono by clicking “Tracks -> Stereo
// Track to Mono”. While the GBA can do stereo sound, we will not handle that
// here. The sample rate of the sound can also be changed at the bottom of the
// screen. The higher the rate, the better the quality, but the larger the file.
//
// To export the data, click “File -> Export Audio”. Then we must choose “Other
// uncompressed files” from the option menu. Then “RAW (header-less)” from the
// Header menu, and “Signed 8-bit PCM” from the Encoding menu. Typically such
// files are named .raw
//
// This file will now contain the audio information in a
// direct format which can be used by the GBA. Because the file has no header,
// it doesn’t convey any information about what sort of file it is, or the
// sample rate, or anything else.
//
// In order to load the file into a GBA program,
// we must get this file into the .gba file somehow. Again the simplest way is
// to convert it into an array of data and pass it along to our compiler. To
// help with this, I have a program called raw2gba. This is similar to the
// png2gba program, but dumps the raw audio into a .h file.
//
// We can run the
// program on a .raw file to produce a .h file, and then include that into a
// program.
//
// ./raw2gba/raw2gba ./demos/14_audio/source/lp.raw
//

#include <tonc.h>

#include "lp.h"
#include "tonc_bios.h"
#include "tonc_video.h"
#include "zelda_music_16K_mono.h"

/* the GBA clock speed is fixed at this rate */
#define CLOCK 16777216
#define CYCLES_PER_BLANK 280806

unsigned int channel_a_vblanks_remaining = 0;
unsigned int channel_a_total_vblanks = 0;
u32 counter = 0;

void set_text(char *str, int row, int col) {
  int index = row * 32 + col;
  int missing = 32;

  while (*str) {
    se_mem[24][index] = *str - missing;

    index++;
    str++;
  }
}

void play_sound(const signed char *sound, int total_samples, int sample_rate) {
  REG_TM0CNT_H = 0;
  REG_DMA1CNT = 0;

  REG_SNDDSCNT |= SDS_AR | SDS_AL | SDS_ARESET;

  REG_SNDSTAT = SSTAT_ENABLE;

  REG_DMA1SAD = (u32)sound;
  REG_DMA1DAD = (u32)&REG_FIFO_A;
  REG_DMA1CNT =
      DMA_DST_FIXED | DMA_REPEAT | DMA_32 | DMA_AT_REFRESH | DMA_ENABLE;

  unsigned short ticks_per_sample = CLOCK / sample_rate;
  REG_TM0CNT_L = 65536 - ticks_per_sample;

  channel_a_vblanks_remaining =
      total_samples * ticks_per_sample * (1.0 / CYCLES_PER_BLANK);
  channel_a_total_vblanks = channel_a_vblanks_remaining;

  set_text("play_sound", 1, 0);

  REG_TM0CNT_H = TM_ENABLE | TM_FREQ_1;
}

void on_vblank() {
  counter++;

  REG_IME = 0;
  unsigned short temp = REG_IF;

  if (channel_a_vblanks_remaining == 0) {
    channel_a_vblanks_remaining = channel_a_total_vblanks;
    REG_DMA1CNT = 0;
    REG_DMA1SAD = (unsigned int)lp;
    REG_DMA1CNT =
        DMA_DST_FIXED | DMA_REPEAT | DMA_32 | DMA_AT_REFRESH | DMA_ENABLE;
  } else {
    channel_a_vblanks_remaining--;
  }

  REG_IF = temp;
  REG_IME = 1;
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  txt_init_std();
  txt_init_se(0, BG_CBB(0) | BG_SBB(24), 0, CLR_WHITE, 0x0E);

  REG_IME = 0;
  irq_init(NULL);
  irq_add(II_VBLANK, on_vblank);
  REG_IE |= IRQ_VBLANK;
  REG_DISPSTAT |= DSTAT_VBL_IRQ;
  REG_IME = 1;

  REG_SNDDSCNT = 0;

  set_text("Playing sounds...", 0, 0);
  play_sound(lp, lp_bytes, 16000);

  int x = 0, y = 0;
  while (1) {
    key_poll();

    x += key_tri_horz();
    y += key_tri_vert();

    char a_remaining[32];
    sprintf(a_remaining, "A = %d  %d  ", channel_a_vblanks_remaining, counter);
    set_text(a_remaining, 2, 0);

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }

  return 0;
}