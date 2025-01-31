// make GAME=demos/15_sound_with_irq run

#include "tonc_input.h"
#include <tonc.h>

const u8 waits[6] = {8, 8, 32, 8, 8, 32};
const u8 notes[6] = {0x02, 0x05, 0x12, 0x02, 0x05, 0x12};

void on_vblank() {
  static int cooldown = 0;
  static int index = 0;

  if (cooldown == 0) {
    char str[32];
    siprintf(str, "[%d]", index);
    tte_write(str);

    REG_SND1FREQ = SFREQ_RESET | SND_RATE(notes[index] & 15, notes[index] >> 4);
    cooldown = waits[index];

    index = wrap(index + 1, 0, 6);
  } else {
    tte_write(".");
    cooldown--;
  }
}

int main() {
  // Graphics setup
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;
  tte_init_bmp_default(3);

  // Interrupt setup
  REG_IME = 0;
  irq_init(NULL);
  irq_add(II_VBLANK, on_vblank);
  REG_IE |= IRQ_VBLANK;
  REG_DISPSTAT |= DSTAT_VBL_IRQ;
  REG_IME = 1;

  // Sound setup
  REG_SNDSTAT = SSTAT_ENABLE;
  REG_SNDDMGCNT = SDMG_BUILD_LR(SDMG_SQR1, 7);
  REG_SNDDSCNT = SDS_DMG100;
  REG_SND1SWEEP = SSW_OFF;
  REG_SND1CNT = SSQR_ENV_BUILD(12, 0, 7) | SSQR_DUTY1_2;
  REG_SND1FREQ = 0;

  // Input setup
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  while (1) {
    key_poll();
  }
  return 0;
}
