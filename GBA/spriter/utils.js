const viewIndexesEl = document.getElementById("view-indexes");
const mirrorHorizontalEl = document.getElementById("mirror-horizontal");
const mirrorVerticalEl = document.getElementById("mirror-vertical");
const mirrorDiagonalEl = document.getElementById("mirror-diagonal");
const sizeEl = document.getElementById("size");
const spriteSelectedEl = document.getElementById("sprite");
const colorPickerEl = document.getElementById("color");
const currentColorEl = document.getElementById("current-color");
const paletteEl = document.getElementById("palette");
const paletteContainer = document.getElementById("palettes");
const resultEl = document.getElementById("resulting-image");
const spritesContainerEl = document.getElementById("sprites-container");
let drawing = false;

let sprites = [];

let palettes = Array.from({ length: 16 }, () =>
  Array.from({ length: 16 }, () => "#000000"),
);

function init() {
  viewIndexesEl.checked = localStorage.getItem("view-indexes") === "true";
  mirrorVerticalEl.checked = localStorage.getItem("mirror-vertical") === "true";
  mirrorDiagonalEl.checked = localStorage.getItem("mirror-diagonal") === "true";
  mirrorHorizontalEl.checked =
    localStorage.getItem("mirror-horizontal") === "true";
  sizeEl.value = localStorage.getItem("size") || 16;
  colorPickerEl.value = localStorage.getItem("color") || 0;
  paletteEl.value = localStorage.getItem("palette") || 0;
  spriteSelectedEl.value = localStorage.getItem("sprite") || 0;
  sprites = JSON.parse(localStorage.getItem("sprites")) || sprites;
  palettes = JSON.parse(localStorage.getItem("palettes")) || palettes;
}

function save() {
  localStorage.setItem("view-indexes", viewIndexesEl.checked);
  localStorage.setItem("mirror-vertical", mirrorVerticalEl.checked);
  localStorage.setItem("mirror-horizontal", mirrorHorizontalEl.checked);
  localStorage.setItem("mirror-diagonal", mirrorDiagonalEl.checked);
  localStorage.setItem("size", sizeEl.value);
  localStorage.setItem("color", colorPickerEl.value);
  localStorage.setItem("palette", paletteEl.value);
  localStorage.setItem("sprite", spriteSelectedEl.value);
  localStorage.setItem("sprites", JSON.stringify(sprites));
  localStorage.setItem("palettes", JSON.stringify(palettes));
}

function reset() {
  localStorage.clear();
  window.location.reload();
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function isTooDark(c) {
  var r = parseInt(c.substr(1, 2), 16);
  var g = parseInt(c.substr(3, 2), 16);
  var b = parseInt(c.substr(4, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 120;
}

function getSpriteSize() {
  return sizeEl.valueAsNumber;
}

function getMirrorState() {
  return {
    horizontal: mirrorHorizontalEl.checked,
    vertical: mirrorVerticalEl.checked,
    diagonal: mirrorDiagonalEl.checked,
  };
}

function getPaletteIdx() {
  return paletteEl.valueAsNumber;
}

function paletteSelectedIs(idx) {
  return idx === getPaletteIdx();
}

function getCurrentPalette() {
  return palettes[getPaletteIdx()];
}

function getPaletteColorIdx() {
  return colorPickerEl.valueAsNumber;
}

function setPaletteColorIdx(idx) {
  colorPickerEl.value = idx;
}

function paletteColorSelectedIs(idx) {
  return idx === getPaletteColorIdx();
}

function paletteAndColorSelectedAre(paletteIdx, colorIdx) {
  return paletteSelectedIs(paletteIdx) && paletteColorSelectedIs(colorIdx);
}

function setCurrentColor(color) {
  currentColorEl.value = color;
}

function putItem(sprite, x, y, color) {
  const item = sprite.find((item) => item.x === x && item.y === y);

  if (item) {
    item.palette = color;
  } else {
    sprite.push({
      x,
      y,
      palette: color,
    });
  }

  save();
}

function drawResultingImage(el, sprites, palettes) {
  // 6 per row
  const spriteSize = getSpriteSize();
  const image = new window._pnglibEs2(
    spriteSize * clamp(sprites.length, 0, 6),
    spriteSize * (parseInt((sprites.length - 1) / 6) + 1),
    256,
  );

  palettes.forEach((p) => p.forEach((c) => image.createColor(c)));

  sprites.forEach((sprite, idx) => {
    sprite.forEach((item) => {
      if (item.x > spriteSize - 1 || item.y > spriteSize - 1) {
        // In case we had an image of 17x17 and we are trying to draw it in a 16x16 sprite
        return;
      }

      let xInc = (idx % 6) * spriteSize;
      let yInc = idx > 5 ? spriteSize * parseInt(idx / 6) : 0;

      image.setPixel(item.x + xInc, item.y + yInc, Number(item.palette));
    });
  });
  el.src = image.getDataURL();
}

function newSprite() {
  let items = [];
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      items.push({ x, y, palette: 0 });
    }
  }
  return items;
}

function addItem(sprite, x, y) {
  const color = getPaletteColorIdx();

  const mirrorX = getSpriteSize() - x - 1;
  const mirrorY = getSpriteSize() - y - 1;

  putItem(sprite, x, y, color);

  const mirror = getMirrorState();

  if (mirror.horizontal) {
    putItem(sprite, mirrorX, y, color);
  }
  if (mirror.vertical) {
    putItem(sprite, x, mirrorY, color);
  }
  if (mirror.diagonal) {
    putItem(sprite, mirrorX, mirrorY, color);
  }
}

function addItemFromEvent(sprite, e) {
  const x = Math.floor(e.offsetX / 10);
  const y = Math.floor(e.offsetY / 10);

  addItem(sprite, x, y);
}
