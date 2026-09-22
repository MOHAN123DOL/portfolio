// Liquid glass WebGL cluster (Originkit). Converted from the supplied TypeScript
// implementation to plain JSX — shaders and render logic are preserved.
import { useEffect, useRef } from "react";

const BEVEL = 0.025;
const CORE_REFRACT = 1.0;
const IOR = 1.5;
const THICKNESS = 2.0;
const IDLE_FLOAT = 0.05;
const TILT_RANGE = 0.5;
const TILT_RATE = 5;
const DRAG_GAIN = 0.01;
const SPIN_YAW = 0.5;
const SPIN_PITCH = 0.2;
const FOV = (45 * Math.PI) / 180;
const CAM_DIST = 5;
const DEG = Math.PI / 180;

function parseColor(input, fallback) {
  if (!input) return fallback;
  const s = input.trim();
  if (s[0] === "#") {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4)
      h = h.split("").map((c) => c + c).join("");
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16) / 255;
      const g = parseInt(h.slice(2, 4), 16) / 255;
      const b = parseInt(h.slice(4, 6), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
    }
    return fallback;
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const p = m[1].split(",").map((v) => parseFloat(v));
    if (p.length >= 3) return [p[0] / 255, p[1] / 255, p[2] / 255];
  }
  return fallback;
}

function numOf(v, fallback) {
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function srcOf(v) {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return typeof v.src === "string" ? v.src : undefined;
}

function rotYX(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cx = Math.cos(pitch), sx = Math.sin(pitch);
  const m = new Float32Array(9);
  m[0] = cy; m[1] = 0; m[2] = -sy;
  m[3] = sy * sx; m[4] = cx; m[5] = cy * sx;
  m[6] = sy * cx; m[7] = -sx; m[8] = cy * cx;
  return m;
}

function transpose3(m) {
  const o = new Float32Array(9);
  o[0] = m[0]; o[1] = m[3]; o[2] = m[6];
  o[3] = m[1]; o[4] = m[4]; o[5] = m[7];
  o[6] = m[2]; o[7] = m[5]; o[8] = m[8];
  return o;
}

function mul3(a, b) {
  const o = new Float32Array(9);
  for (let c = 0; c < 3; c++)
    for (let r = 0; r < 3; r++)
      o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
  return o;
}

function rotYXZ(yaw, pitch, roll) {
  const base = rotYX(yaw, pitch);
  if (roll === 0) return base;
  const c = Math.cos(roll), s = Math.sin(roll);
  const rz = new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]);
  return mul3(base, rz);
}

function buildEnvCanvas() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 1024, 512);
  const softbox = (x, y, w, h, intensity) => {
    const grd = ctx.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    grd.addColorStop(1, `rgba(50, 50, 50, ${intensity * 0.2})`);
    ctx.fillStyle = grd;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 80;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 60);
    else ctx.rect(x, y, w, h);
    ctx.fill();
  };
  softbox(50, 100, 300, 312, 1);
  softbox(674, 100, 300, 312, 1);
  softbox(350, -50, 324, 150, 0.9);
  ctx.shadowBlur = 0;
  return canvas;
}

/* ---- SDF baking (used by the "Logo" shape) ---- */
const SDF_MAX = 512;
const SDF_PAD = 24;
const SDF_SPREAD = 32;

function edt1d(f, d, v, z, n) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

function edt2d(mask, w, h) {
  const INF = 1e20;
  const grid = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) grid[i] = mask[i] ? 0 : INF;
  const n = Math.max(w, h);
  const f = new Float32Array(n), d = new Float32Array(n);
  const v = new Int32Array(n), z = new Float32Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
  return grid;
}

