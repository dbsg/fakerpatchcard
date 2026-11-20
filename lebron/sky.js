const lerp = (from, to, amount) => from + (to - from) * amount;

function coordinateHash(x, y) {
  const seed = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0;
  const value = Math.imul(seed ^ (seed >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function noise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const tx = x - ix;
  const ty = y - iy;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  return lerp(
    lerp(coordinateHash(ix, iy), coordinateHash(ix + 1, iy), sx),
    lerp(coordinateHash(ix, iy + 1), coordinateHash(ix + 1, iy + 1), sx),
    sy
  );
}

function galaxyBand(x) {
  return .805 - x * .57 + .05 * Math.sin(x * 8);
}

function paintNebula() {
  const canvas = document.createElement('canvas');
  canvas.width = 520;
  canvas.height = 300;
  const context = canvas.getContext('2d');
  const frame = context.createImageData(canvas.width, canvas.height);
  for (let row = 0; row < canvas.height; row++) {
    for (let col = 0; col < canvas.width; col++) {
      const x = col / canvas.width;
      const y = row / canvas.height;
      const offset = (row * canvas.width + col) * 4;
      const turbulent = noise(x * 32 + 13, y * 22 + 7) * .6 + noise(x * 70 + 5, y * 55 + 9) * .4;
      const shape = noise(x * 8 + 2, y * 14 + 4);
      const center = galaxyBand(x) + (shape - .5) * .105;
      const distance = y - center;
      const broad = Math.exp(-((distance / .155) ** 2));
      const ridge = Math.exp(-(((distance - .022) / .052) ** 2));
      const grain = coordinateHash(col + 71, row + 86);
      const cloud = Math.max(0, shape * .62 + turbulent * .49 - .21);
      const gap = 1 - .74 * Math.exp(-(((distance + .017) / .024) ** 2)) * turbulent;
      const density = Math.min(1, (broad * .52 + ridge * .58) * cloud * gap + grain * .023);
      const warmth = Math.exp(-(((x - .70) / .32) ** 2)) * (.78 + turbulent * .22);
      frame.data[offset] = lerp(57, 240, warmth);
      frame.data[offset + 1] = lerp(85, 146, warmth);
      frame.data[offset + 2] = lerp(150, 124, warmth);
      frame.data[offset + 3] = 255 * density;
    }
  }
  context.putImageData(frame, 0, 0);
  return canvas;
}

export function mountSky(canvas) {
  const context = canvas.getContext('2d');
  if (!context) return;
  let nebula;
  const stars = Array.from({ length: 1300 }, (_, index) => {
    const x = coordinateHash(index + 36, 9);
    let y = coordinateHash(index + 8, 4);
    if (index > 680) y = galaxyBand(x) + (y - .5) * coordinateHash(index + 46, 11) * .6;
    const lum = coordinateHash(index + 13, 6);
    const warm = coordinateHash(index + 25, 3) > .54;
    return { x, y, lum, warm };
  });

  function render() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    nebula ||= paintNebula();
    context.drawImage(nebula, 0, 0, width, height);

    const count = width < 580 ? 620 : stars.length;
    for (let index = 0; index < count; index++) {
      const { x, y, lum, warm } = stars[index];
      const px = x * width;
      const py = y * height;
      const alpha = .10 + lum ** 2 * .63;
      const near = lum > .982;
      const size = near ? 1.3 : .3 + lum ** 3 * .53;
      const color = warm ? '255, 220, 183' : '205, 222, 255';
      context.fillStyle = 'rgba(' + color + ', ' + alpha + ')';
      context.beginPath();
      context.arc(px, py, size, 0, Math.PI * 2);
      context.fill();
      if (near) {
        const glow = context.createRadialGradient(px, py, 0, px, py, 7);
        glow.addColorStop(0, 'rgba(' + color + ', .5)');
        glow.addColorStop(1, 'rgba(' + color + ', 0)');
        context.fillStyle = glow;
        context.fillRect(px - 7, py - 7, 14, 14);
        context.fillStyle = 'rgba(' + color + ', .33)';
        context.fillRect(px - 4, py - .35, 8, .7);
        context.fillRect(px - .35, py - 4, .7, 8);
      }
    }
  }

  new ResizeObserver(render).observe(canvas.parentElement);
  render();
}
