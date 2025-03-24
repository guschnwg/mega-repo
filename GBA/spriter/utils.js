const viewIndexesEl = document.getElementById("view-indexes");
const mirrorHorizontalEl = document.getElementById("mirror-horizontal");
const mirrorVerticalEl = document.getElementById("mirror-vertical");
const mirrorDiagonalEl = document.getElementById("mirror-diagonal");
const sizeWidthEl = document.getElementById("size-width");
const sizeHeightEl = document.getElementById("size-height");
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
const backgroundEl = document.getElementById("background");
const backgroundOpacityEl = document.getElementById("background-opacity");
const scaleEl = document.getElementById("scale");
const exampleEl = document.getElementById("example");
const exampleContainerEl = document.getElementById("example-container");
const backgroundConfigIncrementEl = document.getElementById(
  "background-config-increment",
);
const backgroundConfigIncrementIntervalEl = document.getElementById(
  "background-config-increment-interval",
);
const exampleSelectedEl = document.getElementById("example-selected");

let drawing = false;
let lineStart = {};
let backgroundPositioning = {
  x: 0,
  y: 0,
  zoomX: 100,
  zoomY: 100,
};

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
  sizeWidthEl.value = localStorage.getItem("size-width") || 16;
  sizeHeightEl.value = localStorage.getItem("size-height") || 16;
  colorPickerEl.value = localStorage.getItem("color") || 0;
  paletteEl.value = localStorage.getItem("palette") || 0;
  spriteSelectedEl.value = localStorage.getItem("sprite") || 0;
  sprites = JSON.parse(localStorage.getItem("sprites")) || sprites;
  palettes = JSON.parse(localStorage.getItem("palettes")) || palettes;
  backgroundEl.pictureAsBase64 = localStorage.getItem("background") || "";
  backgroundOpacityEl.checked =
    localStorage.getItem("background-opacity") === "true";
  backgroundPositioning =
    JSON.parse(localStorage.getItem("background-position")) ||
    backgroundPositioning;
  backgroundConfigIncrementEl.value = Number(backgroundPositioning.incrementBy);
  backgroundConfigIncrementIntervalEl.value = Number(
    backgroundPositioning.interval,
  );
  scaleEl.value = localStorage.getItem("scale") || 10;
  exampleEl.value = localStorage.getItem("example") || "";
  exampleSelectedEl.value = Number(localStorage.getItem("example-selected") || -1);
}

function loadFromDefaults() {
  Object.entries(defaultValues).forEach(([key, value]) =>
    window.localStorage.setItem(
      key,
      typeof value === "object" ? JSON.stringify(value) : value,
    ),
  );
  init();
  update();
  draw();
}

function save() {
  localStorage.setItem("view-indexes", viewIndexesEl.checked);
  localStorage.setItem("mirror-vertical", mirrorVerticalEl.checked);
  localStorage.setItem("mirror-horizontal", mirrorHorizontalEl.checked);
  localStorage.setItem("mirror-diagonal", mirrorDiagonalEl.checked);
  localStorage.setItem("size-width", sizeWidthEl.value);
  localStorage.setItem("size-height", sizeHeightEl.value);
  localStorage.setItem("color", colorPickerEl.value);
  localStorage.setItem("palette", paletteEl.value);
  localStorage.setItem("sprite", spriteSelectedEl.value);
  localStorage.setItem("sprites", JSON.stringify(sprites));
  localStorage.setItem("palettes", JSON.stringify(palettes));
  localStorage.setItem("background", backgroundEl.pictureAsBase64);
  localStorage.setItem("background-opacity", backgroundOpacityEl.checked);
  localStorage.setItem(
    "background-position",
    JSON.stringify({
      ...backgroundPositioning,
      incrementBy: backgroundConfigIncrementEl.valueAsNumber,
      interval: backgroundConfigIncrementIntervalEl.valueAsNumber,
    }),
  );
  localStorage.setItem("scale", scaleEl.value);
  localStorage.setItem("example", exampleEl.value);
  localStorage.setItem("example-selected", exampleSelectedEl.valueAsNumber);
}

function reset() {
  localStorage.clear();
  window.location.reload();
}

