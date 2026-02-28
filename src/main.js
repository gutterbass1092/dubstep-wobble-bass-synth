import "./style.css";

const toggleBtn = document.querySelector("#toggle");
const lfoRateInput = document.querySelector("#lfoRate");
const rateValue = document.querySelector("#rateValue");

let ctx;
let nodes;

function start() {
  if (!ctx) {
    ctx = new AudioContext();
    nodes = createSynthFromContext(ctx);
  }

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  toggleBtn.textContent = "Stop";
}

function stop() {
  if (ctx && ctx.state === "running") {
    ctx.suspend();
  }
  toggleBtn.textContent = "Start";
}

function createSynthFromContext(audioCtx) {
  const osc = audioCtx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 55;

  const lowpass = audioCtx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 180;
  lowpass.Q.value = 10;

  const vca = audioCtx.createGain();
  vca.gain.value = 0.12;

  const lfo = audioCtx.createOscillator();
  lfo.type = "triangle";
  lfo.frequency.value = Number(lfoRateInput.value);

  const lfoDepth = audioCtx.createGain();
  lfoDepth.gain.value = 800;

  lfo.connect(lfoDepth);
  lfoDepth.connect(lowpass.frequency);

  osc.connect(lowpass);
  lowpass.connect(vca);
  vca.connect(audioCtx.destination);

  osc.start();
  lfo.start();

  return { osc, lowpass, vca, lfo, lfoDepth };
}

toggleBtn.addEventListener("click", () => {
  if (!ctx || ctx.state !== "running") {
    start();
  } else {
    stop();
  }
});

lfoRateInput.addEventListener("input", (event) => {
  const value = Number(event.target.value);
  rateValue.textContent = value.toFixed(1);
  if (nodes) {
    nodes.lfo.frequency.setTargetAtTime(value, ctx.currentTime, 0.02);
  }
});
