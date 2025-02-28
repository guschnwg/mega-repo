const preview = document.getElementById("preview-canvas");
const previewCtx = preview.getContext("2d");

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
