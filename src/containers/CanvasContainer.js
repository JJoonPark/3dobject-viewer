import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import GridMaker from '../components/GridMaker'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

var obj3d = new THREE.Object3D(),
    Group = new THREE.Group(),
    LoadButton = undefined,
    selectedObjects = [],
    STL_Object = [],
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
    isStart= false,
    boundings = [],
    euler = [],
    dragstart_event = [],
    dragend_event = [],
    rotation_event = [],
    scale_event = [],
    activeIndex = -1
    // menu = undefined
const CanvasContainer = ({props, newObj, gridPlane, activeObj, initialGui, outline, activeControl, positionControl, rotationControl, scaleControl}) => {
  const mountRef = useRef(null);

  function loadObject(e) {
    var file = e.target.files[0]
    if(file)
    {
      initialGui()
      var material = new THREE.MeshStandardMaterial( {
        color: 0x555555,
        wireframe: false,
        transparent: true,
        opacity: 1
      });
      var loader = new STLLoader();
      loader.load(
        file.name,
        function (geometry) {
          STL_Object.push(new THREE.Mesh(geometry, material))
          Controls.push({Drag:undefined, Rotate:undefined, Scale:undefined})
          var obj_index = STL_Object.length
          if(obj_index-1!==0) {
            newObj()
            if(obj_index%4===0) STL_Object[obj_index-1].position.set(gridPlane.width/4*(Math.random()), gridPlane.height/4*(Math.random()),0)
            else if(obj_index%4===1) STL_Object[obj_index-1].position.set(gridPlane.width/4*(Math.random()), -gridPlane.height/4*(Math.random()),0)
            else if(obj_index%4===2) STL_Object[obj_index-1].position.set(-gridPlane.width/4*(Math.random()), -gridPlane.height/4*(Math.random()),0)
            else if(obj_index%4===3) STL_Object[obj_index-1].position.set(-gridPlane.width/4*(Math.random()), gridPlane.height/4*(Math.random()),0)
            positionControl(obj_index, STL_Object[obj_index-1].position.x, STL_Object[obj_index-1].position.y)
          }

          Group.add(STL_Object[obj_index-1])
          STL_Object[obj_index-1].geometry.computeBoundingBox()
          var helper = new THREE.BoxHelper(STL_Object[obj_index-1], 0x000000)
          helper.geometry.computeBoundingBox()
          var helper_values = helper.geometry.boundingBox
          boundings.push([
            Math.abs(helper_values.max.x - STL_Object[obj_index-1].position.x),
            Math.abs(STL_Object[obj_index-1].position.x - helper_values.min.x),
            Math.abs(helper_values.max.y - STL_Object[obj_index-1].position.y),
            Math.abs(STL_Object[obj_index-1].position.y - helper_values.min.y)
          ])
        }
      )
    }
    else {
      console.log("Only 4 Object Can be Exist")
    }
  }
  function addSelectedObject( object ) {
    selectedObjects = [];
    selectedObjects.push( object );
  }
  const onClickFace = (event) => {
    event.preventDefault()
    console.log(event.target.className)
    if(event.target.className!=="menu-option") toggleMenu("off")
    // console.log("Click")
    mouse.x = (event.clientX / window.innerWidth) *2 -1
    mouse.y = -(event.clientY / window.innerHeight) *2 +1
  
    Raycaster.setFromCamera(mouse, Camera)
    var targetIntersect = []
    var existTarget = false
    for( let i=0; i<STL_Object.length; i++) {
      targetIntersect.push(Raycaster.intersectObject(STL_Object[i], false))
      if(targetIntersect[i].length>0) {
        STL_Object[i].material.color.set(0x00ff00)
        let selectedObject = targetIntersect[i][0].object
        addSelectedObject( selectedObject )
        outlinePass.selectedObjects = selectedObjects
        activeIndex = i
        activeObj(i)
        existTarget = true
      }
      else {
        STL_Object[i].material.color.set(0x555555)
      }
    }

    if(!existTarget) {
      outlinePass.selectedObjects = [];
      activeIndex = -1
      activeObj(-1)
    }
    
    Renderer.render(Scene, Camera)
  }
  
  const toggleMenu = command => {
    var menu = document.querySelector(".menu")  
    menu.style.display = command === "show" ? "block" : "none"
  }
  const onContextMenu = ( event ) => {
    event.preventDefault()
    mouse2.x = (event.clientX / window.innerWidth) *2 -1
    mouse2.y = -(event.clientY / window.innerHeight) *2 +1
  
    Raycaster.setFromCamera(mouse2, Camera)
    var targetIntersect = []
    var existTarget = false
    for( let i=0; i<STL_Object.length; i++) {
      targetIntersect.push(Raycaster.intersectObject(STL_Object[i], false))
      if(targetIntersect[i].length>0) {
        selectedObjIndex = i
        existTarget = true
        var menu = document.querySelector(".menu") 
        const setPosition = ({top, left}) => {
          menu.style.left = `${left}px`
          menu.style.top = `${top}px`
          toggleMenu('show')
        }
        const origin = {
          left: event.clientX,
          top: event.clientY
        }
        setPosition(origin)
      }
    }

    if(!existTarget) { 
      selectedObjIndex = undefined
    }
  }
  const onHide = () => {
    Group.remove(STL_Object[selectedObjIndex])
    toggleMenu("off")
  }
  const onDuplicate = () => {
    initialGui()
    var material = new THREE.MeshStandardMaterial( {
      color: 0x555555,
      wireframe: false,
      transparent: true,
      opacity: 1
    });
    
    STL_Object.push(new THREE.Mesh(STL_Object[selectedObjIndex].geometry, material))
    Controls.push({Drag:undefined, Rotate:undefined, Scale:undefined})
    var obj_index = STL_Object.length
    console.log(obj_index)
    newObj()
    STL_Object[obj_index-1].position.set(gridPlane.width/4*(Math.random()), gridPlane.height/4*(Math.random()), 0)
    positionControl(obj_index, STL_Object[obj_index-1].position.x, STL_Object[obj_index-1].position.y)
    Group.add(STL_Object[obj_index-1])
    STL_Object[obj_index-1].geometry.computeBoundingBox()
    var helper = new THREE.BoxHelper(STL_Object[obj_index-1], 0x000000)
    helper.geometry.computeBoundingBox()
    var helper_values = helper.geometry.boundingBox
    boundings.push([
      Math.abs(helper_values.max.x - STL_Object[obj_index-1].position.x),
      Math.abs(STL_Object[obj_index-1].position.x - helper_values.min.x),
      Math.abs(helper_values.max.y - STL_Object[obj_index-1].position.y),
      Math.abs(STL_Object[obj_index-1].position.y - helper_values.min.y)
    ])
    toggleMenu("off")
  }
  const onDelete = () => {
    initialGui()
    Group.remove(STL_Object[selectedObjIndex])
    STL_Object.splice(selectedObjIndex, 1)
    if(Controls[selectedObjIndex].Drag) {
      Controls[selectedObjIndex].Drag.removeEventListener('dragstart', dragstart_event[selectedObjIndex], false)
      dragstart_event.splice(selectedObjIndex,1)
      Controls[selectedObjIndex].Drag.removeEventListener('dragend', dragend_event[selectedObjIndex], false)
      dragend_event.splice(selectedObjIndex,1)
      Controls[selectedObjIndex].Drag.enabled = false
      Controls[selectedObjIndex].Drag = undefined
    }
    else if(Controls[selectedObjIndex].Rotate) {
      Controls[selectedObjIndex].Rotate.enabled = false
      Controls[selectedObjIndex].Rotate.removeEventListener('dragging-changed', rotation_event[selectedObjIndex], false)
      rotation_event.splice(selectedObjIndex,1)
      Group.remove(Controls[selectedObjIndex].Rotate)
      Controls[selectedObjIndex].Rotate = undefined
    }
    else if(Controls[selectedObjIndex].Scale) {
      Controls[selectedObjIndex].Scale.enabled = false
      Controls[selectedObjIndex].Scale.removeEventListener('dragging-changed', scale_event[selectedObjIndex], false)
      scale_event.splice(selectedObjIndex,1)
      Group.remove(Controls[selectedObjIndex].Scale)
      Controls[selectedObjIndex].Scale = undefined
    }
    Controls.splice(selectedObjIndex, 1)
    console.log(STL_Object.length)
    toggleMenu("off")
  }
  useEffect(() => {
      LoadButton = document.getElementById('loadButton_wrapper')
      LoadButton.onchange = loadObject
			Raycaster = new THREE.Raycaster();
			mouse = new THREE.Vector2();
      mouse2 = new THREE.Vector2();

      const width = window.innerWidth;
      const height = window.innerHeight;

      Renderer = new THREE.WebGLRenderer();
      Renderer.shadowMap.enabled = true;
      Renderer.setSize( window.innerWidth, window.innerHeight )
      Renderer.setClearColor( 0xaaaaaa, 1 )
      Renderer.shadowMap.enabled = true
      mountRef.current.appendChild( Renderer.domElement )

      const stats = Stats()
      mountRef.current.appendChild( stats.dom )
      Scene = new THREE.Scene();
      Camera = new THREE.PerspectiveCamera( 120, width / height, 0.1, 1000 );
      Camera.position.set(0, -150, 200)
      // Camera.position.set(0, 0, 8)
      Controls.Orbit = new OrbitControls(Camera, Renderer.domElement)
      Controls.Orbit.saveState();

      Scene.add( new THREE.AmbientLight( 0xaaaaaa, 0.2 ) );
      // Light Destination
      Light = new THREE.DirectionalLight( 0xddffdd, 0.6 );
      Light.position.set( 10, -10, 10 );
      Light.castShadow = true;
      Light.shadow.mapSize.width = 1024;
      Light.shadow.mapSize.height = 1024;
      const d = 10;
      Light.shadow.camera.left = - d;
      Light.shadow.camera.right = d;
      Light.shadow.camera.top = d;
      Light.shadow.camera.bottom = - d;
      Light.shadow.camera.far = 1000;
      Scene.add( Light );

      // model
      const manager = new THREE.LoadingManager();
      manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
      };

      Scene.add( Group );
      Group.add( obj3d );
      
      // postprocessing

      Composer = new EffectComposer( Renderer );

      const renderPass = new RenderPass( Scene, Camera );
      Composer.addPass( renderPass );

      outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), Scene, Camera );
      Composer.addPass( outlinePass );

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load( 'tri_pattern.jpg', function ( texture ) {

        outlinePass.patternTexture = texture;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

      } );

      effectFXAA = new ShaderPass( FXAAShader );
      effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
      Composer.addPass( effectFXAA );

      window.addEventListener( 'resize', onWindowResize );      
      Renderer.domElement.addEventListener( 'pointerdown', onClickFace, false )
      Renderer.domElement.addEventListener( 'contextmenu', onContextMenu, false)

      function addSelectedObject( object ) {
        selectedObjects = [];
        selectedObjects.push( object );
      }

			function onWindowResize() {
				const width = window.innerWidth;
				const height = window.innerHeight;
				Camera.aspect = width / height;
				Camera.updateProjectionMatrix();
				Renderer.setSize( width, height );
				Composer.setSize( width, height );
				effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
			}

			function animate() {
        if(activeIndex!==-1) 
      {
        STL_Object[activeIndex].position.z = 0
        
        if(STL_Object[activeIndex].position.x >= (gridPlane.width/2)-boundings[activeIndex][0]) {
          STL_Object[activeIndex].position.x = (gridPlane.width/2)-boundings[activeIndex][0]
        }
        if(STL_Object[activeIndex].position.x <= -(gridPlane.width/2)+boundings[activeIndex][1]) {
          STL_Object[activeIndex].position.x = -(gridPlane.width/2)+boundings[activeIndex][1]
        }
        if(STL_Object[activeIndex].position.y >= (gridPlane.height/2)-boundings[activeIndex][2]) {
          STL_Object[activeIndex].position.y = (gridPlane.height/2)-boundings[activeIndex][2]
        }
        if(STL_Object[activeIndex].position.y <= -(gridPlane.height/2)+boundings[activeIndex][3]) {
          STL_Object[activeIndex].position.y = -(gridPlane.height/2)+boundings[activeIndex][3]
        }
      }
				requestAnimationFrame( animate );
				Composer.render();
        // Renderer.render(Scene, Camera)
        stats.update()
			}
      animate()
  }, []);
  useEffect(()=>{
    if(STL_Object.length>0) {
      for(let i=0; i<STL_Object.length; i++){
        if(activeControl===1) STL_Object[i].material.setValues({opacity:props[i].opacity, wireframe:props[i].wireframe})  
        if(activeControl===2) STL_Object[i].position.set(props[i].x, props[i].y, 0)
        if(activeControl===3) STL_Object[i].rotation.set(props[i].rotate_x, props[i].rotate_y, props[i].rotate_z)
        if(activeControl===4) STL_Object[i].scale.set(props[i].scale_x, props[i].scale_y, props[i].scale_z)
      }
    }
  }, [props])

  useEffect(()=>{
    if(activeControl===2){
      console.log(Controls)
      for(let i=0; i<STL_Object.length; i++)
      {
        Controls[i].Drag = new DragControls([STL_Object[i]], Camera, Renderer.domElement)
        dragstart_event.push(() => {
          console.log(`drag start[${i}]`)
          Controls.Orbit.enabled = false
        })
        dragend_event.push(() => {
          console.log(`drag end[${i}]`)
          positionControl(i+1, STL_Object[i].position.x, STL_Object[i].position.y)
          Controls.Orbit.enabled = true
        })
        Controls[i].Drag.addEventListener('dragstart', dragstart_event[i], false)
        Controls[i].Drag.addEventListener('dragend', dragend_event[i], false)
      
        // Scene.add(Controls[i].Drag)
      }
    }
    else if(activeControl===3){
      for( let i=0; i<STL_Object.length; i++){
        Controls[i].Rotate = new TransformControls(Camera, Renderer.domElement)
        Controls[i].Rotate.attach(STL_Object[i])
        Controls[i].Rotate.setSize(0.5)
        Controls[i].Rotate.setSpace('local')
        Controls[i].Rotate.setMode('rotate')
        Controls[i].Rotate.translationSnap = 0.3
        Controls[i].Rotate.traverse((obj) => {
          obj.isTransforControls = true
        })
        rotation_event.push(() => {
          console.log("enter this")
          isStart=!isStart
          if(isStart) {
            console.log(`dragging-start[${i}]`)
            Controls.Orbit.enabled = false
          } else {
            console.log(`dragging-end[${i}]`)
            euler.push(STL_Object[i].rotation)
            rotationControl(i+1, STL_Object[i].rotation.x, STL_Object[i].rotation.y, STL_Object[i].rotation.z)
            Controls.Orbit.enabled = true
          }
        })
        Controls[i].Rotate.addEventListener('dragging-changed', rotation_event[i], false)
        Group.add(Controls[i].Rotate)
      }
    }
    else if(activeControl===4){
      for( let i=0; i<STL_Object.length; i++)
      {
        Controls[i].Scale = new TransformControls(Camera, Renderer.domElement)
        Controls[i].Scale.attach(STL_Object[i])
        Controls[i].Scale.setSize(0.5)
        Controls[i].Scale.setSpace('local')
        Controls[i].Scale.setMode('scale')
        Controls[i].Scale.translationSnap = 0.3
        Controls[i].Scale.traverse((obj) => {
          obj.isTransforControls = true
        })
        scale_event.push(() => {
          isStart=!isStart
          if(isStart) {
            console.log(`dragging-start[${i}]`)
            Controls.Orbit.enabled = false
          }
          else {
            console.log(`dragging-end[${i}]`)
            scaleControl(i+1, STL_Object[i].scale.x, STL_Object[i].scale.y, STL_Object[i].scale.z)
            Controls.Orbit.enabled = true
          }
        })
        Controls[i].Scale.addEventListener('dragging-changed', scale_event, false)
        Group.add(Controls[i].Scale)
      }
    }
    return () => {
      for( let i=0; i<STL_Object.length; i++) 
      {
        if(Controls[i].Drag) {
          Controls[i].Drag.removeEventListener('dragstart', dragstart_event[i], false)
          Controls[i].Drag.removeEventListener('dragend', dragend_event[i], false)
          Controls[i].Drag.enabled = false
          Controls[i].Drag = undefined
        }
        else if(Controls[i].Rotate) {
          Controls[i].Rotate.enabled = false
          Controls[i].Rotate.removeEventListener('dragging-changed', rotation_event[i], false)
          Group.remove(Controls[i].Rotate)
          Controls[i].Rotate = undefined
        }
        else if(Controls[i].Scale) {
          Controls[i].Scale.enabled = false
          Controls[i].Scale.removeEventListener('dragging-changed', scale_event[i], false)
          Group.remove(Controls[i].Scale)
          Controls[i].Scale = undefined
        }
      }
    }
  }, [activeControl])
  useEffect(()=>{
    GridMaker(gridPlane.width, gridPlane.height, 200, 0x000000, 0x000000, Scene)
  }, [gridPlane])
  useEffect(()=>{
    if(outlinePass!==undefined){
      outlinePass.edgeStrength = Number(outline.edgeStrength)
      outlinePass.edgeGlow = Number(outline.edgeGlow)
      outlinePass.edgeThickness = Number(outline.edgeThickness)
      outlinePass.pulsePeriod = Number(outline.pulsePeriod)
      outlinePass.usePatternTexture = outline.usePatternTexture
      outlinePass.visibleEdgeColor.set(outline.visibleEdgeColor)
      outlinePass.hiddenEdgeColor.set(outline.hiddenEdgeColor)
    }
  }, [outline])
  return (
    <div ref={mountRef} className="test">
      <div className="menu">
        <div className="menu-options">
          <div className="menu-option" onClick={()=>{alert("Flat Down")}}>Flat Down</div>
          <div className="menu-option" onClick={onHide}>Hide</div>
          <div className="menu-option" onClick={onDuplicate}>Duplicate</div>
          <div className="menu-option" onClick={onDelete}>Delete</div>
        </div>
      </div>
    </div>
  );
}


export default CanvasContainer;
