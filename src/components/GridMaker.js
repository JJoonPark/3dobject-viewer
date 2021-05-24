import * as THREE from "three";

var old_view = undefined;

function modMatch(val, mod) {
  let mv = Math.abs(val) % mod;
  return mv < 1 || mod - mv < 1;
}

function makeLinesFromPoints(points, color, opacity) {
  if (points.length % 2 !== 0) {
    console.log("invalid line : " + points.length);
  }
  const geo = new THREE.BufferGeometry();
  const vrt = new Float32Array(points.length * 3);
  let vi = 0;
  for (let p of points) {
    vrt[vi++] = p.x;
    vrt[vi++] = p.y;
    vrt[vi++] = p.z;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(vrt, 3));
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity || 1,
      transparent: opacity !== 1,
    })
  );
}

function canvasInMesh(w, h, textAlign, textBaseline, color, size) {
  let canvas = document.createElement("canvas"),
    canvasTexture = new THREE.CanvasTexture(canvas),
    plane = new THREE.PlaneGeometry(w, h),
    context = canvas.getContext("2d"),
    scale = 8;

  canvas.width = w * scale;
  canvas.height = h * scale;

  context.scale(scale, scale);
  context.fillStyle = color || 0x000000;
  //context.fillStyle = color || fontColor;
  context.font = `${size*3/4}px sans-serif`;
  context.textAlign = textAlign;
  context.textBaseline = textBaseline;
  canvasTexture.minFilter = THREE.LinearFilter;

  // set 'transparent' to false to debug mesh bounds
  let material = new THREE.MeshBasicMaterial({
    transparent: true,
    map: canvasTexture,
  });
  let mesh = new THREE.Mesh(plane, material);

  return { context, mesh };
}

export default function GridMaker(
  width,
  height,
  depth,
  colorMajor,
  colorMinor,
  scene
) {
  const view = new THREE.Group();

  const Plane_Geometry = new THREE.BoxGeometry(width, height, 2);
  const Plane_Material = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    transparent: true,
    opacity: 0.3
  });
  const gridPlane = new THREE.Mesh(Plane_Geometry, Plane_Material);
  const unitMinor = 25;
  const unitMajor = 50;
  const fontScale = 0.5;

  let majors = [],
    minors = [],
    x = width,
    y = height,
    z = 0,
    zp = 1,
    xh = x / 2,
    yh = y / 2,
    x1 = -xh,
    x2 = xh,
    y1 = -yh,
    y2 = yh,
    xo = x1 + xh,
    yo = y1 + yh,
    w = x / 2,
    h = y / 2,
    d = z / 2,
    xlabel = "X",
    ylabel = "Y",
    rulerColor = 0x000000,
    labelSize = unitMinor * fontScale,
    xon = true,
    yon = true;

  const points = [
    {x: -width/2, y: -height/2, z: 0},
    {x: -width/2, y: -height/2, z: depth},
    {x:  width/2, y:  height/2, z: 0},
    {x:  width/2, y:  height/2, z: depth},
    {x: -width/2, y:  height/2, z: 0},
    {x: -width/2, y:  height/2, z: depth},
    {x:  width/2, y: -height/2, z: 0},
    {x:  width/2, y: -height/2, z: depth},
    {x: -width/2, y: -height/2, z: depth},
    {x: -width/2, y:  height/2, z: depth},
    {x: -width/2, y: -height/2, z: depth},
    {x:  width/2, y: -height/2, z: depth},
    {x:  width/2, y:  height/2, z: depth},
    {x:  width/2, y: -height/2, z: depth},
    {x:  width/2, y:  height/2, z: depth},
    {x: -width/2, y:  height/2, z: depth},
    {x: width/2, y: height/2, z:0},
    {x: -width/2, y: height/2, z:0},
    {x: width/2, y: height/2, z:0},
    {x: width/2, y: -height/2, z:0},
    {x: width/2, y: -height/2, z:0},
    {x: -width/2, y: -height/2, z:0},
    {x: -width/2, y: height/2, z:0},
    {x: -width/2, y: -height/2, z:0},
  ]
  view.add(makeLinesFromPoints(points, 0x08fff2, 1))
  
  if (xon) {
    let xPadding = labelSize * 4,
      canvas = canvasInMesh(
        x + xPadding,
        labelSize * 3,
        "center",
        "top",
        rulerColor,
        labelSize
      ),
      context = canvas.context,
      mesh = canvas.mesh;

    // for (let i =0; i >= x1; i -= unitMajor) {
    //   context.fillText(i.toString(), xo + i + xPadding /2, 0)
    // }
    for (let i = 0; i <= x2 * 2; i += unitMajor) {
      context.fillText(i.toString(), xo + i + xPadding / 2, 0);
    }

    context.font = labelSize * 0.8 + "px sans-serif";
    context.fillText(xlabel, (x + xPadding) / 2, labelSize * 1);
    mesh.position.set(0, -h - labelSize * 2, zp);
    //view.add(mesh);
  }

  if (yon) {
    let yPadding = labelSize,
      canvas = canvasInMesh(
        labelSize * 4,
        y + yPadding,
        "end",
        "middle",
        rulerColor,
        labelSize
      ),
      context = canvas.context,
      mesh = canvas.mesh;
    // for (let i = 0; i >= y1; i -= unitMajor) {
    //   console.log(i)
    //   context.fillText(i.toString(), labelSize * 4, y - (yo + i) + yPadding / 2)
    // }
    for (let i = 0; i <= y2 * 2; i += unitMajor) {
      context.fillText(
        i.toString(),
        labelSize * 4,
        y - (yo + i) + yPadding / 2
      );
    }

    context.font = labelSize * 1 + "px sans-serif";
    context.fillText(ylabel, labelSize * 1.25, (y + yPadding) / 2);
    mesh.position.set(-w - labelSize * 2 - 5, 0, zp);
    //view.add(mesh);
  }

  for (let x = 0; x > x1; x -= unitMinor) {
    let oh = yh;
    let arr = modMatch(x, unitMajor) ? majors : minors;
    arr.push({ x: x - xo, y: -oh, z: zp });
    arr.push({ x: x - xo, y: oh, z: zp });
  }

  for (let x = 0; x < x2; x += unitMinor) {
    let oh = yh;
    let arr = modMatch(x, unitMajor) ? majors : minors;
    arr.push({ x: x - xo, y: -oh, z: zp });
    arr.push({ x: x - xo, y: oh, z: zp });
  }
  for (let y = 0; y > y1; y -= unitMinor) {
    let ow = xh;
    let arr = modMatch(y, unitMajor) ? majors : minors;
    arr.push({ x: -ow, y: y - yo, z: zp });
    arr.push({ x: ow, y: y - yo, z: zp });
  }
  for (let y = 0; y < y2; y += unitMinor) {
    let ow = xh;
    let arr = modMatch(y, unitMajor) ? majors : minors;
    arr.push({ x: -ow, y: y - yo, z: zp });
    arr.push({ x: ow, y: y - yo, z: zp });
  }
  
  view.add(makeLinesFromPoints(majors, colorMajor || 0x08fff2, 0.5));
  view.add(makeLinesFromPoints(minors, colorMinor || 0x08fff2, 0.5));
  // view.add(gridPlane);

  scene.remove(old_view);
  old_view = view;
  scene.add(view);

  return view;
}