function bakeSDF(alpha, w, h) {
  const inside = new Uint8Array(w * h);
  const outside = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const on = alpha[i * 4 + 3] > 127 ? 1 : 0;
    inside[i] = on;
    outside[i] = on ? 0 : 1;
  }
  const dOut = edt2d(inside, w, h);
  const dIn = edt2d(outside, w, h);
  const signed = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) signed[i] = inside[i] ? Math.sqrt(dIn[i]) : -Math.sqrt(dOut[i]);
  const blurred = new Float32Array(w * h);
  const tmp = new Float32Array(w * h);
  const K = [0.06136, 0.24477, 0.38774, 0.24477, 0.06136];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -2; k <= 2; k++) s += K[k + 2] * signed[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = s;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let k = -2; k <= 2; k++) s += K[k + 2] * tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x];
      blurred[y * w + x] = s;
    }
  const out = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const norm = Math.max(0, Math.min(1, 0.5 + blurred[i] / (2 * SDF_SPREAD)));
    const b = Math.round(norm * 255);
    out[i * 4] = b; out[i * 4 + 1] = b; out[i * 4 + 2] = b; out[i * 4 + 3] = 255;
  }
  return out;
}

function fallbackAlpha(w, h) {
  const px = new Uint8ClampedArray(w * h * 4);
  const hx = w / 2 - SDF_PAD, hy = h / 2 - SDF_PAD;
  const r = Math.min(hx, hy) * 0.45;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = Math.abs(x - w / 2) - (hx - r);
      const dy = Math.abs(y - h / 2) - (hy - r);
      const qx = Math.max(dx, 0), qy = Math.max(dy, 0);
      const d = Math.hypot(qx, qy) + Math.min(Math.max(dx, dy), 0) - r;
      px[(y * w + x) * 4 + 3] = d < 0 ? 255 : 0;
    }
  return px;
}

const FULLSCREEN_VS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const PLATE_FS = `
precision highp float;
uniform sampler2D uPlate;
uniform vec2 uPlateFit;
uniform vec2 uRes;
void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * uPlateFit + 0.5;
  gl_FragColor = texture2D(uPlate, clamp(uv, 0.0, 1.0));
}
`;

