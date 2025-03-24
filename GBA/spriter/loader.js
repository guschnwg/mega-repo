const loaderEl = document.getElementById("loader");
const loaderFileEl = document.getElementById("loader-file");
const loaderCanvasEl = document.getElementById("loader-canvas");
const loaderCanvasScaledEl = document.getElementById("loader-canvas-scaled");
const loaderXEl = document.getElementById("loader-x");
const loaderYEl = document.getElementById("loader-y");
const loaderScaleXEl = document.getElementById("loader-scale-x");
const loaderScaleYEl = document.getElementById("loader-scale-y");
const loaderSpritesContainer = document.getElementById("loader-sprites-container");
const loaderPalettesContainer = document.getElementById("loader-palettes-container");

function createFromImage() {
  loaderEl.style.display = "block";
  document.body.addEventListener("keyup", e => {
    if (e.key === 'Escape') {
      loaderEl.style.display = "none";
    }
  })
}

function eventActualXandY(event, scale = getScale()) {
  const { offsetX, offsetY } = event;

  const x = Math.floor(offsetX / scale);
  const y = Math.floor(offsetY / scale);

  return { x, y };
}

function handleLoaderCanvasEvent(event_type) {
  if (event_type === 'mousedown') {
    return event => {
      updateLoader();
    };
  } else if (event_type === 'mousemove') {
    return event => {
      const { x, y } = eventActualXandY(event, 1);
      const { x: width, y: height } = getSpriteSize();

      loaderSpriteSelectedArea = { x, y, width, height };

      updateLoader();
    };
  }
  else if (event_type === 'mouseup') {
    return event => {
      updateLoader();
    };
  }
  else if (event_type === 'click') {
    return event => {
      const data = [];
      const imageData = loaderCanvasScaledEl.getContext("2d").getImageData(0, 0, 16, 16).data;

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        const color = '#' + tinycolor.rgbaToHex(r, g, b, a).slice(0, 6);

        // Make sure there is a palette for the color
        if (loaderData.palettes[color] === undefined) {
          // First int that was not used
          const validValue = Object.values(loaderData.palettes).length;
          loaderData.palettes[color] = validValue;
        }

        const x = (i / 4) % 16;
        const y = Math.floor((i / 4) / 16);
        data.push({ x, y, color });
      }

      loaderData.sprites.push({
        ...loaderSpriteSelectedArea,
        data,
      });
      updateLoader();
    };
  }
}

function drawLoaderCursors(ctx) {
  ctx.fillStyle = "green";
  ctx.fillRect(loaderSpriteSelectedArea.x, loaderSpriteSelectedArea.y, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width, loaderSpriteSelectedArea.y, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 2, loaderSpriteSelectedArea.y, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 3, loaderSpriteSelectedArea.y, 1, 1);

  ctx.fillRect(loaderSpriteSelectedArea.x, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 2, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 3, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height, 1, 1);

  ctx.fillRect(loaderSpriteSelectedArea.x, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 2, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 2, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 2, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 2, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 3, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 2, 1, 1);

  ctx.fillRect(loaderSpriteSelectedArea.x, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 3, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 3, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 2, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 3, 1, 1);
  ctx.fillRect(loaderSpriteSelectedArea.x + loaderSpriteSelectedArea.width * 3, loaderSpriteSelectedArea.y + loaderSpriteSelectedArea.height * 3, 1, 1);

  // Cursor
  ctx.fillStyle = "red";
  ctx.fillRect(loaderSpriteSelectedArea.x, loaderSpriteSelectedArea.y, 1, 1);
}

function updateLoader() {
  const ctx = loaderCanvasEl.getContext("2d");

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, loaderCanvasEl.width, loaderCanvasEl.height);

  if (loaderFileEl.image) {
    loaderCanvasEl.width = loaderFileEl.image.width + 20;
    loaderCanvasEl.height = loaderFileEl.image.height + 20;
    ctx.scale(loaderScaleXEl.valueAsNumber, loaderScaleYEl.valueAsNumber);
    ctx.drawImage(loaderFileEl.image, 10, 10);
    ctx.scale(1, 1);
  }

  // drawLoaderCursors(ctx);

  loaderCanvasEl.style.cursor = "crosshair";

  updateLoaderScaled(ctx);
  updateLoaderSprites();
  updateLoaderPalettes();
}

function updateLoaderScaled(normalCtx) {
  loaderCanvasScaledEl.width = getSpriteSize().x;
  loaderCanvasScaledEl.height = getSpriteSize().y;
  loaderCanvasScaledEl.style.zoom = 10;
  loaderCanvasScaledEl.style.imageRendering = 'crisp-edges';

  const ctx = loaderCanvasScaledEl.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.clearRect(0, 0, loaderCanvasScaledEl.width, loaderCanvasScaledEl.height);

  ctx.fillStyle = 'red';

  const imageData = normalCtx.getImageData(
    loaderSpriteSelectedArea.x - 8,
    loaderSpriteSelectedArea.y - 8,
    16,
    16
  );

  const auxCanvas = document.createElement("canvas");
  auxCanvas.width = 16;
  auxCanvas.height = 16;
  const auxCtx = auxCanvas.getContext("2d");
  auxCtx.putImageData(imageData, 0, 0);

  // ctx.scale(10, 10);
  // ctx.drawImage(auxCanvas, 0, 0, 16, 16, 0, 0, 16, 16);
  ctx.drawImage(auxCanvas, 0, 0);
}

function loaderToSprites(sprite) {
  return sprite.data.map(item => ({
    x: item.x,
    y: item.y,
    palette: loaderData.palettes[item.color],
  }));
}

function updateLoaderSprites() {
  loaderSpritesContainer.innerHTML = "";
  loaderData.sprites.forEach(sprite => {
    const canvas = document.createElement("canvas");
    canvas.height = getSpriteSize().y * getScale();
    canvas.width = getSpriteSize().x * getScale();
    const ctx = canvas.getContext("2d");
    draw(canvas, ctx, loaderToSprites(sprite));
    loaderSpritesContainer.appendChild(canvas);
  });
}

function updateLoaderPalettes() {
  loaderPalettesContainer.innerHTML = "";
  Object.entries(loaderData.palettes).forEach(([color, palette]) => {
    const span = document.createElement("span");
    span.innerHTML = color;
    span.style.backgroundColor = color;
    loaderPalettesContainer.appendChild(span);
    const input = document.createElement("input");
    input.type = 'number';
    input.min = 0;
    input.max = 15;
    input.value = palette;
    input.style.color = getCurrentPalette()[palette];
    input.addEventListener("input", event => {
      loaderData.palettes[color] = event.target.valueAsNumber;
      updateLoader();
    });
    loaderPalettesContainer.appendChild(input);
  });
}

function loaderConfirm() {
  loaderData.sprites.forEach(sprite => {
    sprites.push(loaderToSprites(sprite));
  });
  update();
  save();
  loaderEl.style.display = "none";
}
