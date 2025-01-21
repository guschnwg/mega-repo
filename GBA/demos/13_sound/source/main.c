// make GAME=demos/13_sound run

#include "tonc_input.h"
#include "tonc_types.h"
#include <tonc.h>

int counter = 0;

void note_print(int note, int octave) {
  static int y = 8;
  char str[32];

  siprintf(str, "[%d - %d]", note, octave);
  se_puts(8, y, str, 0);

  y += 8;
}

// Play the actual note
void note_play(int note, int octave) {
  REG_SND1FREQ = SFREQ_RESET | SND_RATE(note, octave);
  note_print(note, octave);
}

bool sos() {
  static int inner_counter = 0;
  int step = 4;

  const u8 notes[12] = {0x02, 0x05, 0x12, 0x12, 0x12, 0x12,
                        0x02, 0x05, 0x12, 0x12, 0x12, 0x12};

  int note_idx = inner_counter >> step;
  note_play(notes[note_idx] & 15, notes[note_idx] >> 4);

  inner_counter++;
  bool finished = inner_counter >= (12 << step);
  if (finished)
    inner_counter = 0;

  return !finished;
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;

  // Configure the interrupts for VBlankIntrDelay
  irq_init(NULL);
  irq_add(II_VBLANK, NULL);

  // Configure a simple font
  txt_init_std();
  txt_init_se(0, BG_CBB(0) | BG_SBB(31), 0, CLR_ORANGE, 0);

  REG_SNDSTAT = SSTAT_ENABLE;                  // turn sound on
  REG_SNDDMGCNT = SDMG_BUILD_LR(SDMG_SQR1, 7); // snd1 on, full volume
  REG_SNDDSCNT = SDS_DMG100;                   // DMG ratio to 100%

  REG_SND1SWEEP = SSW_OFF; // no sweep
  // envelope: vol=12, decay, max step time (7) ; 50% duty
  REG_SND1CNT = SSQR_ENV_BUILD(12, 0, 7) | SSQR_DUTY1_2;
  REG_SND1FREQ = 0;

  int octave = 0;
  char dot[2] = ".";
  int x = 0, y = 0;
  bool sos_play = false;

  while (1) {
    vid_vsync();
    key_poll();

    // Change octave:
    octave += bit_tribool(key_hit(-1), KI_R, KI_L);
    octave = wrap(octave, -2, 6);

    x += key_tri_horz();
    y += key_tri_vert();

    if (key_hit(KEY_A))
      sos_play = true;
    else if (key_hit(KEY_B))
      note_play(NOTE_D, octave + 1);

    if (sos_play)
      sos_play = sos();

    se_puts(x, y, dot, 0);

    counter += 1;
  }
  return 0;
}
