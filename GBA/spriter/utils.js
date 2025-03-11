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
const modeEls = document.getElementsByName("mode");
const rectWidthEl = document.getElementById("rect-width");
const rectHeightEl = document.getElementById("rect-height");

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

function setPaletteIdx(idx) {
  paletteEl.value = idx;
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

function getCurrentColor() {
  return currentColorEl.value;
}

function setCurrentColor(color) {
  currentColorEl.value = color;
}

function getSpriteSelectedIdx() {
  return spriteSelectedEl.valueAsNumber;
}

function getMode() {
  return Array.from(modeEls).find((el) => el.checked).value;
}

function getRectDimensions() {
  return {
    x: rectWidthEl.valueAsNumber,
    y: rectHeightEl.valueAsNumber,
  };
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

function processEvent(sprite, e) {
  const mode = getMode();

  if (mode === "pencil") {
    const x = Math.floor(e.offsetX / 10);
    const y = Math.floor(e.offsetY / 10);

    addItem(sprite, x, y);
  } else if (mode === "line") {
  } else if (mode === "fill") {
    fill(sprite);
  } else if (mode === "rect") {
    const baseX = Math.floor(e.offsetX / 10);
    const baseY = Math.floor(e.offsetY / 10);

    const { x, y } = getRectDimensions();

    for (let ix = 0; ix < x; ix++) {
      for (let iy = 0; iy < y; iy++) {
        addItem(sprite, baseX + ix, baseY + iy);
      }
    }
  }
}

function drawIndices(context, background, item) {
  context.fillStyle = getCurrentPalette()[item.palette];
  context.strokeStyle = getCurrentPalette()[item.palette];
  context.strokeRect(item.x * 10, item.y * 10, 10, 10);

  context.fillStyle = isTooDark(background) ? "white" : "black";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "8px serif";
  context.fillText(item.palette, item.x * 10 + 5, item.y * 10 + 5);
}

function addSprite() {
  sprites.push(newSprite());
  update();
}

function upsertPalette(pal, idx) {
  const holder =
    paletteContainer.childNodes[idx] || document.createElement("div");

  if (idx === getPaletteIdx()) {
    holder.style.border = "1px solid black";
  }

  pal.forEach((paletteColor, paletteColorIdx) => {
    upsertPaletteColor(paletteColor, paletteColorIdx, holder, idx);
  });

  if (paletteContainer.contains(holder)) return;

  const randomize = document.createElement("button");
  randomize.innerHTML = "🎲";
  randomize.onclick = () => {
    for (let i = 0; i < 16; i++) {
      const rand = Math.random() * 16777215;
      const hex = Math.floor(rand).toString(16);
      pal[i] = "#" + hex.padStart(6, "0");
    }
    update();
    drawAll();
  };
  holder.appendChild(randomize);

  paletteContainer.appendChild(holder);
}

function upsertPaletteColor(paletteColor, paletteColorIdx, holder, paletteIdx) {
  const div =
    holder.childNodes[paletteColorIdx] || document.createElement("div");

  div.style.margin = 1;
  div.style.backgroundColor = paletteColor;
  div.style.width = 20;
  div.style.height = 20;
  div.style.border = `2px solid ${paletteAndColorSelectedAre(paletteIdx, paletteColorIdx) ? "red" : "black"}`;
  div.style.display = "inline-block";
  div.style.boxShadow = "inset white 0 0 0px 2px";
  div.style.opacity = paletteSelectedIs(paletteIdx) ? 1 : 0.5;

  if (holder.contains(div)) return;

  div.onclick = () => {
    if (!paletteSelectedIs(paletteIdx)) {
      setPaletteIdx(paletteIdx);
    }

    if (paletteColorSelectedIs(paletteColorIdx)) {
      currentColorEl.click(); // Open color picker
    } else {
      setPaletteColorIdx(paletteColorIdx);
    }

    update();
  };

  holder.appendChild(div);
}

function updatePalettes() {
  palettes.forEach((pal, idx) => upsertPalette(pal, idx));
}

function updateSprites() {
  spritesContainerEl.style.width = `${(getSpriteSize() * 10 + 2) * 6}px`;
  sprites.forEach((sprite, idx) => {
    let { spriteCanvas, spriteCtx } = upsertSpriteCanvas(idx);

    spriteCanvas.width = getSpriteSize() * 10;
    spriteCanvas.height = getSpriteSize() * 10;

    draw(spriteCanvas, spriteCtx, sprite);

    if (spritesContainerEl.contains(spriteCanvas)) return;

    spritesContainerEl.appendChild(spriteCanvas);
  });
}

function drawCursor(spriteCanvas, spriteCtx, e) {
  const mode = getMode();

  if (mode === "pencil") {
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.strokeRect(
      parseInt(e.offsetX / 10) * 10,
      parseInt(e.offsetY / 10) * 10,
      10,
      10,
    );
  } else if (mode === "line") {
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.strokeRect(
      parseInt(e.offsetX / 10) * 10,
      parseInt(e.offsetY / 10) * 10,
      10,
      10,
    );
  } else if (mode === "fill") {
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.fillStyle = spriteCtx.strokeStyle + "AA";
    spriteCtx.strokeRect(0, 0, spriteCanvas.width, spriteCanvas.height);
    spriteCtx.fillRect(0, 0, spriteCanvas.width, spriteCanvas.height);
  } else if (mode === "rect") {
    const { x, y } = getRectDimensions();
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.strokeRect(
      parseInt(e.offsetX / 10) * 10,
      parseInt(e.offsetY / 10) * 10,
      x * 10,
      y * 10,
    );
  }
}

function upsertSpriteCanvas(idx) {
  let spriteCanvas = spritesContainerEl.childNodes[idx];
  if (spriteCanvas) {
    let spriteCtx = spriteCanvas.getContext("2d");
    return { spriteCanvas, spriteCtx };
  }

  spriteCanvas = document.createElement("canvas");
  let spriteCtx = spriteCanvas.getContext("2d");
  spriteCanvas.addEventListener("mousemove", (e) => {
    if (drawing) {
      processEvent(sprites[idx], e);
    }
    draw(spriteCanvas, spriteCtx, sprites[idx]);
    drawCursor(spriteCanvas, spriteCtx, e);
  });
  spriteCanvas.addEventListener("mouseleave", () => {
    update();
    draw(spriteCanvas, spriteCtx, sprites[idx]);
  });
  spriteCanvas.addEventListener("click", (e) => {
    processEvent(sprites[idx], e);
    draw(spriteCanvas, spriteCtx, sprites[idx]);
  });

  return { spriteCanvas, spriteCtx };
}

function update() {
  spriteSelectedEl.max = sprites.length - 1;
  spriteSelectedEl.nextElementSibling.innerHTML = `${getSpriteSelectedIdx()} (${sprites.length})`;
  setCurrentColor(getCurrentPalette()[getPaletteColorIdx()]);

  updatePalettes();
  updateSprites();
}

function draw(element, context, sprite = sprites[getSpriteSelectedIdx()]) {
  const background = getCurrentPalette()[0];
  element.style.backgroundColor = background;
  context.clearRect(0, 0, getSpriteSize() * 10, getSpriteSize() * 10);

  for (let item of sprite) {
    if (viewIndexesEl.checked) {
      drawIndices(context, background, item);
    } else {
      if (item.palette == 0) {
        // Draw transparent
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
            context.fillStyle = (x + y) % 2 === 0 ? "white" : "lightgray";
            context.fillRect(item.x * 10 + x * 5, item.y * 10 + y * 5, 5, 5);
          }
        }
      } else {
        context.fillStyle = getCurrentPalette()[item.palette];
        context.fillRect(item.x * 10, item.y * 10, 10, 10);
      }
    }
  }

  drawResultingImage(resultEl, sprites, palettes);
}

function drawAll() {
  for (let idx in sprites) {
    const el = spritesContainerEl.childNodes[idx];
    draw(el, el.getContext("2d"), sprites[idx]);
  }
}

function randomizeSprite() {
  sprites[getSpriteSelectedIdx()].forEach((item) => {
    item.palette = Math.floor(Math.random() * 16);
  });
  update();
}

function fill(sprite = sprites[getSpriteSelectedIdx()]) {
  sprite.forEach((item) => {
    item.palette = getPaletteColorIdx();
  });
  update();
}