const GLASS_FS = `
precision highp float;

uniform vec2 uRes;
uniform float uAspect;
uniform float uTanHalf;

uniform sampler2D uPlate;
uniform vec2 uPlateFit;
uniform float uHasPlate;
uniform sampler2D uEnv;
uniform sampler2D uSDF;

uniform mat3 uRot;
uniform mat3 uRotT;
uniform vec3 uCenter;
uniform float uScale;
uniform float uBoundR;

uniform float uShape;
uniform float uHalfDepth;
uniform float uBevel;
uniform float uTorusTube;
uniform vec2 uLogoHalf;
uniform float uSdfUnits;

uniform float uDisp;
uniform float uFrost;
uniform vec3 uTint;

const float PI = 3.14159265359;
const float CORE_REFRACT = ${CORE_REFRACT.toFixed(4)};
const float IOR = ${IOR.toFixed(4)};
const float THICKNESS = ${THICKNESS.toFixed(4)};

float sdCross(vec2 p, vec2 b) {
  p = abs(p);
  p = (p.y > p.x) ? p.yx : p.xy;
  vec2 q = p - b;
  float k = max(q.y, q.x);
  vec2 w = (k > 0.0) ? q : vec2(b.y - p.x, -k);
  return sign(k) * length(max(w, 0.0));
}

vec2 r45(vec2 p) {
  const float c = 0.7071067811865476;
  return vec2((p.x + p.y) * c, (p.y - p.x) * c);
}

float sdLogo(vec2 p) {
  vec2 uv = p / (2.0 * uLogoHalf) + 0.5;
  uv.y = 1.0 - uv.y;
  vec2 e = abs(p) - uLogoHalf;
  float dBox = length(max(e, 0.0)) + min(max(e.x, e.y), 0.0);
  float dTex = (0.5 - texture2D(uSDF, clamp(uv, 0.0, 1.0)).r) * 2.0 * uSdfUnits;
  return max(dTex, dBox);
}

float extrudeRound(float d2, float pz, float hd, float r) {
  vec2 q = vec2(d2 + r, abs(pz) - hd + r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float map(vec3 p) {
  if (uShape < 0.5) {
    return extrudeRound(sdCross(r45(p.xy), vec2(1.3, 0.35)), p.z, uHalfDepth, uBevel);
  } else if (uShape < 1.5) {
    vec2 q = vec2(length(p.xy) - 0.8, p.z);
    return length(q) - uTorusTube;
  } else if (uShape < 2.5) {
    return length(p) - 1.2;
  }
  return extrudeRound(sdLogo(p.xy), p.z, uHalfDepth, uBevel);
}

vec3 mapNormal(vec3 p) {
  const float e = 0.0015;
  vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * e) +
    k.yyx * map(p + k.yyx * e) +
    k.yxy * map(p + k.yxy * e) +
    k.xxx * map(p + k.xxx * e)
  );
}

vec4 plate(vec2 screenUv) {
  if (uHasPlate < 0.5) return vec4(0.0);
  vec2 uv = (screenUv - 0.5) * uPlateFit + 0.5;
  return texture2D(uPlate, clamp(uv, 0.0, 1.0));
}

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 screenUv = gl_FragCoord.xy / uRes;
  vec2 ndc = screenUv * 2.0 - 1.0;

  vec3 D = normalize(vec3(ndc.x * uTanHalf * uAspect, ndc.y * uTanHalf, -1.0));
  vec3 rd = normalize(uRotT * D);
  vec3 ro = (uRotT * -uCenter) / uScale;

  float bb = dot(ro, rd);
  float cc = dot(ro, ro) - uBoundR * uBoundR;
  float hh = bb * bb - cc;
  if (hh < 0.0) discard;
  hh = sqrt(hh);
  float t = max(-bb - hh, 0.0);
  float tMax = -bb + hh;

  bool hit = false;
  for (int i = 0; i < 80; i++) {
    if (t > tMax) break;
    float d = map(ro + rd * t);
    if (d < 0.0009) { hit = true; break; }
    t += d * 0.9;
  }
  if (!hit) discard;

  vec3 pObj = ro + rd * t;
  vec3 nObj = mapNormal(pObj);

  vec3 vP = uCenter + uScale * (uRot * pObj);
  vec3 normal = normalize(uRot * nObj);
  vec3 viewDir = normalize(-vP);

  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);

  float coreFactor = pow(max(dot(normal, viewDir), 0.0), 2.0);
  vec2 lensOffset = (screenUv - 0.5) * (CORE_REFRACT * 0.15) * coreFactor;

  vec3 refractView = refract(-viewDir, normal, 1.0 / IOR);
  vec2 offset = refractView.xy * (THICKNESS * 0.1) - lensOffset;

  vec3 reflectDir = reflect(-viewDir, normal);
  vec2 equirectUv = vec2(
    atan(reflectDir.z, reflectDir.x) / (2.0 * PI) + 0.5,
    asin(clamp(reflectDir.y, -1.0, 1.0)) / PI + 0.5
  );
  vec3 reflection = texture2D(uEnv, equirectUv).rgb * 2.5;

  vec3 transmission = vec3(0.0);
  float bgAlpha = 0.0;

  vec2 uvR = screenUv + offset * (1.0 + uDisp);
  vec2 uvG = screenUv + offset;
  vec2 uvB = screenUv + offset * (1.0 - uDisp);

  if (uFrost > 0.001) {
    float rnd = rand(screenUv) * 6.2831853;
    const int SAMPLES = 24;
    const float GOLDEN_ANGLE = 2.39996323;
    float radius = 0.0;
    float radiusStep = 1.0 / float(SAMPLES);
    float blurMultiplier = uFrost * 0.025;
    for (int i = 0; i < SAMPLES; i++) {
      float theta = float(i) * GOLDEN_ANGLE + rnd;
      radius += radiusStep;
      vec2 bo = vec2(cos(theta), sin(theta)) * radius * blurMultiplier;
      transmission.r += plate(uvR + bo).r;
      vec4 g = plate(uvG + bo);
      transmission.g += g.g;
      bgAlpha += g.a;
      transmission.b += plate(uvB + bo).b;
    }
    transmission /= float(SAMPLES);
    bgAlpha /= float(SAMPLES);
  } else {
    transmission.r = plate(uvR).r;
    vec4 g = plate(uvG);
    transmission.g = g.g;
    bgAlpha = g.a;
    transmission.b = plate(uvB).b;
  }

  transmission *= uTint;

  vec3 clearGlassTint = mix(uTint, reflection, 0.5);
  transmission = mix(clearGlassTint, transmission, bgAlpha);

  vec3 finalColor = mix(transmission, reflection, fresnel * 0.8);

  float baseAlpha = max(0.25, fresnel * 0.85);
  float outAlpha = mix(baseAlpha, 1.0, bgAlpha);

  gl_FragColor = vec4(finalColor, outAlpha);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("LiquidGlassCluster shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function link(gl, vs, fs) {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram();
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn("LiquidGlassCluster link:", gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

const DEFAULT_FONT = {
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontSize: 96,
  fontWeight: 700,
  fontStyle: "normal",
  letterSpacing: 0,
  lineHeight: 1.1,
};
const DEFAULT_BACKDROP = { type: "Text", image: "", video: "", text: "LIQUID\nGLASS", font: DEFAULT_FONT, textColor: "#FFFFFF" };
const DEFAULT_GLASS = { tint: "#FFFFFF", chromatic: 25, frost: 50 };
const DEFAULT_ORIENT = { angleX: 0, angleY: 0, angleZ: 0, offsetX: 0, offsetY: 0 };

export default function LiquidGlassCluster({
  className,
  style,
  background = "#000000",
  shape = "Torus",
  logo,
  depth = 32,
  size = 60,
  speed = 100,
  direction = "Clockwise",
  backdrop,
  glass,
  orient,
}) {
  const bd = { ...DEFAULT_BACKDROP, ...(backdrop ?? {}), font: { ...DEFAULT_FONT, ...(backdrop?.font ?? {}) } };
  const gl3 = { ...DEFAULT_GLASS, ...(glass ?? {}) };
  const or = { ...DEFAULT_ORIENT, ...(orient ?? {}) };

  const hostRef = useRef(null);
  const canvasRef = useRef(null);

  const live = useRef({});
  live.current = { background, shape, logo, depth, size, speed, direction, bd, gl3, or };

  const rebuildSDF = useRef(true);
  const rebuildPlate = useRef(true);

  const logoSrc = srcOf(logo);
  const plateFontKey = [bd.font.fontFamily, bd.font.fontSize, bd.font.fontWeight, bd.font.fontStyle, bd.font.letterSpacing, bd.font.lineHeight].join("|");

  useEffect(() => { rebuildSDF.current = true; }, [logoSrc]);
  useEffect(() => { rebuildPlate.current = true; }, [bd.type, bd.image, bd.video, bd.text, bd.textColor, plateFontKey, background]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const opts = { antialias: false, alpha: true, premultipliedAlpha: true };
    const gl = canvas.getContext("webgl2", opts) || canvas.getContext("webgl", opts);
    if (!gl) return;

    const plateProg = link(gl, FULLSCREEN_VS, PLATE_FS);
    const glassProg = link(gl, FULLSCREEN_VS, GLASS_FS);
    if (!plateProg || !glassProg) return;

    const uPlatePass = {
      plate: gl.getUniformLocation(plateProg, "uPlate"),
      fit: gl.getUniformLocation(plateProg, "uPlateFit"),
      res: gl.getUniformLocation(plateProg, "uRes"),
    };
    const names = ["uRes", "uAspect", "uTanHalf", "uPlate", "uPlateFit", "uHasPlate", "uEnv", "uSDF", "uRot", "uRotT", "uCenter", "uScale", "uBoundR", "uShape", "uHalfDepth", "uBevel", "uTorusTube", "uLogoHalf", "uSdfUnits", "uDisp", "uFrost", "uTint"];
    const u = {};
    names.forEach((n) => { u[n] = gl.getUniformLocation(glassProg, n); });
    const aPlatePos = gl.getAttribLocation(plateProg, "aPos");
    const aGlassPos = gl.getAttribLocation(glassProg, "aPos");

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    function makeTex(wrap) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      return t;
    }
    const plateTex = makeTex(gl.CLAMP_TO_EDGE);
    const sdfTex = makeTex(gl.CLAMP_TO_EDGE);
    // WebGL1 requires CLAMP_TO_EDGE for non-power-of-two textures, so the env map is clamped too.
    const envTex = makeTex(gl.CLAMP_TO_EDGE);

    const envCanvas = buildEnvCanvas();
    if (envCanvas) {
      gl.bindTexture(gl.TEXTURE_2D, envTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, envCanvas);
    }

    let vw = 1, vh = 1, dprCur = 1, sdfH = 1, sdfReady = false, logoAspect = 1;

    function uploadSDF(alpha, w, h, aspect) {
      const bytes = bakeSDF(alpha, w, h);
      sdfH = h;
      logoAspect = aspect;
      gl.bindTexture(gl.TEXTURE_2D, sdfTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      sdfReady = true;
    }
    function bakeFallback() { uploadSDF(fallbackAlpha(320, 320), 320, 320, 1); }

    let sdfToken = 0;
    function bakeLogo() {
      const url = srcOf(live.current.logo);
      if (!url) { bakeFallback(); return; }
      const token = ++sdfToken;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (token !== sdfToken) return;
        const scale = Math.min((SDF_MAX - SDF_PAD * 2) / Math.max(img.width, 1), (SDF_MAX - SDF_PAD * 2) / Math.max(img.height, 1), 1);
        const iw = Math.max(1, Math.round(img.width * scale));
        const ih = Math.max(1, Math.round(img.height * scale));
        const w = iw + SDF_PAD * 2, h = ih + SDF_PAD * 2;
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const c2d = c.getContext("2d");
        if (!c2d) return;
        c2d.clearRect(0, 0, w, h);
        c2d.drawImage(img, SDF_PAD, SDF_PAD, iw, ih);
        let data;
        try { data = c2d.getImageData(0, 0, w, h); } catch { bakeFallback(); return; }
        uploadSDF(data.data, w, h, w / h);
      };
      img.onerror = () => { if (token === sdfToken) bakeFallback(); };
      img.src = url;
    }

    let plateReady = false, plateAspect = 1, video = null, plateToken = 0, fontsWaited = false;

    function clearVideo() {
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
      video = null;
    }

    function bakePlateText() {
      const p = live.current;
      const w = Math.max(2, vw), h = Math.max(2, vh);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx2d = c.getContext("2d");
      if (!ctx2d) return;
      const f = p.bd.font;
      const fontPx = numOf(f.fontSize, 96) * dprCur;
      const weight = f.fontWeight ?? 700;
      const family = f.fontFamily || "Inter, system-ui, sans-serif";
      const fstyle = f.fontStyle || "normal";
      const lineH = numOf(f.lineHeight, 1.1) * fontPx;
      const tracking = numOf(f.letterSpacing, 0) * dprCur;

      ctx2d.clearRect(0, 0, w, h);
      if (p.background && p.background !== "transparent") {
        ctx2d.fillStyle = p.background;
        ctx2d.fillRect(0, 0, w, h);
      }
      ctx2d.font = `${fstyle} ${weight} ${fontPx}px ${family}`;
      ctx2d.textAlign = "center";
      ctx2d.textBaseline = "middle";
      ctx2d.fillStyle = p.bd.textColor || "#FFFFFF";
      if ("letterSpacing" in ctx2d) ctx2d.letterSpacing = `${tracking}px`;

      const lines = String(p.bd.text ?? "").split("\n");
      const top = h / 2 - ((lines.length - 1) * lineH) / 2;
      for (let i = 0; i < lines.length; i++) ctx2d.fillText(lines[i], w / 2, top + i * lineH);

      plateAspect = w / h;
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      plateReady = true;

      if (!fontsWaited && typeof document !== "undefined" && document.fonts) {
        fontsWaited = true;
        document.fonts.ready.then(() => {
          if (live.current.bd.type === "Text") rebuildPlate.current = true;
        });
      }
    }

    function loadPlate() {
      const p = live.current;
      clearVideo();
      plateReady = false;
      const token = ++plateToken;

      if (p.bd.type === "Text") { bakePlateText(); return; }

      if (p.bd.type === "Image") {
        const url = srcOf(p.bd.image);
        if (!url) return;
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (token !== plateToken) return;
          plateAspect = img.width / Math.max(img.height, 1);
          gl.bindTexture(gl.TEXTURE_2D, plateTex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          plateReady = true;
        };
        img.src = url;
        return;
      }

      if (p.bd.type === "Video") {
        const url = srcOf(p.bd.video);
        if (!url) return;
        const v = document.createElement("video");
        v.crossOrigin = "anonymous";
        v.playsInline = true;
        v.loop = true;
        v.muted = true;
        v.src = url;
        v.play().catch(() => {});
        video = v;
      }
    }

    function pumpVideo() {
      if (!video || video.readyState < 2 || !video.videoWidth) return;
      plateAspect = video.videoWidth / Math.max(video.videoHeight, 1);
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      plateReady = true;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprCur = dpr;
      const cw = canvas.clientWidth || host.clientWidth || 1;
      const ch = canvas.clientHeight || host.clientHeight || 1;
      const w = Math.max(1, Math.round(cw * dpr));
      const h = Math.max(1, Math.round(ch * dpr));
      if (w === vw && h === vh) return;
      vw = w; vh = h;
      canvas.width = w; canvas.height = h;
      if (live.current.bd.type === "Text") rebuildPlate.current = true;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let baseYaw = 0, basePitch = 0;
    let tiltX = 0, tiltY = 0, tiltTargetX = 0, tiltTargetY = 0;
    let dragging = false, lastX = 0, lastY = 0;

    function onPointerMove(e) {
      if (dragging) {
        baseYaw += (e.clientX - lastX) * DRAG_GAIN;
        basePitch += (e.clientY - lastY) * DRAG_GAIN;
        basePitch = Math.max(-1.4, Math.min(1.4, basePitch));
        lastX = e.clientX; lastY = e.clientY;
        return;
      }
      const r = canvas.getBoundingClientRect();
      tiltTargetX = (((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1) * TILT_RANGE;
      tiltTargetY = (-((e.clientY - r.top) / Math.max(r.height, 1)) * 2 + 1) * TILT_RANGE;
    }
    function onPointerDown(e) { dragging = true; lastX = e.clientX; lastY = e.clientY; }
    function onPointerUp() { dragging = false; }
    function onLeave() { if (!dragging) { tiltTargetX = 0; tiltTargetY = 0; } }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    // Pause rendering when off-screen (performance).
    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
    io.observe(host);

    let raf = 0, prev = performance.now(), elapsed = 0;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      if (!visible) return;
      elapsed += dt;
      const p = live.current;

      if (rebuildSDF.current) { rebuildSDF.current = false; bakeLogo(); }
      if (rebuildPlate.current) { rebuildPlate.current = false; loadPlate(); }
      if (video) pumpVideo();

      const isLogo = p.shape === "Logo";
      if (isLogo && !sdfReady) return;

      const k = 1 - Math.exp(-TILT_RATE * dt);
      tiltX += (tiltTargetX - tiltX) * k;
      tiltY += (tiltTargetY - tiltY) * k;

      const spin = (p.speed / 50) * (p.direction === "Counterclockwise" ? -1 : 1);
      baseYaw += spin * SPIN_YAW * dt;
      basePitch += spin * SPIN_PITCH * dt;

      const o = p.or;
      const yaw = baseYaw + tiltX + o.angleY * DEG;
      const pitch = Math.max(-1.45, Math.min(1.45, basePitch - tiltY)) + o.angleX * DEG;
      const rot = rotYXZ(yaw, pitch, o.angleZ * DEG);
      const rotT = transpose3(rot);

      const camDist = CAM_DIST;
      const halfFrame = camDist * Math.tan(FOV / 2);
      const targetHalf = Math.max(0.02, p.size / 100) * halfFrame;

      const nativeDepth = Math.max(0, p.depth / 100);
      const torusTube = Math.max(0.02, nativeDepth * 0.5);
      let refHalf, boundR, shapeId;
      let halfDepth = nativeDepth * 0.5;
      let bevel = BEVEL;
      let logoHalfX = 1, logoHalfY = 1;

      if (p.shape === "X") {
        shapeId = 0; refHalf = 1.3;
        boundR = Math.hypot(1.3, 0.35) + halfDepth + bevel;
      } else if (p.shape === "Torus") {
        shapeId = 1; refHalf = 0.8 + torusTube; boundR = 0.8 + torusTube;
      } else if (p.shape === "Sphere") {
        shapeId = 2; refHalf = 1.2; boundR = 1.2;
      } else {
        shapeId = 3; logoHalfY = 1; logoHalfX = logoAspect; refHalf = 1;
        halfDepth *= refHalf / 1.3;
        bevel *= refHalf / 1.3;
        boundR = Math.hypot(logoHalfX, logoHalfY, halfDepth) + bevel;
      }

      const scale = targetHalf / refHalf;
      const floatY = Math.sin(elapsed * 2) * IDLE_FLOAT;

      const screenAspect = vw / vh;
      const fitX = screenAspect > plateAspect ? 1 : screenAspect / plateAspect;
      const fitY = screenAspect > plateAspect ? plateAspect / screenAspect : 1;
      const hasPlate = plateReady && p.bd.type !== "None" ? 1 : 0;

      gl.viewport(0, 0, vw, vh);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);

      if (hasPlate) {
        gl.useProgram(plateProg);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, plateTex);
        gl.uniform1i(uPlatePass.plate, 0);
        gl.uniform2f(uPlatePass.fit, fitX, fitY);
        gl.uniform2f(uPlatePass.res, vw, vh);
        gl.enableVertexAttribArray(aPlatePos);
        gl.vertexAttribPointer(aPlatePos, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      gl.useProgram(glassProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.uniform1i(u.uPlate, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, envTex);
      gl.uniform1i(u.uEnv, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, sdfTex);
      gl.uniform1i(u.uSDF, 2);

      gl.uniform2f(u.uRes, vw, vh);
      gl.uniform1f(u.uAspect, screenAspect);
      gl.uniform1f(u.uTanHalf, Math.tan(FOV / 2));
      gl.uniform2f(u.uPlateFit, fitX, fitY);
      gl.uniform1f(u.uHasPlate, hasPlate);
      gl.uniformMatrix3fv(u.uRot, false, rot);
      gl.uniformMatrix3fv(u.uRotT, false, rotT);
      gl.uniform3f(u.uCenter, (o.offsetX / 100) * halfFrame * screenAspect, floatY + (o.offsetY / 100) * halfFrame, -camDist);
      gl.uniform1f(u.uScale, scale);
      gl.uniform1f(u.uBoundR, boundR);
      gl.uniform1f(u.uShape, shapeId);
      gl.uniform1f(u.uHalfDepth, halfDepth);
      gl.uniform1f(u.uBevel, bevel);
      gl.uniform1f(u.uTorusTube, torusTube);
      gl.uniform2f(u.uLogoHalf, logoHalfX, logoHalfY);
      gl.uniform1f(u.uSdfUnits, (SDF_SPREAD * (2 * logoHalfY)) / Math.max(sdfH, 1));

      const g = p.gl3;
      gl.uniform1f(u.uDisp, g.chromatic / 1000);
      gl.uniform1f(u.uFrost, g.frost / 100);
      const tint = parseColor(g.tint, [1, 1, 1]);
      gl.uniform3f(u.uTint, tint[0], tint[1], tint[2]);

      gl.enableVertexAttribArray(aGlassPos);
      gl.vertexAttribPointer(aGlassPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      sdfToken++;
      plateToken++;
      clearVideo();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background, touchAction: "pan-y", ...style }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
