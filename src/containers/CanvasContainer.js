import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import GridMaker from "../components/GridMaker";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

var obj3d = new THREE.Object3D(),
  Group = new THREE.Group(),
  LoadButton = undefined,
  RefreshButton = undefined,
  selectedObjects = [],
  STL_Object = [],
  unhideButton = [],
  ObjName_List = [],
  Orbit = undefined,
  Controls = [],
  Scene = undefined,
  Camera = undefined,
  Renderer = undefined,
  Raycaster = undefined,
  Light = undefined,
  outlinePass = undefined,
  Composer = undefined,
  effectFXAA = undefined,
  mouse = undefined,
  mouse2 = undefined,
  selectedObjIndex = undefined,
  isStart = false,
  boundings = [],
  euler = [],
  dragstart_event = [],
  dragend_event = [],
  rotation_event = [],
  scale_event = [],
  activeIndex = -1;
// menu = undefined
const CanvasContainer = ({
  props,
  newObj,
  newObjList,
  changeObjList,
  objList,
  gridPlane,
  activeObj,
  setActiveObj,
  initialGui,
  outline,
  activeControl,
  positionControl,
  rotationControl,
  scaleControl,
}) => {
  const mountRef = useRef(null);

  function loadObject(e) {
    var file = e.target.files[0];
    if (file) {
      initialGui();
      var material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        wireframe: false,
        transparent: true,
        opacity: 1,
      });
      var loader = new STLLoader();
      loader.load(file.name, function (geometry) {
        STL_Object.push(new THREE.Mesh(geometry, material));
        unhideButton.push(undefined);
        var obj_index = STL_Object.length;
        ObjName_List.push(file.name);
        newObjList(file.name);
        // Prevent all the Object show at Origin
        if (obj_index - 1 !== 0) {
          newObj();
          if (obj_index % 4 === 0)
            STL_Object[obj_index - 1].position.set(
              (gridPlane.width / 4) * Math.random(),
              (gridPlane.height / 4) * Math.random(),
              0
            );
          else if (obj_index % 4 === 1)
            STL_Object[obj_index - 1].position.set(
              (gridPlane.width / 4) * Math.random(),
              (-gridPlane.height / 4) * Math.random(),
              0
            );
          else if (obj_index % 4 === 2)
            STL_Object[obj_index - 1].position.set(
              (-gridPlane.width / 4) * Math.random(),
              (-gridPlane.height / 4) * Math.random(),
              0
            );
          else if (obj_index % 4 === 3)
            STL_Object[obj_index - 1].position.set(
              (-gridPlane.width / 4) * Math.random(),
              (gridPlane.height / 4) * Math.random(),
              0
            );
          positionControl(
            obj_index,
            STL_Object[obj_index - 1].position.x,
            STL_Object[obj_index - 1].position.y
          );
        }
        Group.add(STL_Object[obj_index - 1]);

        // Calculate Boundings
        STL_Object[obj_index - 1].geometry.computeBoundingBox();
        var helper = new THREE.BoxHelper(STL_Object[obj_index - 1], 0x000000);
        helper.geometry.computeBoundingBox();
        var helper_values = helper.geometry.boundingBox;
        boundings.push([
          Math.abs(helper_values.max.x - STL_Object[obj_index - 1].position.x),
          Math.abs(STL_Object[obj_index - 1].position.x - helper_values.min.x),
          Math.abs(helper_values.max.y - STL_Object[obj_index - 1].position.y),
          Math.abs(STL_Object[obj_index - 1].position.y - helper_values.min.y),
        ]);

        Controls.push({ Drag: undefined, Rotate: undefined, Scale: undefined });
        // Make Drag Control
        Controls[obj_index - 1].Drag = new DragControls(
          [STL_Object[obj_index - 1]],
          Camera,
          Renderer.domElement
        );
        dragstart_event.push(() => {
          console.log(`drag start[${obj_index - 1}]`);
          Orbit.enabled = false;
        });
        dragend_event.push(() => {
          console.log(`drag end[${obj_index - 1}]`);
          positionControl(
            obj_index,
            STL_Object[obj_index - 1].position.x,
            STL_Object[obj_index - 1].position.y
          );
          Orbit.enabled = true;
        });
        Controls[obj_index - 1].Drag.enabled = false;

        // Make Rotation Control
        Controls[obj_index - 1].Rotate = new TransformControls(
          Camera,
          Renderer.domElement
        );
        // Controls[obj_index-1].Rotate.attach(STL_Object[obj_index-1])
        Controls[obj_index - 1].Rotate.setSize(0.5);
        Controls[obj_index - 1].Rotate.setSpace("local");
        Controls[obj_index - 1].Rotate.setMode("rotate");
        Controls[obj_index - 1].Rotate.translationSnap = 0.3;
        Controls[obj_index - 1].Rotate.traverse((obj) => {
          obj.isTransforControls = true;
        });
        rotation_event.push(() => {
          // console.log(index)
          isStart = !isStart;
          if (isStart) {
            console.log(`dragging-start[${obj_index - 1}]`);
            Orbit.enabled = false;
          } else {
            console.log(`dragging-end[${obj_index - 1}]`);
            console.log(obj_index - 1);
            euler.push(STL_Object[obj_index - 1].rotation);
            rotationControl(
              obj_index,
              STL_Object[obj_index - 1].rotation.x,
              STL_Object[obj_index - 1].rotation.y,
              STL_Object[obj_index - 1].rotation.z
            );
            Orbit.enabled = true;
          }
        });
        Controls[obj_index - 1].Rotate.enabled = false;

        // Make Scale Control
        Controls[obj_index - 1].Scale = new TransformControls(
          Camera,
          Renderer.domElement
        );
        // Controls[obj_index-1].Scale.attach(STL_Object[obj_index-1])
        Controls[obj_index - 1].Scale.setSize(0.5);
        Controls[obj_index - 1].Scale.setSpace("local");
        Controls[obj_index - 1].Scale.setMode("scale");
        Controls[obj_index - 1].Scale.translationSnap = 0.3;
        Controls[obj_index - 1].Scale.traverse((obj) => {
          obj.isTransforControls = true;
        });
        scale_event.push(() => {
          isStart = !isStart;
          if (isStart) {
            console.log(`dragging-start[${obj_index - 1}]`);
            Orbit.enabled = false;
          } else {
            console.log(`dragging-end[${obj_index - 1}]`);
            scaleControl(
              obj_index,
              STL_Object[obj_index - 1].scale.x,
              STL_Object[obj_index - 1].scale.y,
              STL_Object[obj_index - 1].scale.z
            );
            Orbit.enabled = true;
          }
        });
        Controls[obj_index - 1].Scale.enabled = false;
      });
    } else {
      console.log("Only 4 Object Can be Exist");
    }
  }
  function refreshCamera() {
    Camera.position.set(0, -750, 600);
    Orbit.reset();
  }
  function unhideObject(index) {
    changeObjList("isHide", index, false);
    Group.add(STL_Object[index - 1]);
  }
  function addSelectedObject(object) {
    selectedObjects = [];
    selectedObjects.push(object);
  }
  const onClickFace = (event) => {
    event.preventDefault();
    // event.stopImmediatePropagation()
    if (event.target.className !== "menu-option") toggleMenu("off");
    // console.log("Click")
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    Raycaster.setFromCamera(mouse, Camera);
    var targetIntersect = [];
    var existTarget = false;
    for (let i = 0; i < STL_Object.length; i++) {
      if (STL_Object[i] !== undefined)
        targetIntersect.push(Raycaster.intersectObject(STL_Object[i], false));
      else targetIntersect.push({ length: 0 });
      if (targetIntersect[i].length > 0) {
        let selectedObject = targetIntersect[i][0].object;
        addSelectedObject(selectedObject);
        outlinePass.selectedObjects = selectedObjects;
        activeIndex = i;
        setActiveObj(i);
        existTarget = true;
      }
    }

    if (!existTarget) {
      outlinePass.selectedObjects = [];
      activeIndex = -1;
      setActiveObj(-1);
    }

    Renderer.render(Scene, Camera);
  };

  const toggleMenu = (command) => {
    var menu = document.querySelector(".menu");
    menu.style.display = command === "show" ? "block" : "none";
  };
  const onContextMenu = (event) => {
    event.preventDefault();
    mouse2.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse2.y = -(event.clientY / window.innerHeight) * 2 + 1;

    Raycaster.setFromCamera(mouse2, Camera);
    var targetIntersect = [];
    var existTarget = false;
    for (let i = 0; i < STL_Object.length; i++) {
      if (STL_Object[i] !== undefined)
        targetIntersect.push(Raycaster.intersectObject(STL_Object[i], false));
      else targetIntersect.push({ length: 0 });
      if (targetIntersect[i].length > 0) {
        selectedObjIndex = i;
        existTarget = true;
        var menu = document.querySelector(".menu");
        const setPosition = ({ top, left }) => {
          menu.style.left = `${left}px`;
          menu.style.top = `${top}px`;
          toggleMenu("show");
        };
        const origin = {
          left: event.clientX,
          top: event.clientY,
        };
        setPosition(origin);
      }
    }

    if (!existTarget) {
      selectedObjIndex = undefined;
    }
  };
  const onHide = () => {
    STL_Object[selectedObjIndex].visible = false;

    unhideButton[selectedObjIndex] = document.getElementById(
      `unhideButton_${selectedObjIndex + 1}`
    );
    unhideButton[selectedObjIndex].style.display = "block";
    unhideButton[selectedObjIndex].onclick = function () {
      console.log(selectedObjIndex);
      changeObjList("isHide", selectedObjIndex + 1, false);
      STL_Object[selectedObjIndex].visible = true;
      unhideButton[selectedObjIndex].style.display = "none";
      unhideButton[selectedObjIndex] = undefined;
    };

    toggleMenu("off");
  };
  const onDuplicate = () => {
    initialGui();
    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: false,
      transparent: true,
      opacity: 1,
    });
    STL_Object.push(
      new THREE.Mesh(STL_Object[selectedObjIndex].geometry, material)
    );
    unhideButton.push(undefined);
    ObjName_List.push(ObjName_List[selectedObjIndex] + " copy");
    newObjList(ObjName_List[selectedObjIndex] + " copy");
    var obj_index = STL_Object.length;
    console.log(obj_index);
    newObj();
    STL_Object[obj_index - 1].position.set(
      (gridPlane.width / 4) * Math.random(),
      (gridPlane.height / 4) * Math.random(),
      0
    );
    positionControl(
      obj_index,
      STL_Object[obj_index - 1].position.x,
      STL_Object[obj_index - 1].position.y
    );
    Group.add(STL_Object[obj_index - 1]);

    // Calculate Boundings
    STL_Object[obj_index - 1].geometry.computeBoundingBox();
    var helper = new THREE.BoxHelper(STL_Object[obj_index - 1], 0x000000);
    helper.geometry.computeBoundingBox();
    var helper_values = helper.geometry.boundingBox;
    boundings.push([
      Math.abs(helper_values.max.x - STL_Object[obj_index - 1].position.x),
      Math.abs(STL_Object[obj_index - 1].position.x - helper_values.min.x),
      Math.abs(helper_values.max.y - STL_Object[obj_index - 1].position.y),
      Math.abs(STL_Object[obj_index - 1].position.y - helper_values.min.y),
    ]);
    Controls.push({ Drag: undefined, Rotate: undefined, Scale: undefined });
    // Make Drag Control
    Controls[obj_index - 1].Drag = new DragControls(
      [STL_Object[obj_index - 1]],
      Camera,
      Renderer.domElement
    );
    dragstart_event.push(() => {
      console.log(`drag start[${obj_index - 1}]`);
      Orbit.enabled = false;
    });
    dragend_event.push(() => {
      console.log(`drag end[${obj_index - 1}]`);
      positionControl(
        obj_index,
        STL_Object[obj_index - 1].position.x,
        STL_Object[obj_index - 1].position.y
      );
      Orbit.enabled = true;
    });
    Controls[obj_index - 1].Drag.enabled = false;

    // Make Rotation Control
    Controls[obj_index - 1].Rotate = new TransformControls(
      Camera,
      Renderer.domElement
    );
    Controls[obj_index - 1].Rotate.attach(STL_Object[obj_index - 1]);
    Controls[obj_index - 1].Rotate.setSize(0.5);
    Controls[obj_index - 1].Rotate.setSpace("local");
    Controls[obj_index - 1].Rotate.setMode("rotate");
    Controls[obj_index - 1].Rotate.translationSnap = 0.3;
    Controls[obj_index - 1].Rotate.traverse((obj) => {
      obj.isTransforControls = true;
    });
    rotation_event.push(() => {
      console.log("enter this");
      isStart = !isStart;
      if (isStart) {
        console.log(`dragging-start[${obj_index - 1}]`);
        Orbit.enabled = false;
      } else {
        console.log(`dragging-end[${obj_index - 1}]`);
        euler.push(STL_Object[obj_index - 1].rotation);
        rotationControl(
          obj_index,
          STL_Object[obj_index - 1].rotation.x,
          STL_Object[obj_index - 1].rotation.y,
          STL_Object[obj_index - 1].rotation.z
        );
        Orbit.enabled = true;
      }
    });
    Controls[obj_index - 1].Rotate.enabled = false;

    // Make Scale Control
    Controls[obj_index - 1].Scale = new TransformControls(
      Camera,
      Renderer.domElement
    );
    Controls[obj_index - 1].Scale.attach(STL_Object[obj_index - 1]);
    Controls[obj_index - 1].Scale.setSize(0.5);
    Controls[obj_index - 1].Scale.setSpace("local");
    Controls[obj_index - 1].Scale.setMode("scale");
    Controls[obj_index - 1].Scale.translationSnap = 0.3;
    Controls[obj_index - 1].Scale.traverse((obj) => {
      obj.isTransforControls = true;
    });
    scale_event.push(() => {
      isStart = !isStart;
      if (isStart) {
        console.log(`dragging-start[${obj_index - 1}]`);
        Orbit.enabled = false;
      } else {
        console.log(`dragging-end[${obj_index - 1}]`);
        scaleControl(
          obj_index,
          STL_Object[obj_index - 1].scale.x,
          STL_Object[obj_index - 1].scale.y,
          STL_Object[obj_index - 1].scale.z
        );
        Orbit.enabled = true;
      }
    });
    Controls[obj_index - 1].Scale.enabled = false;
    toggleMenu("off");
  };
  const onDelete = () => {
    Group.remove(STL_Object[selectedObjIndex]);
    STL_Object[selectedObjIndex] = undefined;
    changeObjList("name", selectedObjIndex, undefined);
    dragstart_event[selectedObjIndex] = undefined;
    dragend_event[selectedObjIndex] = undefined;
    Controls[selectedObjIndex].Drag.enabled = false;
    Controls[selectedObjIndex].Drag.removeEventListener(
      "dragstart",
      dragstart_event[selectedObjIndex],
      false
    );
    Controls[selectedObjIndex].Drag.removeEventListener(
      "dragend",
      dragend_event[selectedObjIndex],
      false
    );
    Controls[selectedObjIndex].Drag = undefined;

    Controls[selectedObjIndex].Rotate.enabled = false;
    Controls[selectedObjIndex].Rotate.removeEventListener(
      "dragging-changed",
      rotation_event[selectedObjIndex],
      false
    );
    rotation_event[selectedObjIndex] = undefined;
    Group.remove(Controls[selectedObjIndex].Rotate);
    Controls[selectedObjIndex].Rotate = undefined;

    Controls[selectedObjIndex].Scale.enabled = false;
    Controls[selectedObjIndex].Scale.removeEventListener(
      "dragging-changed",
      scale_event[selectedObjIndex],
      false
    );
    scale_event[selectedObjIndex] = undefined;
    Group.remove(Controls[selectedObjIndex].Scale);
    Controls[selectedObjIndex].Scale = undefined;

    Controls[selectedObjIndex] = undefined;
    console.log(STL_Object.length);
    console.log(STL_Object);
    toggleMenu("off");
  };
  useEffect(() => {
    LoadButton = document.getElementById("loadButton_wrapper");
    LoadButton.onchange = loadObject;
    RefreshButton = document.getElementById("view_refresh");
    RefreshButton.onclick = refreshCamera;

    Raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse2 = new THREE.Vector2();

    const width = window.innerWidth;
    const height = window.innerHeight;

    Renderer = new THREE.WebGLRenderer();
    Renderer.shadowMap.enabled = true;
    Renderer.setSize(window.innerWidth, window.innerHeight);
    Renderer.setClearColor(0x222222, 1);
    Renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(Renderer.domElement);

    const stats = Stats();
    mountRef.current.appendChild(stats.dom);
    Scene = new THREE.Scene();
    Camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10000);
    Camera.position.set(0, -750, 600);
    // Camera.position.set(0, 0, 8)
    Orbit = new OrbitControls(Camera, Renderer.domElement);
    Orbit.saveState();

    Scene.add(new THREE.AmbientLight(0xaaaaaa, 0.5));
    // Light Destination
    Light = new THREE.DirectionalLight(0xddffdd, 0.6);
    Light.position.set(1000, -1000, 1000);
    Light.castShadow = true;
    Light.shadow.mapSize.width = 8192;
    Light.shadow.mapSize.height = 8192;
    const d = 200;
    Light.shadow.camera.left = -d;
    Light.shadow.camera.right = d;
    Light.shadow.camera.top = d;
    Light.shadow.camera.bottom = -d;
    Light.shadow.camera.far = 500;
    Scene.add(Light);

    // model
    const manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
      console.log(item, loaded, total);
    };

    Scene.add(Group);
    Group.add(obj3d);

    // postprocessing

    Composer = new EffectComposer(Renderer);

    const renderPass = new RenderPass(Scene, Camera);
    Composer.addPass(renderPass);

    outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      Scene,
      Camera
    );
    Composer.addPass(outlinePass);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("tri_pattern.jpg", function (texture) {
      outlinePass.patternTexture = texture;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });

    effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );
    Composer.addPass(effectFXAA);

    window.addEventListener("resize", onWindowResize);
    Renderer.domElement.addEventListener("pointerdown", onClickFace, false);
    Renderer.domElement.addEventListener("contextmenu", onContextMenu, false);

    function addSelectedObject(object) {
      selectedObjects = [];
      selectedObjects.push(object);
    }

    function onWindowResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      Camera.aspect = width / height;
      Camera.updateProjectionMatrix();
      Renderer.setSize(width, height);
      Composer.setSize(width, height);
      effectFXAA.uniforms["resolution"].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
      );
    }

    function animate() {
      if (activeIndex !== -1 && STL_Object[activeIndex] !== undefined) {
        STL_Object[activeIndex].position.z = 0;

        if (
          STL_Object[activeIndex].position.x >=
          gridPlane.width / 2 - boundings[activeIndex][0]
        ) {
          STL_Object[activeIndex].position.x =
            gridPlane.width / 2 - boundings[activeIndex][0];
        }
        if (
          STL_Object[activeIndex].position.x <=
          -(gridPlane.width / 2) + boundings[activeIndex][1]
        ) {
          STL_Object[activeIndex].position.x =
            -(gridPlane.width / 2) + boundings[activeIndex][1];
        }
        if (
          STL_Object[activeIndex].position.y >=
          gridPlane.height / 2 - boundings[activeIndex][2]
        ) {
          STL_Object[activeIndex].position.y =
            gridPlane.height / 2 - boundings[activeIndex][2];
        }
        if (
          STL_Object[activeIndex].position.y <=
          -(gridPlane.height / 2) + boundings[activeIndex][3]
        ) {
          STL_Object[activeIndex].position.y =
            -(gridPlane.height / 2) + boundings[activeIndex][3];
        }
      }
      requestAnimationFrame(animate);
      Composer.render();
      // Renderer.render(Scene, Camera)
      stats.update();
    }
    animate();
  }, []);
  useEffect(() => {
    if (STL_Object.length > 0) {
      for (let i = 0; i < STL_Object.length; i++) {
        console.log(i);
        if (STL_Object[i]) {
          console.log(props[i].x, props[i].y);
          if (activeControl === 1)
            STL_Object[i].material.setValues({
              color: props[i].color,
              opacity: props[i].opacity,
              wireframe: props[i].wireframe,
            });
          if (activeControl === 2)
            STL_Object[i].position.set(props[i].x, props[i].y, 0);
          if (activeControl === 3)
            STL_Object[i].rotation.set(
              props[i].rotate_x,
              props[i].rotate_y,
              props[i].rotate_z
            );
          if (activeControl === 4)
            STL_Object[i].scale.set(
              props[i].scale_x,
              props[i].scale_y,
              props[i].scale_z
            );
        }
      }
    }
  }, [props]);

  useEffect(() => {
    if (activeControl === 2) {
      for (let i = 0; i < STL_Object.length; i++) {
        if (Controls[i]) {
          Controls[i].Drag.addEventListener(
            "dragstart",
            dragstart_event[i],
            false
          );
          Controls[i].Drag.addEventListener("dragend", dragend_event[i], false);
          Controls[i].Drag.enabled = true;
        }
      }
    } else if (activeControl === 3) {
      for (let i = 0; i < STL_Object.length; i++) {
        if (Controls[i]) {
          Controls[i].Rotate.attach(STL_Object[i]);
          Controls[i].Rotate.addEventListener(
            "dragging-changed",
            rotation_event[i],
            false
          );
          Group.add(Controls[i].Rotate);
          Controls[i].Rotate.enabled = true;
        }
      }
    } else if (activeControl === 4) {
      for (let i = 0; i < STL_Object.length; i++) {
        if (Controls[i]) {
          Controls[i].Scale.attach(STL_Object[i]);
          Controls[i].Scale.addEventListener(
            "dragging-changed",
            scale_event[i],
            false
          );
          Group.add(Controls[i].Scale);
          Controls[i].Scale.enabled = true;
        }
      }
    }
    return () => {
      for (let i = 0; i < STL_Object.length; i++) {
        console.log(i);
        if (activeControl === 2 && Controls[i]) {
          Controls[i].Drag.removeEventListener(
            "dragstart",
            dragstart_event[i],
            false
          );
          Controls[i].Drag.removeEventListener(
            "dragend",
            dragend_event[i],
            false
          );
          Controls[i].Drag.enabled = false;
        } else if (activeControl === 3 && Controls[i]) {
          Controls[i].Rotate.enabled = false;
          Controls[i].Rotate.removeEventListener(
            "dragging-changed",
            rotation_event[i],
            false
          );
          Group.remove(Controls[i].Rotate);
        } else if (activeControl === 4 && Controls[i]) {
          Controls[i].Scale.enabled = false;
          Controls[i].Scale.removeEventListener(
            "dragging-changed",
            scale_event[i],
            false
          );
          Group.remove(Controls[i].Scale);
        }
      }
    };
  }, [activeControl]);
  useEffect(() => {
    GridMaker(
      gridPlane.width,
      gridPlane.height,
      gridPlane.depth,
      0x000000,
      0x000000,
      Scene
    );
  }, [gridPlane]);
  useEffect(() => {
    if (outlinePass !== undefined) {
      outlinePass.edgeStrength = Number(outline.edgeStrength);
      outlinePass.edgeGlow = Number(outline.edgeGlow);
      outlinePass.edgeThickness = Number(outline.edgeThickness);
      outlinePass.pulsePeriod = Number(outline.pulsePeriod);
      outlinePass.usePatternTexture = outline.usePatternTexture;
      outlinePass.visibleEdgeColor.set(outline.visibleEdgeColor);
      outlinePass.hiddenEdgeColor.set(outline.hiddenEdgeColor);
    }
  }, [outline]);
  useEffect(() => {
    if (activeObj !== -1) {
      activeIndex = activeObj;
      addSelectedObject(STL_Object[activeIndex]);
      outlinePass.selectedObjects = selectedObjects;
    }
  }, [activeObj]);

  return (
    <div ref={mountRef} className="test">
      <div className="menu">
        <div className="menu-options">
          <div
            className="menu-option"
            onClick={() => {
              alert("Flat Down");
            }}
          >
            Flat Down
          </div>
          <div className="menu-option" onClick={onHide}>
            Hide
          </div>
          <div className="menu-option" onClick={onDuplicate}>
            Duplicate
          </div>
          <div className="menu-option" onClick={onDelete}>
            Delete
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasContainer;
