const TOTAL_DURATION = 228.614;
const EXTENSION_START = 198.591;
const EXTENSION_DURATION = 15.023;
const MEDIA_VERSION = "20261017-web-2";

const filmVideo = document.querySelector("#filmVideo");
const videoFallback = document.querySelector("#videoFallback");
const fallbackKicker = document.querySelector("#fallbackKicker");
const fallbackTitle = document.querySelector("#fallbackTitle");
const fallbackBody = document.querySelector("#fallbackBody");
const openingScreen = document.querySelector("#openingScreen");
const playerScreen = document.querySelector("#playerScreen");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const restartLink = document.querySelector("#restartLink");
const soundButton = document.querySelector("#soundButton");
const playButton = document.querySelector("#playButton");
const progressControl = document.querySelector("#progressControl");
const progressFill = document.querySelector("#progressFill");
const progressSlider = document.querySelector("#progressSlider");
const progressTooltip = document.querySelector("#progressTooltip");
const timeLabel = document.querySelector("#timeLabel");
const sceneNumber = document.querySelector("#sceneNumber");
const sceneTitle = document.querySelector("#sceneTitle");
const interactionLayer = document.querySelector("#interactionLayer");
const feedbackLayer = document.querySelector("#feedbackLayer");
const loadingMark = document.querySelector("#loadingMark");
const filmFrame = document.querySelector("#filmFrame");

const segments = {
  main01: {
    title: "启程",
    scene: "01–20",
    media: "compiled/main-01.mp4",
    start: 0,
    timelineDuration: 90.047,
    demoDuration: 4,
    fallback: ["INTERACTIVE FILM", "从长安到奈良", "一粒节气的种子，随遣唐使渡海。"],
    next: "interaction01"
  },
  main02: {
    title: "水土不服 · 杂节诞生",
    scene: "22–28",
    media: "compiled/main-02.mp4",
    start: 100.078,
    timelineDuration: 61.934,
    demoDuration: 4,
    fallback: ["CHAPTER IV", "倾听土地的声音", "历书抵达异乡，土地让节令长出新的形态。"],
    next: "main03"
  },
  main03: {
    title: "杂节诞生",
    scene: "29–31",
    media: "compiled/main-03.mp4",
    start: 162.012,
    timelineDuration: 7.467,
    demoDuration: 4,
    fallback: ["CHAPTER V", "同一种子，不同之花", "节分、彼岸与冬至，在日本生活中长出新的表达。"],
    next: "interaction03"
  },
  main04: {
    title: "节气回响",
    scene: "33–37",
    media: "compiled/main-04.mp4",
    start: 174.518,
    timelineDuration: 19.034,
    demoDuration: 4,
    fallback: ["CHAPTER VI", "纸上的霜，生活里的节气", "俳句与日常，在同一阵风里延续。"],
    next: "interaction04"
  },
  main05: {
    title: "同一片星空",
    scene: "38–40",
    media: "compiled/main-05.mp4",
    start: 213.614,
    timelineDuration: 15.000,
    demoDuration: 4,
    fallback: ["EPILOGUE", "同一片星空", "历法，在各自的土地上呼吸。"],
    next: "finish"
  }
};

const interactionConfig = {
  interaction01: {
    title: "影的长度",
    scene: "21",
    media: "compiled/interaction-01.mp4",
    start: 90.047,
    duration: 10.031,
    fallback: ["INTERACTION 01", "以影定冬至", "拖动测影尺，使日影达到最长。"]
  },
  interaction03: {
    title: "俳句的节气",
    scene: "32",
    media: "compiled/interaction-03.mp4",
    start: 169.479,
    duration: 5.039,
    fallback: ["INTERACTION 03", "一字，落入石庭", "选择最贴近此刻庭院的季节之词。"]
  },
  interaction04: {
    title: "你身边的节气",
    scene: "37",
    media: "compiled/interaction-04.mp4",
    start: 193.552,
    duration: 5.039,
    fallback: ["INTERACTION 04", "四种仍在呼吸的时令", "长按一枚节令徽章，展开它的生活片段。"]
  }
};

