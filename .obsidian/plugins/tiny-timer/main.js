"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TimerWidgetPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
function playAlarm() {
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  const notes = [659.25, 784, 987.75, 1318.5];
  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[i];
    gain.gain.setValueAtTime(0, now + i * 0.2);
    gain.gain.linearRampToValueAtTime(0.5, now + i * 0.2 + 0.03);
    gain.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.2);
    osc.stop(now + i * 0.2 + 0.18);
  }
  setTimeout(() => ctx.close(), 2e3);
}
var NS = "http://www.w3.org/2000/svg";
var CLOCK_SIZE = 80;
var CX = CLOCK_SIZE / 2;
var CY = CLOCK_SIZE / 2;
var R = 32;
function createClockSVG(container) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`);
  svg.setAttribute("width", `${CLOCK_SIZE}`);
  svg.setAttribute("height", `${CLOCK_SIZE}`);
  svg.classList.add("tw-clock");
  const circle = document.createElementNS(NS, "circle");
  circle.setAttribute("cx", `${CX}`);
  circle.setAttribute("cy", `${CY}`);
  circle.setAttribute("r", `${R + 2}`);
  circle.classList.add("tw-circle");
  svg.appendChild(circle);
  const arcPath = document.createElementNS(NS, "path");
  arcPath.classList.add("tw-arc");
  svg.appendChild(arcPath);
  const tickGroup = document.createElementNS(NS, "g");
  tickGroup.classList.add("tw-ticks");
  svg.appendChild(tickGroup);
  container.appendChild(svg);
  return { svg, arcPath, tickGroup };
}
function renderTicks(tickGroup, count) {
  while (tickGroup.firstChild) tickGroup.removeChild(tickGroup.firstChild);
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2 - Math.PI / 2;
    const isLong = count === 12 || i % 5 === 0;
    const innerR = isLong ? R - 6 : R - 4;
    const x1 = CX + Math.cos(angle) * innerR;
    const y1 = CY + Math.sin(angle) * innerR;
    const x2 = CX + Math.cos(angle) * R;
    const y2 = CY + Math.sin(angle) * R;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", `${x1}`);
    line.setAttribute("y1", `${y1}`);
    line.setAttribute("x2", `${x2}`);
    line.setAttribute("y2", `${y2}`);
    line.classList.add("tw-tick");
    if (isLong) line.classList.add("tw-tick-long");
    tickGroup.appendChild(line);
  }
}
function updateArc(arcPath, fraction) {
  if (fraction <= 0) {
    arcPath.setAttribute("d", "");
    return;
  }
  if (fraction >= 1) {
    arcPath.setAttribute(
      "d",
      `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX} ${CY + R} A ${R} ${R} 0 1 1 ${CX} ${CY - R}`
    );
    return;
  }
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + fraction * Math.PI * 2;
  const x1 = CX + Math.cos(startAngle) * R;
  const y1 = CY + Math.sin(startAngle) * R;
  const x2 = CX + Math.cos(endAngle) * R;
  const y2 = CY + Math.sin(endAngle) * R;
  const largeArc = fraction > 0.5 ? 1 : 0;
  arcPath.setAttribute(
    "d",
    `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`
  );
}
var Timer = class {
  constructor(parent, defaultValue) {
    this.totalMs = 0;
    this.remainingMs = 0;
    this.running = false;
    this.interval = null;
    this.tickCount = 12;
    this.lastInputValue = defaultValue;
    this.container = parent.createDiv();
    this.container.addClass("tw-timer");
    const clockContainer = this.container.createDiv();
    clockContainer.addClass("tw-clock-container");
    this.clockFace = createClockSVG(clockContainer);
    renderTicks(this.clockFace.tickGroup, 12);
    this.timeLabel = clockContainer.createDiv();
    this.timeLabel.addClass("tw-time-label");
    this.timeLabel.innerText = "00:00";
    const controls = this.container.createDiv();
    controls.addClass("tw-controls");
    this.playBtn = controls.createEl("button");
    this.playBtn.addClass("tw-button");
    (0, import_obsidian.setIcon)(this.playBtn, "play");
    this.playBtn.addEventListener("click", () => this.toggle());
    this.input = controls.createEl("input");
    this.input.addClass("tw-input");
    this.input.type = "text";
    this.input.inputMode = "decimal";
    this.input.placeholder = "min";
    this.input.value = defaultValue;
    this.input.addEventListener("focus", () => this.input.select());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.setFromInput();
        this.start();
        this.input.blur();
      }
    });
    this.setFromInput();
    this.updateDisplay();
  }
  parseMinutes(val) {
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) return 0;
    return Math.min(n, 720);
  }
  setFromInput() {
    const minutes = this.parseMinutes(this.input.value);
    if (minutes <= 0) return;
    this.lastInputValue = this.input.value;
    this.totalMs = minutes * 60 * 1e3;
    this.remainingMs = this.totalMs;
    const newTickCount = minutes <= 12 ? 12 : 60;
    if (newTickCount !== this.tickCount) {
      this.tickCount = newTickCount;
      renderTicks(this.clockFace.tickGroup, this.tickCount);
    }
    this.updateDisplay();
  }
  getLastInput() {
    return this.lastInputValue;
  }
  toggle() {
    if (this.running) {
      this.stop();
    } else {
      this.setFromInput();
      if (this.totalMs > 0) this.start();
    }
  }
  start() {
    if (this.remainingMs <= 0) return;
    if (this.interval !== null) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
    this.running = true;
    (0, import_obsidian.setIcon)(this.playBtn, "pause");
    const startTime = Date.now();
    const startRemaining = this.remainingMs;
    this.interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.remainingMs = Math.max(0, startRemaining - elapsed);
      this.updateDisplay();
      if (this.remainingMs <= 0) {
        this.stop();
        playAlarm();
        this.timeLabel.addClass("tw-alarm");
        setTimeout(() => this.timeLabel.removeClass("tw-alarm"), 3e3);
      }
    }, 100);
  }
  stop() {
    this.running = false;
    if (this.interval !== null) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
    (0, import_obsidian.setIcon)(this.playBtn, "play");
  }
  updateDisplay() {
    const totalSec = Math.ceil(this.remainingMs / 1e3);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    this.timeLabel.innerText = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    const fraction = this.totalMs > 0 ? this.remainingMs / this.totalMs : 0;
    updateArc(this.clockFace.arcPath, fraction);
  }
  destroy() {
    this.stop();
    this.container.remove();
  }
};
var FloatingWidget = class {
  constructor(app, visible) {
    this.grabOffsets = { top: 0, left: 0 };
    this.visible = visible;
    this.el = createDiv();
    this.el.addClass("tw-widget");
    if (visible) this.el.addClass("tw-widget-show");
    else this.el.addClass("tw-hidden");
    const top = this.el.createDiv();
    top.addClass("tw-widget-top");
    top.draggable = true;
    const blankImg = new Image();
    blankImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    top.addEventListener("dragstart", (e) => {
      e.dataTransfer.setDragImage(blankImg, 0, 0);
      e.dataTransfer.effectAllowed = "move";
      const rect = this.el.getBoundingClientRect();
      this.grabOffsets.top = e.clientY - rect.top;
      this.grabOffsets.left = e.clientX - rect.left;
    });
    const drag = (e) => {
      if (e.clientX <= 0 || e.clientY <= 0) return;
      this.el.style.left = `${e.clientX - this.grabOffsets.left}px`;
      this.el.style.top = `${e.clientY - this.grabOffsets.top}px`;
      this.el.style.right = "unset";
      this.el.style.bottom = "unset";
    };
    top.addEventListener("drag", drag);
    top.addEventListener("dragend", drag);
    const minimizeBtn = top.createEl("button");
    minimizeBtn.addClass("tw-widget-btn");
    (0, import_obsidian.setIcon)(minimizeBtn, "minus");
    minimizeBtn.addEventListener("click", () => this.toggle());
    const closeBtn = top.createEl("button");
    closeBtn.addClass("tw-widget-btn");
    (0, import_obsidian.setIcon)(closeBtn, "x");
    closeBtn.addEventListener("click", () => {
      this.onClose?.();
    });
    app.workspace.onLayoutReady(() => {
      app.workspace.containerEl.appendChild(this.el);
    });
  }
  toggle() {
    if (this.visible) this.hide();
    else this.show();
  }
  show() {
    this.el.removeClass("tw-widget-hide");
    this.el.removeClass("tw-hidden");
    setTimeout(() => this.el.addClass("tw-widget-show"), 1);
    this.visible = true;
  }
  hide() {
    this.el.removeClass("tw-widget-show");
    setTimeout(() => this.el.addClass("tw-widget-hide"), 1);
    setTimeout(() => this.el.addClass("tw-hidden"), 150);
    this.visible = false;
  }
  isVisible() {
    return this.visible;
  }
  destroy() {
    this.el.remove();
  }
};
var TimerWidgetPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.instances = [];
    this.lastInputValue = "5";
    this.offsetCounter = 0;
  }
  onload() {
    this.addStatusBarItem().createEl("span", {
      cls: "tw-statusbar-icon"
    }, (el) => {
      (0, import_obsidian.setIcon)(el, "clock");
      el.addEventListener("click", () => this.spawnTimer());
    });
    this.addCommand({
      id: "spawn-timer-widget",
      name: "New timer",
      callback: () => this.spawnTimer()
    });
  }
  spawnTimer() {
    const widget = new FloatingWidget(this.app, true);
    const offset = this.offsetCounter * 30;
    this.offsetCounter++;
    widget.el.style.bottom = `${40 + offset}px`;
    widget.el.style.right = `${10 + offset}px`;
    widget.el.style.top = "unset";
    widget.el.style.left = "unset";
    const timer = new Timer(widget.el, this.lastInputValue);
    const instance = { widget, timer };
    widget.onClose = () => {
      this.lastInputValue = timer.getLastInput();
      timer.destroy();
      widget.destroy();
      this.instances.remove(instance);
      if (this.offsetCounter > 0) this.offsetCounter--;
    };
    this.instances.push(instance);
  }
  onunload() {
    for (const inst of this.instances) {
      inst.timer.destroy();
      inst.widget.destroy();
    }
    this.instances = [];
  }
};

/* nosourcemap */