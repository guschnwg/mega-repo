#!/bin/bash

sed -i '' '/^#define IWRAM_CODE __attribute__((section(".iwram"), long_call))/c\
#ifdef __MACH__\
#define IWRAM_CODE __attribute__((section("__TEXT,.iwram")))\
#else\
#define IWRAM_CODE __attribute__((section(".iwram"), long_call))\
#endif\
' libraries/libtonc/include/tonc_types.h

sed -i '' '/^#define EWRAM_DATA __attribute__((section(".ewram")))/c\
#ifdef __MACH__\
#define EWRAM_DATA __attribute__((section("__TEXT,.ewram")))\
#else\
#define EWRAM_DATA __attribute__((section(".ewram")))\
#endif\
' libraries/libtonc/include/tonc_types.h

sed -i '' '/^#define EWRAM_CODE __attribute__((section(".ewram"), long_call))/c\
#ifdef __MACH__\
#define EWRAM_CODE __attribute__((section("__TEXT,.ewram")))\
#else\
#define EWRAM_CODE __attribute__((section(".ewram"), long_call))\
#endif\
' libraries/libtonc/include/tonc_types.h