const seasons = {
  winter: { name: "冬至", japanese: "柚子の香りで、冬を越す。", media: "compiled/extend-04-winter.mp4", mark: "柚子暖汤" },
  setsubun: { name: "节分", japanese: "今年の恵方は——南南東。", media: "compiled/extend-04-setsubun.mp4", mark: "一把炒豆" },
  higan: { name: "彼岸", japanese: "彼岸は、日本の清明節。", media: "compiled/extend-04-higan.mp4", mark: "墓园与萩饼" },
  tea: { name: "八十八夜", japanese: "八十八夜の新茶は、一番おいしい。", media: "compiled/extend-04-tea.mp4", mark: "一番茶与夏耕" }
};

const timelineRegions = [
  { type: "segment", key: "main01", start: 0, duration: 90.047 },
  { type: "interaction", key: "interaction01", start: 90.047, duration: 10.031 },
  { type: "segment", key: "main02", start: 100.078, duration: 61.934 },
  { type: "segment", key: "main03", start: 162.012, duration: 7.467 },
  { type: "interaction", key: "interaction03", start: 169.479, duration: 5.039 },
  { type: "segment", key: "main04", start: 174.518, duration: 19.034 },
  { type: "interaction", key: "interaction04", start: 193.552, duration: 5.039 },
  { type: "extension", key: "extension04", start: 198.591, duration: 15.023 },
  { type: "segment", key: "main05", start: 213.614, duration: 15.000 }
];

const state = {
  token: 0,
  mode: "idle",
  paused: false,
  muted: false,
  isScrubbing: false,
  resumeAfterScrub: true,
  selectedSeason: "tea",
  currentStart: 0,
  currentDuration: 0,
  fallbackStartedAt: 0,
  fallbackDuration: 1,
  fallbackElapsed: 0,
  fallbackOnComplete: null,
  useVideo: false,
  timers: new Set(),
  raf: 0,
  timerFrame: 0
};

function schedule(callback, milliseconds) {
  const id = window.setTimeout(() => {
    state.timers.delete(id);
    callback();
  }, milliseconds);
  state.timers.add(id);
  return id;
}

function clearTimers() {
  for (const id of state.timers) window.clearTimeout(id);
  state.timers.clear();
}

function resetLayers() {
  interactionLayer.innerHTML = "";
  interactionLayer.classList.remove("is-active");
  feedbackLayer.innerHTML = "";
}