function backgroundRemove() {
  backgroundEl.pictureAsBase64 = null;
  backgroundOpacityEl.checked = false;
  backgroundPosition("reset");
  update();
  save();
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
  return {
    x: sizeWidthEl.valueAsNumber,
    y: sizeHeightEl.valueAsNumber,
  };
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

function getCanvasOpacity() {
  return backgroundOpacityEl.checked ? 0.5 : 1;
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

function getScale() {
  return scaleEl.valueAsNumber;
}

function getExample() {
  return exampleEl.value;
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
  const perRow = 6;
  const spriteSize = getSpriteSize();
  const image = new window._pnglibEs2(
    spriteSize.x * clamp(sprites.length, 0, perRow),
    spriteSize.y * (parseInt((sprites.length - 1) / perRow) + 1),
    256,
  );

  palettes.forEach((p) => p.forEach((c) => image.createColor(c)));

  sprites.forEach((sprite, idx) => {
    sprite.forEach((item) => {
      if (
        item.x < 0 ||
        item.x >= spriteSize.x ||
        item.y < 0 ||
        item.y >= spriteSize.y
      ) {
        // In case we had an image of 17x17 and we are trying to draw it in a 16x16 sprite
        return;
      }

      let xInc = (idx % perRow) * spriteSize.x;
      let yInc = idx >= perRow ? spriteSize.y * parseInt(idx / perRow) : 0;

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
  const spriteSize = getSpriteSize();

  putItem(sprite, x, y, color);

  const mirror = getMirrorState();
  const mirrorX = spriteSize.x - x - 1;
  const mirrorY = spriteSize.y - y - 1;

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

function processEvent(sprite, e, type, canvas) {
  const mode = getMode();
  const scale = getScale();

  if (mode === "pencil") {
    const x = Math.floor(e.offsetX / scale);
    const y = Math.floor(e.offsetY / scale);

    addItem(sprite, x, y);
  } else if (mode === "line") {
    if (type === "mousemove") return;

    const x = Math.floor(e.offsetX / scale);
    const y = Math.floor(e.offsetY / scale);

    if (!lineStart[canvas.id]) {
      lineStart[canvas.id] = { x, y };
    } else {
      const segments = linePixels(lineStart[canvas.id], { x, y });
      segments.forEach(({ x, y }) => addItem(sprite, x, y));
      lineStart[canvas.id] = null;
    }
  } else if (mode === "fill") {
    fill(sprite);
  } else if (mode === "rect") {
    const baseX = Math.floor(e.offsetX / scale);
    const baseY = Math.floor(e.offsetY / scale);

    const { x, y } = getRectDimensions();

    for (let ix = 0; ix < x; ix++) {
      for (let iy = 0; iy < y; iy++) {
        addItem(sprite, baseX + ix, baseY + iy);
      }
    }
  } else if (mode === "dropper") {
    const x = Math.floor(e.offsetX / scale);
    const y = Math.floor(e.offsetY / scale);

    const item = sprite.find((item) => item.x === x && item.y === y);
    if (item) {
      setPaletteColorIdx(item.palette);
    }
  }
}

function drawIndices(context, background, item) {
  const scale = getScale();

  context.fillStyle = getCurrentPalette()[item.palette];
  context.strokeStyle = getCurrentPalette()[item.palette];
  context.strokeRect(item.x * scale, item.y * scale, scale, scale);

  context.fillStyle = isTooDark(background) ? "white" : "black";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "8px serif";
  context.fillText(item.palette, item.x * scale + 5, item.y * scale + 5);
}

function addSprite() {
  sprites.push(newSprite());
  update();
}

function upsertPalette(pal, idx) {
  const holder =
    paletteContainer.childNodes[idx] || document.createElement("div");

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
  };
  holder.appendChild(randomize);

  paletteContainer.appendChild(holder);
}

function upsertPaletteColor(paletteColor, paletteColorIdx, holder, paletteIdx) {
  const div =
    holder.childNodes[paletteColorIdx] || document.createElement("div");

  div.classList.add("palette-color");
  div.style.backgroundColor = paletteColor;
  div.style.borderColor = paletteAndColorSelectedAre(paletteIdx, paletteColorIdx) ? "red" : "black";
  div.style.opacity = paletteSelectedIs(paletteIdx) ? 1 : 0.3;

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

function updateSprites(_sprites, container) {
  const scale = getScale();
  const spriteSize = getSpriteSize();

  container.style.width = `${(spriteSize.x * scale + 2) * 6}px`;
  _sprites.forEach((sprite, idx) => {
    let { spriteCanvas, spriteCtx } = upsertSpriteCanvas(
      idx,
      container,
      sprite,
    );

    spriteCanvas.style.opacity = getCanvasOpacity();
    spriteCanvas.width = spriteSize.x * scale;
    spriteCanvas.height = spriteSize.y * scale;

    draw(spriteCanvas, spriteCtx, sprite);

    if (container.contains(spriteCanvas)) return;

    container.appendChild(spriteCanvas);
  });
}

function linePixels(start, end) {
  const segments = [];

  // That is the Bresenham's line algorithm
  let x0 = start.x;
  let y0 = start.y;
  let x1 = end.x;
  let y1 = end.y;
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = Math.sign(x1 - x0);
  const sy = Math.sign(y1 - y0);

  let err = dx - dy;
  while (true) {
    segments.push({ x: x0, y: y0 });

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return segments;
}

function drawCursor(spriteCanvas, spriteCtx, e) {
  const mode = getMode();
  const scale = getScale();

  if (mode === "pencil") {
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.strokeRect(
      parseInt(e.offsetX / scale) * scale,
      parseInt(e.offsetY / scale) * scale,
      scale,
      scale,
    );
  } else if (mode === "line") {
    const x = parseInt(e.offsetX / scale);
    const y = parseInt(e.offsetY / scale);

    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.strokeRect(x * scale, y * scale, scale, scale);
    if (!lineStart[spriteCanvas.id]) return;

    const segments = linePixels(lineStart[spriteCanvas.id], { x, y });
    segments.forEach(({ x, y }) => {
      spriteCtx.strokeStyle = getCurrentColor();
      spriteCtx.strokeRect(x * scale, y * scale, scale, scale);
    });
  } else if (mode === "fill") {
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.fillStyle = spriteCtx.strokeStyle + "AA";
    spriteCtx.strokeRect(0, 0, spriteCanvas.width, spriteCanvas.height);
    spriteCtx.fillRect(0, 0, spriteCanvas.width, spriteCanvas.height);
  } else if (mode === "rect") {
    const { x, y } = getRectDimensions();
    spriteCtx.strokeStyle = getCurrentColor();
    spriteCtx.strokeRect(
      parseInt(e.offsetX / scale) * scale,
      parseInt(e.offsetY / scale) * scale,
      x * scale,
      y * scale,
    );
  }
}

function upsertSpriteCanvas(idx, container, sprite) {
  let spriteCanvas = container.childNodes[idx];
  if (spriteCanvas) {
    let spriteCtx = spriteCanvas.getContext("2d");
    return { spriteCanvas, spriteCtx };
  }

  spriteCanvas = document.createElement("canvas");
  spriteCanvas.attributes.idx = idx;
  let spriteCtx = spriteCanvas.getContext("2d");
  spriteCanvas.addEventListener("mousemove", (e) => {
    if (drawing) {
      processEvent(sprite, e, "mousemove", spriteCanvas);
    }
    update();
    // draw(spriteCanvas, spriteCtx, sprite);
    drawCursor(spriteCanvas, spriteCtx, e);
  });
  spriteCanvas.addEventListener("mouseleave", () => {
    update();
    // draw(spriteCanvas, spriteCtx, sprite);
  });
  spriteCanvas.addEventListener("click", (e) => {
    processEvent(sprite, e, "click", spriteCanvas);
    update();
    // draw(spriteCanvas, spriteCtx, sprite);
  });

  return { spriteCanvas, spriteCtx };
}

function update() {
  if (drawing) {
    document.body.style.cursor = "crosshair";
    document.body.style.backgroundColor = "#EFEFEF";
  } else {
    document.body.style.cursor = "default";
    document.body.style.backgroundColor = "white";
  }
  spriteSelectedEl.max = sprites.length - 1;
  spriteSelectedEl.nextElementSibling.innerHTML = `${getSpriteSelectedIdx()} (${sprites.length})`;
  setCurrentColor(getCurrentPalette()[getPaletteColorIdx()]);

  updatePalettes();
  updateSprites(sprites, spritesContainerEl);

  [spritesContainerEl, exampleContainerEl].forEach((el) => {
    if (backgroundEl.pictureAsBase64) {
      el.style.background = `url(${backgroundEl.pictureAsBase64})`;
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPositionX = backgroundPositioning.x + "px";
      el.style.backgroundPositionY = backgroundPositioning.y + "px";
      el.style.backgroundSize = backgroundPositioning.sizeX + "px" + " " + backgroundPositioning.sizeY + "px";
    } else {
      el.style.background = "none";
    }
  });

  updateExample();

  backgroundConfigIncrementEl.value = Number(backgroundPositioning.incrementBy);
}

function draw(element, context, sprite) {
  if (!sprite) return;

  const scale = getScale();

  const background = getCurrentPalette()[0];
  element.style.backgroundColor = background;
  const spriteSize = getSpriteSize();
  context.clearRect(0, 0, spriteSize.x * scale, spriteSize.y * scale);

  for (let item of sprite) {
    if (viewIndexesEl.checked) {
      drawIndices(context, background, item);
    } else {
      if (item.palette == 0) {
        // Draw transparent
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
            context.fillStyle = (x + y) % 2 === 0 ? "white" : "lightgray";
            context.fillRect(
              item.x * scale + (x * scale) / 2,
              item.y * scale + (y * scale) / 2,
              scale / 2,
              scale / 2,
            );
          }
        }
      } else {
        context.fillStyle = getCurrentPalette()[item.palette];
        context.fillRect(item.x * scale, item.y * scale, scale, scale);
      }
    }
  }

  drawResultingImage(resultEl, sprites, palettes);
}

function updateExample() {
  const example = getExample();
  if (!example) return;

  const frames = example.trim().split("\n\n");
  let maxFrameHeight = 0;

  frames.forEach((frame, frameIdx) => {
    const frameHolder =
      exampleContainerEl.children[frameIdx] || document.createElement("div");

    const lines = frame.trim().split("\n");
    lines.forEach((line, lineIdx) => {
      const holder =
        frameHolder.children[lineIdx] || document.createElement("div");

      const exampleSprites = [];
      const mirrorIdx = [];
      line
        .trim()
        .split(",")
        .forEach((spriteIndex, colIdx) => {
          if (!line) return;

          const spriteIdx = parseInt(spriteIndex.trim());
          exampleSprites.push(sprites[Math.abs(spriteIdx)]);

          // If negative, we should mirror it somehow
          if (spriteIdx < 0) {
            mirrorIdx.push(colIdx);
          }
        });
      updateSprites(exampleSprites, holder);
      holder.style.width = `${exampleSprites.length * getSpriteSize().x * getScale()}px`;
      mirrorIdx.forEach((idx) => {
        holder.children[idx].style.transform = "scaleX(-1)";
      });

      if (frameHolder.contains(holder)) return;

      frameHolder.appendChild(holder);
    });

    if (lines.length > maxFrameHeight) {
      maxFrameHeight = lines.length;
    }

    if (exampleSelectedEl.valueAsNumber === -1) {
      frameHolder.style.opacity = 1;
      frameHolder.style.pointerEvents = "all";
      frameHolder.style.position = "relative";
    } else {
      frameHolder.style.position = "absolute";
      if (exampleSelectedEl.valueAsNumber === frameIdx) {
        frameHolder.style.opacity = 1;
        frameHolder.style.pointerEvents = "all";
        frameHolder.style.zIndex = frames.length + 1;
      } else {
        frameHolder.style.opacity = 0.3;
        frameHolder.style.pointerEvents = "none";
        frameHolder.style.zIndex = frameIdx;
      }
    }

    exampleContainerEl.style.minHeight = `${maxFrameHeight * (getSpriteSize().y * getScale() + 2)}px`;

    if (exampleContainerEl.contains(frameHolder)) return;

    exampleContainerEl.appendChild(frameHolder);
  });

  exampleSelectedEl.min = -1;
  exampleSelectedEl.max = frames.length - 1;
  exampleSelectedEl.nextElementSibling.innerHTML = exampleSelectedEl.value;
}

function randomizeSprite() {
  sprites[getSpriteSelectedIdx()].forEach((item) => {
    item.palette = Math.floor(Math.random() * 16);
  });
  update();
}

function copy(fromSpriteIdx) {
  if (!fromSpriteIdx) return;

  const _fromSpriteIdx = parseInt(fromSpriteIdx);
  if (_fromSpriteIdx < 0 || _fromSpriteIdx >= sprites.length) return;

  const fromSprite = sprites[_fromSpriteIdx];
  const toSprite = sprites[getSpriteSelectedIdx()];

  fromSprite.forEach((item, idx) => {
    toSprite[idx].palette = item.palette;
    toSprite[idx].x = item.x;
  });

  update();
  save();
}

function fill(sprite = sprites[getSpriteSelectedIdx()]) {
  sprite.forEach((item) => {
    item.palette = getPaletteColorIdx();
  });
  update();
}

function backgroundPosition(action, value) {
  const increment = backgroundPositioning.incrementBy;
  const defValue = { x: 0, y: 0, zoom: 100, incrementBy: 1 };

  if (action === "left") backgroundPositioning.x -= increment;
  else if (action === "right") backgroundPositioning.x += increment;
  else if (action === "up") backgroundPositioning.y -= increment;
  else if (action === "down") backgroundPositioning.y += increment;
  else if (action === "size-x-in") backgroundPositioning.sizeX += increment;
  else if (action === "size-x-out") backgroundPositioning.sizeX -= increment;
  else if (action === "size-y-in") backgroundPositioning.sizeY += increment;
  else if (action === "size-y-out") backgroundPositioning.sizeY -= increment;
  else if (action === "reset") backgroundPositioning = defValue;
  else if (action === "increment") backgroundPositioning.incrementBy = value;
  else if (action === "interval") backgroundPositioning.interval = value;

  update();
  save();
}

function clickAndHold(e) {
  e.preventDefault();
  const interval = setInterval(() => e.target.click(), backgroundPositioning.interval);
  const listener = () => {
    clearInterval(interval);
    e.target.removeEventListener("mouseup", listener);
    e.target.removeEventListener("mouseleave", listener);
  };
  e.target.addEventListener("mouseup", listener);
  e.target.addEventListener("mouseleave", listener);
}
