function run(forbiddenIndex, shifter, increment, counter = 0) {
  let shifted = counter >> shifter;

  counter += increment;
  if (shifted == forbiddenIndex) {
    counter = 0;
    shifted = 0;
  }

  // Shifted is the index of the array that we would access
  console.log(counter, counter.toString(2), shifted, shifted.toString(2));

  setTimeout(() => run(forbiddenIndex, shifter, increment, counter), 16);
}

// Those numbers are arbitrary, I don't know if there is any relation between them

let forbiddenIndex = 0b11000;  // 24
let shifter        = 0b111;    // 8  TODO: what is the relation of this with forbiddenIndex?
let increment      = 0b1100;   // 12 TODO: what is the relation of this with forbiddenIndex?
// 0b11000000 (194) takes  16 interations to reset the counter with 0b111 in shifter (skips some indexes)
//  0b1100000 ( 96) takes  32 interations to reset the counter with 0b111 in shifter (access some indexes more than others)
//   0b110000 ( 48) takes  64 interations to reset the counter with 0b111 in shifter (the same as above probably)
//    0b11000 ( 24) takes 128 interations to reset the counter with 0b111 in shifter (the same as above probably)
//     0b1100 ( 12) takes 256 interations to reset the counter with 0b111 in shifter (the same as above probably)

setTimeout(() => run(forbiddenIndex, shifter, increment), 16);