function formatTime(totalSeconds, roundUp = false) {
  const roundedSeconds = roundUp ? Math.ceil(totalSeconds) : Math.floor(totalSeconds);
  const safeSeconds = Math.max(0, Math.min(Math.ceil(TOTAL_DURATION), roundedSeconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setTimeline(start, duration) {
  state.currentStart = start;
  state.currentDuration = duration;
  state.fallbackStartedAt = performance.now();
  state.fallbackDuration = Math.max(duration, 1);
  state.fallbackElapsed = 0;
}

function currentTimelineTime() {
  let ratio = 0;
  if (state.useVideo && Number.isFinite(filmVideo.duration) && filmVideo.duration > 0) {
    ratio = filmVideo.currentTime / filmVideo.duration;
  } else if (state.mode === "segment" || state.mode === "extension") {
    const elapsed = state.paused
      ? state.fallbackElapsed
      : state.fallbackElapsed + (performance.now() - state.fallbackStartedAt) / 1000;
    ratio = elapsed / state.fallbackDuration;
  }
  return state.currentStart + Math.min(1, Math.max(0, ratio)) * state.currentDuration;
}

function setProgressPreview(timelineTime) {
  const safeTime = Math.max(0, Math.min(TOTAL_DURATION, timelineTime));
  const percent = safeTime / TOTAL_DURATION * 100;
  progressFill.style.width = `${percent}%`;
  progressSlider.value = String(safeTime);
  progressSlider.style.setProperty("--progress", `${percent}%`);
  progressSlider.setAttribute("aria-valuetext", formatTime(safeTime));
  progressTooltip.textContent = formatTime(safeTime);
  progressControl.style.setProperty("--tooltip-position", `${percent}%`);
  timeLabel.textContent = `${formatTime(safeTime)} / ${formatTime(TOTAL_DURATION, true)}`;
}

function updateProgress() {
  if (!state.isScrubbing) setProgressPreview(currentTimelineTime());
  state.raf = requestAnimationFrame(updateProgress);
}

function setFallback(content) {
  fallbackKicker.textContent = content[0];
  fallbackTitle.textContent = content[1];
  fallbackBody.textContent = content[2];
}

function setSceneChrome(scene, title) {
  sceneNumber.textContent = scene;
  sceneTitle.textContent = title;
}

function setVideoVisibility(showVideo) {
  state.useVideo = showVideo;
  filmVideo.classList.toggle("is-hidden", !showVideo);
  videoFallback.classList.toggle("is-hidden", showVideo);
}

function beginFrameTransition() {
  filmFrame.classList.add("is-transitioning");
}

function finishFrameTransition(token) {
  window.requestAnimationFrame(() => {
    if (token === state.token) filmFrame.classList.remove("is-transitioning");
  });
}

function stopMedia() {
  filmVideo.pause();
  filmVideo.onloadeddata = null;
  filmVideo.onloadedmetadata = null;
  filmVideo.onseeked = null;
  filmVideo.onended = null;
  filmVideo.onerror = null;
}

function finishCurrent() {
  state.token += 1;
  clearTimers();
  stopMedia();
  state.fallbackOnComplete = null;
}

function loadVideo(media, token, { onReady, onError, paused = false, ratio = 0 }) {
  beginFrameTransition();
  loadingMark.classList.remove("is-hidden");
  filmVideo.pause();
  filmVideo.removeAttribute("src");
  filmVideo.load();
  filmVideo.muted = state.muted;

  const reveal = () => {
    if (token !== state.token) return;
    loadingMark.classList.add("is-hidden");
    setVideoVisibility(true);
    finishFrameTransition(token);
    if (paused) {
      filmVideo.pause();
    }
    onReady?.();
  };

  const metadataReady = () => {
    if (token !== state.token) return;
    const safeRatio = Math.min(1, Math.max(0, ratio));
    if (safeRatio <= 0 || !Number.isFinite(filmVideo.duration)) {
      filmVideo.currentTime = 0;
      if (filmVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) reveal();
      else filmVideo.onloadeddata = reveal;
      return;
    }
    const targetTime = Math.min(
      Math.max(0, filmVideo.duration - .05),
      safeRatio * filmVideo.duration
    );
    filmVideo.onseeked = () => {
      filmVideo.onseeked = null;
      reveal();
    };
    filmVideo.currentTime = targetTime;
  };

  const failed = () => {
    if (token !== state.token) return;
    loadingMark.classList.add("is-hidden");
    setVideoVisibility(false);
    finishFrameTransition(token);
    onError?.();
  };

  filmVideo.onloadedmetadata = metadataReady;
  filmVideo.onerror = failed;
  filmVideo.src = `media/${media}?v=${MEDIA_VERSION}`;
  filmVideo.load();
}

function playSegment(key, { ratio = 0, autoplay = true } = {}) {
  const segment = segments[key];
  if (!segment) return;
  finishCurrent();
  state.token += 1;
  const token = state.token;
  state.mode = "segment";
  state.paused = !autoplay;
  syncPlayButton();
  resetLayers();
  setSceneChrome(segment.scene, segment.title);
  setFallback(segment.fallback);
  setVideoVisibility(false);
  setTimeline(segment.start, segment.timelineDuration);
  state.fallbackElapsed = ratio * state.fallbackDuration;

  const complete = () => {
    if (token !== state.token) return;
    if (segment.next === "finish") return finishExperience();
    if (segments[segment.next]) return playSegment(segment.next, { autoplay: true });
    startInteraction(segment.next);
  };

  const useFallback = () => {
    if (token !== state.token) return;
    setVideoVisibility(false);
    state.fallbackDuration = segment.timelineDuration;
    state.fallbackElapsed = ratio * state.fallbackDuration;
    state.fallbackStartedAt = performance.now();
    state.fallbackOnComplete = complete;
    state.paused = !autoplay;
    syncPlayButton();
    if (autoplay) schedule(complete, Math.max(0, state.fallbackDuration - state.fallbackElapsed) * 1000);
  };

  loadVideo(segment.media, token, {
    onReady: () => {
      state.useVideo = true;
      state.paused = !autoplay;
      filmVideo.onended = complete;
      if (autoplay) {
        filmVideo.play().then(syncPlayButton).catch(useFallback);
      } else {
        filmVideo.pause();
        syncPlayButton();
      }
    },
    onError: useFallback,
    paused: !autoplay,
    ratio
  });
}

function pauseAtInteraction(config, token) {
  setSceneChrome(config.scene, config.title);
  setFallback(config.fallback);
  setVideoVisibility(false);
  setTimeline(config.start, config.duration);

  loadVideo(config.media, token, {
    paused: true,
    onReady: () => {
      state.useVideo = false;
      filmVideo.pause();
    },
    onError: () => {
      state.useVideo = false;
    }
  });
}

function startInteraction(key) {
  const config = interactionConfig[key];
  if (!config) return;
  finishCurrent();
  state.token += 1;
  const token = state.token;
  state.mode = "interaction";
  state.paused = true;
  resetLayers();
  interactionLayer.classList.add("is-active");
  pauseAtInteraction(config, token);
  syncPlayButton();

  if (key === "interaction01") showSundial(token, config);
  if (key === "interaction03") showPoem(token, config);
  if (key === "interaction04") showSeasonPicker(token, config);
}

function panelHeading(chapter, title, japanese) {
  return `<div class="panel-heading"><p class="chapter">${chapter}</p><h3>${title}</h3><p>${japanese}</p></div>`;
}

function addCountdown(token, seconds, label) {
  const countdown = document.createElement("p");
  countdown.className = "countdown";
  interactionLayer.append(countdown);
  let remaining = seconds;
  const render = () => { countdown.textContent = `${label} ${Math.max(0, Math.ceil(remaining))} 秒`; };
  render();
  const tick = () => {
    if (token !== state.token) return;
    remaining -= .25;
    render();
    if (remaining > 0) schedule(tick, 250);
  };
  schedule(tick, 250);
}

function showSundial(token, config) {
  const panel = document.createElement("div");
  panel.className = "interaction-panel";
  panel.innerHTML = `${panelHeading("INTERACTION 01", "以影定冬至", "影が最も長い日、それが冬至。")}
    <div class="sundial-board">
      <div class="sundial-marks"></div><div class="gnomon"></div><div class="sundial-shadow"></div>
      <div class="slider-wrap"><input class="shadow-slider" type="range" min="0" max="100" value="22" aria-label="调整日影长度" /><span class="shadow-label">影长：短</span></div>
    </div>`;
  interactionLayer.append(panel);
  addCountdown(token, 10, "若未操作，将自动推算");
  const slider = panel.querySelector(".shadow-slider");
  const shadow = panel.querySelector(".sundial-shadow");
  const label = panel.querySelector(".shadow-label");
  let finished = false;

  const render = (value) => {
    const number = Number(value);
    shadow.style.setProperty("--shadow-length", (.28 + number / 88).toFixed(2));
    label.textContent = number >= 86 ? "影长：最长" : number > 54 ? "影长：渐长" : "影长：短";
  };
  const complete = () => {
    if (finished || token !== state.token) return;
    finished = true;
    slider.value = "100";
    render(100);
    showFeedback("冬至", "影最长，日至短。二十四节气由此推算。", () => playSegment("main02"), 1300);
  };
  slider.addEventListener("input", () => { render(slider.value); if (Number(slider.value) >= 86) complete(); });
  schedule(() => {
    if (finished || token !== state.token) return;
    const start = performance.now();
    const animate = (now) => {
      if (finished || token !== state.token) return;
      const ratio = Math.min(1, (now - start) / 900);
      slider.value = String(Math.round(22 + ratio * 78));
      render(slider.value);
      if (ratio < 1) requestAnimationFrame(animate); else complete();
    };
    requestAnimationFrame(animate);
  }, 10000);
}

function showPoem(token) {
  const panel = document.createElement("div");
  panel.className = "interaction-panel";
  panel.innerHTML = `${panelHeading("INTERACTION 03", "俳句的节气", "＿＿ や　石も白くなる　寺の庭")}
  <div class="poem-board"><p class="poem-line"><span class="poem-blank">＿</span> や　石も白くなる　寺の庭</p>
    <div class="poem-choices"><button class="poem-card" type="button" data-word="霜">霜</button><button class="poem-card" type="button" data-word="雪">雪</button><button class="poem-card" type="button" data-word="花">花</button><button class="poem-card" type="button" data-word="月">月</button></div></div>`;
  interactionLayer.append(panel);
  addCountdown(token, 5, "未选择将自动填入");
  const blank = panel.querySelector(".poem-blank");
  let solved = false;
  const choose = (button) => {
    if (solved || token !== state.token) return;
    if (button.dataset.word !== "霜") {
      button.classList.remove("is-wrong");
      requestAnimationFrame(() => button.classList.add("is-wrong"));
      schedule(() => button.classList.remove("is-wrong"), 380);
      return;
    }
    solved = true;
    clearTimers();
    button.classList.add("is-correct");
    blank.textContent = "霜";
    schedule(() => showFeedback("霜", "霜や　石も白くなる　寺の庭", () => playSegment("main04"), 1100), 360);
  };
  panel.querySelectorAll(".poem-card").forEach((button) => button.addEventListener("click", () => choose(button)));
  schedule(() => choose(panel.querySelector('[data-word="霜"]')), 5000);
}

function seasonIcon(season) {
  const icons = {
    winter: '<svg class="season-icon" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="26"/><path d="M24 63c16-11 34-11 52 0M38 33c9 5 16 5 24 0"/></svg>',
    setsubun: '<svg class="season-icon" viewBox="0 0 100 100" aria-hidden="true"><path d="M28 72c9-24 35-33 52-17 3 3 5 8 5 12-13 9-37 13-57 5Z"/><circle cx="37" cy="41" r="4"/><circle cx="57" cy="30" r="4"/><circle cx="72" cy="46" r="4"/></svg>',
    higan: '<svg class="season-icon" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 74V31M50 45c-25-9-27-25-27-25 20-1 29 10 27 25ZM50 45c25-9 27-25 27-25-20-1-29 10-27 25ZM50 59c-21 2-30-9-30-9 16-8 27-3 30 9ZM50 59c21 2 30-9 30-9-16-8-27-3-30 9Z"/></svg>',
    tea: '<svg class="season-icon" viewBox="0 0 100 100" aria-hidden="true"><path d="M47 76C53 56 55 37 78 21 79 45 67 58 47 59M48 76C44 57 34 43 17 37 18 58 30 69 48 70"/></svg>'
  };
  return icons[season];
}

function showSeasonPicker(token) {
  const panel = document.createElement("div");
  panel.className = "interaction-panel";
  panel.innerHTML = `${panelHeading("INTERACTION 04", "你身边的节气", "長押しして、季節の暮らしをひらく。")}
    <div class="season-panel">${Object.entries(seasons).map(([key, item]) => `<button class="season-badge" type="button" data-season="${key}">${seasonIcon(key)}<span class="hold-ring"></span><span class="badge-caption">${item.name}</span></button>`).join("")}</div>`;
  interactionLayer.append(panel);
  addCountdown(token, 5, "长按徽章，或等待自动展开");
  let opened = false;
  const open = (key) => {
    if (opened || token !== state.token) return;
    opened = true;
    openSeasonExtension(token, key);
  };

  panel.querySelectorAll(".season-badge").forEach((button) => {
    let holdTimer;
    const cancelHold = () => {
      window.clearTimeout(holdTimer);
      button.classList.remove("is-holding");
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("is-holding");
      holdTimer = window.setTimeout(() => open(button.dataset.season), 650);
    });
    button.addEventListener("pointerup", cancelHold);
    button.addEventListener("pointercancel", cancelHold);
    button.addEventListener("pointerleave", cancelHold);
    button.addEventListener("click", (event) => {
      if (event.detail === 0) open(button.dataset.season);
    });
  });

  let pulseIndex = 0;
  const badges = [...panel.querySelectorAll(".season-badge")];
  const pulse = () => {
    if (opened || token !== state.token) return;
    badges.forEach((badge, index) => badge.classList.toggle("is-pulsing", index === pulseIndex));
    pulseIndex = (pulseIndex + 1) % badges.length;
    schedule(pulse, 800);
  };
  pulse();
  schedule(() => open("tea"), 5000);
}

function openSeasonExtension(interactionToken, seasonKey) {
  if (interactionToken !== state.token) return;
  playSeasonExtension(seasonKey);
}

function playSeasonExtension(seasonKey, { ratio = 0, autoplay = true, showIntro = true } = {}) {
  const season = seasons[seasonKey];
  if (!season) return;
  finishCurrent();
  state.token += 1;
  const token = state.token;
  state.mode = "extension";
  state.paused = !autoplay;
  state.selectedSeason = seasonKey;
  clearTimers();
  resetLayers();
  setSceneChrome("37", `${season.name} · 节令延展`);
  setFallback(["SEASONAL STORY", season.name, season.mark]);
  setVideoVisibility(false);
  if (showIntro) showFeedback(season.name, season.japanese, null, null, season.mark);
  setTimeline(EXTENSION_START, EXTENSION_DURATION);
  const finish = () => { if (token === state.token) playSegment("main05", { autoplay: true }); };
  const fallback = () => {
    if (token !== state.token) return;
    setVideoVisibility(false);
    state.mode = "extension";
    state.paused = !autoplay;
    state.fallbackDuration = 2.5;
    state.fallbackElapsed = ratio * state.fallbackDuration;
    state.fallbackStartedAt = performance.now();
    state.fallbackOnComplete = finish;
    syncPlayButton();
    if (autoplay) schedule(finish, Math.max(0, state.fallbackDuration - state.fallbackElapsed) * 1000);
  };
  if (showIntro) schedule(() => {
    if (token === state.token) feedbackLayer.innerHTML = "";
  }, 1200);
  loadVideo(season.media, token, {
    onReady: () => {
      state.useVideo = true;
      state.paused = !autoplay;
      filmVideo.onended = finish;
      if (autoplay) {
        filmVideo.play().then(syncPlayButton).catch(fallback);
      } else {
        filmVideo.pause();
        syncPlayButton();
      }
    },
    onError: fallback,
    paused: !autoplay,
    ratio
  });
}

function showFeedback(mark, title, onContinue, autoMilliseconds = null, description = "") {
  feedbackLayer.innerHTML = `<article class="feedback-card"><p class="feedback-mark">${mark}</p><h3>${title}</h3>${description ? `<p>${description}</p>` : ""}${onContinue ? '<button type="button" class="continue-button">继续</button>' : ""}</article>`;
  const button = feedbackLayer.querySelector(".continue-button");
  if (button && onContinue) button.addEventListener("click", onContinue);
  if (onContinue && autoMilliseconds) schedule(onContinue, autoMilliseconds);
}

function finishExperience() {
  finishCurrent();
  state.mode = "finished";
  loadingMark.classList.add("is-hidden");
  filmFrame.classList.remove("is-transitioning");
  resetLayers();
  setSceneChrome("40", "尾声");
  setFallback(["THE END", "同一种子，开出了不同的花。", "感谢观看《节气东渡》互动影像。"]);
  setVideoVisibility(false);
  setTimeline(TOTAL_DURATION, 1);
  setProgressPreview(TOTAL_DURATION);
  syncPlayButton();
  feedbackLayer.innerHTML = `<article class="feedback-card"><p class="feedback-mark">THE JOURNEY CONTINUES</p><h3>天空只有一个，<br />季节各自生长。</h3><button type="button" class="continue-button" id="endRestart">重新体验</button></article>`;
  feedbackLayer.querySelector("#endRestart").addEventListener("click", startExperience);
}

function startExperience() {
  openingScreen.classList.add("is-hidden");
  playerScreen.classList.remove("is-hidden");
  state.muted = false;
  filmVideo.muted = false;
  soundButton.textContent = "静音";
  soundButton.setAttribute("aria-pressed", "false");
  state.selectedSeason = "tea";
  state.isScrubbing = false;
  progressControl.classList.remove("is-scrubbing");
  playSegment("main01");
}

function restartExperience(event) {
  event?.preventDefault();
  startExperience();
}

function toggleSound() {
  state.muted = !state.muted;
  filmVideo.muted = state.muted;
  soundButton.textContent = state.muted ? "开启声音" : "静音";
  soundButton.setAttribute("aria-pressed", String(state.muted));
}

function syncPlayButton() {
  const canToggle = state.mode === "segment" || state.mode === "extension";
  const paused = state.useVideo ? filmVideo.paused : state.paused;
  playButton.textContent = paused || !canToggle ? "▶" : "Ⅱ";
  playButton.setAttribute("aria-label", paused ? "播放" : "暂停");
  playButton.disabled = !canToggle;
}

function togglePlayback() {
  if (state.mode !== "segment" && state.mode !== "extension") return;
  if (state.useVideo) {
    if (filmVideo.paused) {
      filmVideo.play().then(syncPlayButton).catch(() => {});
    } else {
      filmVideo.pause();
      syncPlayButton();
    }
    return;
  }
  if (state.paused) {
    state.paused = false;
    state.fallbackStartedAt = performance.now();
    if (state.fallbackOnComplete) {
      schedule(
        state.fallbackOnComplete,
        Math.max(0, state.fallbackDuration - state.fallbackElapsed) * 1000
      );
    }
  } else {
    state.fallbackElapsed = Math.min(
      state.fallbackDuration,
      state.fallbackElapsed + (performance.now() - state.fallbackStartedAt) / 1000
    );
    state.paused = true;
    clearTimers();
  }
  syncPlayButton();
}

function timelineRegionAt(timelineTime) {
  if (timelineTime >= TOTAL_DURATION) return null;
  return timelineRegions.find((region) => timelineTime < region.start + region.duration);
}

function seekToTimeline(timelineTime, autoplay) {
  const safeTime = Math.max(0, Math.min(TOTAL_DURATION, timelineTime));
  if (safeTime >= TOTAL_DURATION) {
    finishExperience();
    return;
  }
  const region = timelineRegionAt(safeTime);
  if (!region) return;
  const ratio = Math.min(1, Math.max(0, (safeTime - region.start) / region.duration));
  if (region.type === "segment") {
    playSegment(region.key, { ratio, autoplay });
    return;
  }
  if (region.type === "extension") {
    playSeasonExtension(state.selectedSeason, { ratio, autoplay, showIntro: false });
    return;
  }
  startInteraction(region.key);
  setProgressPreview(region.start);
}

function beginScrubbing() {
  if (state.isScrubbing) return;
  state.isScrubbing = true;
  const canResume = state.mode === "segment" || state.mode === "extension";
  state.resumeAfterScrub = canResume && (state.useVideo ? !filmVideo.paused : !state.paused);
  filmVideo.pause();
  if (!state.useVideo && canResume && !state.paused) {
    state.fallbackElapsed = Math.min(
      state.fallbackDuration,
      state.fallbackElapsed + (performance.now() - state.fallbackStartedAt) / 1000
    );
    state.paused = true;
  }
  clearTimers();
  state.token += 1;
  stopMedia();
  progressControl.classList.add("is-scrubbing");
  syncPlayButton();
}

function previewScrub() {
  if (!state.isScrubbing) beginScrubbing();
  setProgressPreview(Number(progressSlider.value));
}

function commitScrub() {
  if (!state.isScrubbing) return;
  const target = Number(progressSlider.value);
  const autoplay = state.resumeAfterScrub;
  state.isScrubbing = false;
  progressControl.classList.remove("is-scrubbing");
  seekToTimeline(target, autoplay);
}

startButton.addEventListener("click", startExperience);
restartButton.addEventListener("click", restartExperience);
restartLink.addEventListener("click", restartExperience);
soundButton.addEventListener("click", toggleSound);
playButton.addEventListener("click", togglePlayback);
progressSlider.addEventListener("pointerdown", beginScrubbing);
progressSlider.addEventListener("input", previewScrub);
progressSlider.addEventListener("change", commitScrub);
progressSlider.addEventListener("pointerup", commitScrub);
progressSlider.addEventListener("pointercancel", commitScrub);

window.addEventListener("keydown", (event) => {
  if (event.key === " " && !playerScreen.classList.contains("is-hidden")) {
    event.preventDefault();
    togglePlayback();
  }
  if (state.mode === "interaction" && event.key >= "1" && event.key <= "4") {
    const currentCards = interactionLayer.querySelectorAll(".poem-card, .season-badge");
    currentCards[Number(event.key) - 1]?.click();
  }
});

updateProgress();
