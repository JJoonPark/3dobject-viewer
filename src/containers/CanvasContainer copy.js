import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import GridMaker from '../components/GridMaker'

var LoadButton = undefined,
    obj_index = 0,
    STL_Object = [undefined, undefined, undefined, undefined],
    Controls = [{ Orbit: undefined, Drag: undefined, Rotate: undefined, Scale: undefined},
                { Orbit: undefined, Drag: undefined, Rotate: undefined, Scale: undefined},
                { Orbit: undefined, Drag: undefined, Rotate: undefined, Scale: undefined},
                { Orbit: undefined, Drag: undefined, Rotate: undefined, Scale: undefined}],
    Scene = undefined,
    Camera = undefined,
    Renderer = undefined,
    Raycaster = undefined,
    Light = undefined,
    mouse = undefined,
    isStart= false,
    boundings = [undefined, undefined, undefined, undefined],
    euler = [new THREE.Euler(0,0,0,'XYZ'), new THREE.Euler(0,0,0,'XYZ'), new THREE.Euler(0,0,0,'XYZ'), new THREE.Euler(0,0,0,'XYZ')],
    dragstart_event = [undefined, undefined, undefined, undefined],
    dragend_event = [undefined, undefined, undefined, undefined],
    rotation_event = [undefined, undefined, undefined, undefined],
    scale_event = [undefined, undefined, undefined, undefined],
    activeIndex = -1
const CanvasContainer = ({props, gridPlane, activeControl, materialControl, positionControl, rotationControl, scaleControl, allControl}) => {
  const mountRef = useRef(null);
  
  function loadObject(e) {
    var file = e.target.files[0]
    console.log(file.name)
    obj_index++
    if(obj_index<5)
    {
      // console.log(obj_index)
      var material = new THREE.MeshStandardMaterial( {
        color: 0x555555,
        wireframe: false,
        transparent: false,
        opacity: 1
      });
      var loader = new STLLoader();
      loader.load(
        file.name,
        function (geometry) {
          var mesh = new THREE.Mesh(geometry, material)
          if(obj_index===2) mesh.position.set(gridPlane.width/4, gridPlane.height/4, 0)
          else if(obj_index===3) mesh.position.set(-gridPlane.width/4, -gridPlane.height/4, 0)
          else if(obj_index===4) mesh.position.set(-gridPlane.width/4, gridPlane.height/4, 0)
          STL_Object[obj_index-1] = mesh
          // console.log(obj_index-1)
          Scene.add(STL_Object[obj_index-1])
          STL_Object[obj_index-1].geometry.computeBoundingBox()
          var helper = new THREE.BoxHelper(STL_Object[obj_index-1], 0x000000)
          helper.geometry.computeBoundingBox()
          var helper_values = helper.geometry.boundingBox
          boundings[obj_index-1] = [
            Math.abs(helper_values.max.x - STL_Object[obj_index-1].position.x),
            Math.abs(STL_Object[obj_index-1].position.x - helper_values.min.x),
            Math.abs(helper_values.max.y - STL_Object[obj_index-1].position.y),
            Math.abs(STL_Object[obj_index-1].position.y - helper_values.min.y)
          ]
          console.log(boundings)
        }
      )
    }
    else {
      console.log("Only 4 Object Can be Exist")
    }
  }
  const onClickFace = (event) => {
    event.preventDefault()
    // console.log("Click")
    mouse.x = (event.clientX / window.innerWidth) *2 -1
    mouse.y = -(event.clientY / window.innerHeight) *2 +1
  
    Raycaster.setFromCamera(mouse, Camera)
    var intersects = [0, 0, 0, 0]
    if(STL_Object[0]) intersects[0] = Raycaster.intersectObject(STL_Object[0], false)
    if(STL_Object[1]) intersects[1] = Raycaster.intersectObject(STL_Object[1], false)
    if(STL_Object[2]) intersects[2] = Raycaster.intersectObject(STL_Object[2], false)
    if(STL_Object[3]) intersects[3] = Raycaster.intersectObject(STL_Object[3], false)

    if(intersects[0].length>0)
    {
      STL_Object[0].material.color.set(0x00ff00)
      if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
      if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
      if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
      
      allControl(STL_Object[0].position.x, STL_Object[0].position.y, STL_Object[0].rotation.x, STL_Object[0].rotation.y, STL_Object[0].rotation.z, STL_Object[0].scale.x, STL_Object[0].scale.y, STL_Object[0].scale.z)
      activeIndex = 0
      Renderer.render(Scene, Camera)
    }
    else if(intersects[1].length>0)
    {      
      STL_Object[1].material.color.set(0x00ff00)
      if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
      if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
      if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)

      allControl(STL_Object[1].position.x, STL_Object[1].position.y, STL_Object[1].rotation.x, STL_Object[1].rotation.y, STL_Object[1].rotation.z, STL_Object[1].scale.x, STL_Object[1].scale.y, STL_Object[1].scale.z)
      activeIndex = 1
      Renderer.render(Scene, Camera)
    }
    else if(intersects[2].length>0)
    {
      STL_Object[2].material.color.set(0x00ff00)
      if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
      if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
      if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)

      allControl(STL_Object[2].position.x, STL_Object[2].position.y, STL_Object[2].rotation.x, STL_Object[2].rotation.y, STL_Object[2].rotation.z, STL_Object[2].scale.x, STL_Object[2].scale.y, STL_Object[2].scale.z)
      activeIndex = 2
      Renderer.render(Scene, Camera)
    }
    else if(intersects[3].length>0)
    {
      STL_Object[3].material.color.set(0x00ff00)
      if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
      if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
      if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)

      allControl(STL_Object[3].position.x, STL_Object[3].position.y, STL_Object[3].rotation.x, STL_Object[3].rotation.y, STL_Object[3].rotation.z, STL_Object[3].scale.x, STL_Object[3].scale.y, STL_Object[3].scale.z)
      activeIndex = 3
      Renderer.render(Scene, Camera)
    }
    else{
      if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
      if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
      if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
      if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
      activeIndex = -1
    }
    Renderer.render(Scene, Camera)
  }
  useEffect(() => {
    LoadButton = document.getElementById('loadButton_wrapper')
    LoadButton.onchange = loadObject
    Scene = new THREE.Scene()
    Camera = new THREE.PerspectiveCamera( 120, window.innerWidth/window.innerHeight, 0.1, 1000 )
    Renderer = new THREE.WebGLRenderer()
    Light = new THREE.DirectionalLight()
    // console.log(Scene, Camera, Renderer)
    Renderer.setSize( window.innerWidth, window.innerHeight )
    Renderer.setClearColor( 0xffffff, 1 )
    mountRef.current.appendChild( Renderer.domElement )
    const stats = Stats()
    mountRef.current.appendChild( stats.dom )
    Raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()
    // Initialize Camera Position
    Camera.position.set(0, -150, 200)
    console.log(Camera)
    // Initialize Light Position
    Light.position.set(10, -10, 10)
    Scene.add(Light)
    Controls.Orbit = new OrbitControls(Camera, Renderer.domElement)
    Controls.Orbit.saveState();

    // var geometry = new THREE.BoxGeometry( 100, 100, 100 );
    // var material = new THREE.MeshStandardMaterial( {
    //     color: 0x00ff00,
    //     roughness: 0.3,
    //     matalness: 0.3,
    //     wireframe: false,
    //     transparent: true,
    //     opacity: 1
    //   } );
    // STL_Object[0] = new THREE.Mesh( geometry, material );

    // console.log(STL_Object[0].scale)
    
    // Scene.add( STL_Object[0] );
    
    window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
      Camera.aspect = window.innerWidth / window.innerHeight
      Camera.updateProjectionMatrix()
      Renderer.setSize(window.innerWidth, window.innerHeight)
      Renderer.render(Scene, Camera)
    }
    Renderer.domElement.addEventListener('pointerdown', onClickFace)
    
    var animate = function () {
      // console.log(activeIndex)
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
      Renderer.render( Scene, Camera );
      stats.update()
    };
    
    animate();
    // return () => mountRef.current.removeChild( Renderer.domElement );
  }, []);
  useEffect(()=>{
    if(activeIndex!==-1)
    {
      if(props.useMat) {
        STL_Object[activeIndex].material.setValues({color:props.color, opacity:props.opacity, wireframe:props.wireframe})
        materialControl()
      }
      if(props.usePos) STL_Object[activeIndex].position.set(props.x, props.y, 0)
      if(props.useRot) STL_Object[activeIndex].rotation.set(props.rotate_x, props.rotate_y, props.rotate_z)
      if(props.useSca) STL_Object[activeIndex].scale.set(props.scale_x, props.scale_y, props.scale_z)
    }
  }, [props])

  useEffect(()=>{
    
    console.log(activeControl)
    console.log(Controls)
    if(activeControl===2){
      if(STL_Object[0])
      {
        Controls[0].Drag = new DragControls([STL_Object[0]], Camera, Renderer.domElement)
        dragstart_event[0] = () => {
          console.log('drag start[0]')
          Controls.Orbit.enabled = false
        }
        dragend_event[0] = () => {
          console.log('drag end[0]')
          positionControl(STL_Object[0].position.x, STL_Object[0].position.y)
          Controls.Orbit.enabled = true
        }
        Controls[0].Drag.addEventListener('dragstart', dragstart_event[0], false)
        Controls[0].Drag.addEventListener('dragend', dragend_event[0], false)
      
        Scene.add(Controls[0].Drag)
        
      }
      if(STL_Object[1])
      {
        Controls[1].Drag = new DragControls([STL_Object[1]], Camera, Renderer.domElement)
        dragstart_event[1] = () => {
          console.log('drag start[1]')
          Controls.Orbit.enabled = false
        }
        dragend_event[1] = () => {
          console.log('drag end[1]')
          positionControl(STL_Object[1].position.x, STL_Object[1].position.y)
          Controls.Orbit.enabled = true
        }
        Controls[1].Drag.addEventListener('dragstart', dragstart_event[1], false)
        Controls[1].Drag.addEventListener('dragend', dragend_event[1], false)
      
        Scene.add(Controls[1].Drag)
      }
      if(STL_Object[2])
      {
        Controls[2].Drag = new DragControls([STL_Object[2]], Camera, Renderer.domElement)
        dragstart_event[2] = () => {
          console.log('drag start[2]')
          Controls.Orbit.enabled = false
        }
        dragend_event[2] = () => {
          console.log('drag end[2]')
          positionControl(STL_Object[2].position.x, STL_Object[2].position.y)
          Controls.Orbit.enabled = true
        }
        Controls[2].Drag.addEventListener('dragstart', dragstart_event[2], false)
        Controls[2].Drag.addEventListener('dragend', dragend_event[2], false)
      
        Scene.add(Controls[2].Drag)
      }
      if(STL_Object[3])
      {
        Controls[3].Drag = new DragControls([STL_Object[3]], Camera, Renderer.domElement)
        dragstart_event[3] = () => {
          console.log('drag start[3]')
          Controls.Orbit.enabled = false
        }
        dragend_event[3] = () => {
          console.log('drag end[3]')
          positionControl(STL_Object[3].position.x, STL_Object[3].position.y)
          Controls.Orbit.enabled = true
        }
        Controls[3].Drag.addEventListener('dragstart', dragstart_event[3], false)
        Controls[3].Drag.addEventListener('dragend', dragend_event[3], false)
      
        Scene.add(Controls[3].Drag)
      }
      // onClickFace = (event) => {
      //   event.preventDefault()
      //   console.log("Click")
      //   // mouseEventHandler(event)
      // }
      // Renderer.domElement.addEventListener('pointerdown', onClickFace)
      console.log(Renderer)
    }
    else if(activeControl===3){
      if(STL_Object[0]) {
        console.log("enter?")
        Controls[0].Rotate = new TransformControls(Camera, Renderer.domElement)
        Controls[0].Rotate.attach(STL_Object[0])
        Controls[0].Rotate.setSize(0.5)
        Controls[0].Rotate.setSpace('local')
        Controls[0].Rotate.setMode('rotate')
        Controls[0].Rotate.translationSnap = 0.3
        Controls[0].Rotate.position.set(STL_Object[0].position.x, STL_Object[0].position.y, 0)
        
        rotation_event[0] = () => {
          console.log("enter this")
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start[0]")
            Controls.Orbit.enabled = false
            STL_Object[0].material.color.set(0x00ff00)
            if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
            if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
            if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
          } else {
            console.log("dragging-end[0]")
            euler[0] = STL_Object[0].rotation
            rotationControl(STL_Object[0].rotation.x, STL_Object[0].rotation.y, STL_Object[0].rotation.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[0].Rotate.addEventListener('dragging-changed', rotation_event[0], false)
        Scene.add(Controls[0].Rotate)
      }
      if(STL_Object[1]) {
        Controls[1].Rotate = new TransformControls(Camera, Renderer.domElement)
        Controls[1].Rotate.attach(STL_Object[1])
        Controls[1].Rotate.setSize(0.5)
        Controls[1].Rotate.setSpace('local')
        Controls[1].Rotate.setMode('rotate')
        Controls[1].Rotate.translationSnap = 0.3
        // Controls[1].Rotate.position.set(STL_Object[1].position.x, STL_Object[1].position.y, 0)
        rotation_event[1] = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start[1]")
            Controls.Orbit.enabled = false
            STL_Object[1].material.color.set(0x00ff00)
            if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
            if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
            if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
          } else {
            console.log("dragging-end[1]")
            euler[1] = STL_Object[1].rotation
            rotationControl(STL_Object[1].rotation.x, STL_Object[1].rotation.y, STL_Object[1].rotation.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[1].Rotate.addEventListener('dragging-changed', rotation_event[1], false)
        Scene.add(Controls[1].Rotate)
      }
      if(STL_Object[2]) {
        Controls[2].Rotate = new TransformControls(Camera, Renderer.domElement)
        Controls[2].Rotate.attach(STL_Object[2])
        Controls[2].Rotate.setSize(0.5)
        Controls[2].Rotate.setSpace('local')
        Controls[2].Rotate.setMode('rotate')
        Controls[2].Rotate.translationSnap = 0.3
        // Controls[2].Rotate.position.set(STL_Object[2].position.x, STL_Object[2].position.y, 0)
        rotation_event[2] = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start[2]")
            Controls.Orbit.enabled = false
            STL_Object[2].material.color.set(0x00ff00)
            if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
            if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
            if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
          } else {
            console.log("dragging-end[2]")
            euler[2] = STL_Object[2].rotation
            rotationControl(STL_Object[2].rotation.x, STL_Object[2].rotation.y, STL_Object[2].rotation.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[2].Rotate.addEventListener('dragging-changed', rotation_event[2], false)
        Scene.add(Controls[2].Rotate)
      }
      if(STL_Object[3]) {
        Controls[3].Rotate = new TransformControls(Camera, Renderer.domElement)
        Controls[3].Rotate.attach(STL_Object[3])
        Controls[3].Rotate.setSize(0.5)
        Controls[3].Rotate.setSpace('local')
        Controls[3].Rotate.setMode('rotate')
        Controls[3].Rotate.translationSnap = 0.3
        // Controls[3].Rotate.position.set(STL_Object[3].position.x, STL_Object[3].position.y, 0)
        rotation_event[3] = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start[3]")
            Controls.Orbit.enabled = false
            STL_Object[3].material.color.set(0x00ff00)
            if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
            if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
            if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
          } else {
            console.log("dragging-end[3]")
            euler[3] = STL_Object[3].rotation
            rotationControl(STL_Object[3].rotation.x, STL_Object[3].rotation.y, STL_Object[3].rotation.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[3].Rotate.addEventListener('dragging-changed', rotation_event[3], false)
        Scene.add(Controls[3].Rotate)
      }
    }
    else if(activeControl===4){
      if(STL_Object[0]) {
        Controls[0].Scale = new TransformControls(Camera, Renderer.domElement)
        Controls[0].Scale.attach(STL_Object[0])
        Controls[0].Scale.setSize(0.5)
        Controls[0].Scale.setSpace('local')
        Controls[0].Scale.setMode('scale')
        Controls[0].Scale.translationSnap = 0.3
        scale_event = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start")
            Controls.Orbit.enabled = false
            STL_Object[0].material.color.set(0x00ff00)
            if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
            if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
            if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
          }
          else {
            console.log("dragging-end")
            console.log(STL_Object[0].scale.z)
            scaleControl(STL_Object[0].scale.x, STL_Object[0].scale.y, STL_Object[0].scale.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[0].Scale.addEventListener('dragging-changed', scale_event, false)
        Scene.add(Controls[0].Scale)
      }
      if(STL_Object[1]) {
        Controls[1].Scale = new TransformControls(Camera, Renderer.domElement)
        Controls[1].Scale.attach(STL_Object[1])
        Controls[1].Scale.setSize(0.5)
        Controls[1].Scale.setSpace('local')
        Controls[1].Scale.setMode('scale')
        Controls[1].Scale.translationSnap = 0.3
        scale_event = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start")
            Controls.Orbit.enabled = false
            STL_Object[1].material.color.set(0x00ff00)
            if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
            if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
            if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
          }
          else {
            console.log("dragging-end")
            console.log(STL_Object[1].scale.z)
            scaleControl(STL_Object[1].scale.x, STL_Object[1].scale.y, STL_Object[1].scale.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[1].Scale.addEventListener('dragging-changed', scale_event, false)
        Scene.add(Controls[1].Scale)
      }
      if(STL_Object[2]) {
        Controls[2].Scale = new TransformControls(Camera, Renderer.domElement)
        Controls[2].Scale.attach(STL_Object[2])
        Controls[2].Scale.setSize(0.5)
        Controls[2].Scale.setSpace('local')
        Controls[2].Scale.setMode('scale')
        Controls[2].Scale.translationSnap = 0.3
        scale_event = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start")
            Controls.Orbit.enabled = false
            STL_Object[2].material.color.set(0x00ff00)
            if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
            if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
            if(STL_Object[3]) STL_Object[3].material.color.set(0x555555)
          }
          else {
            console.log("dragging-end")
            console.log(STL_Object[2].scale.z)
            scaleControl(STL_Object[2].scale.x, STL_Object[2].scale.y, STL_Object[2].scale.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[2].Scale.addEventListener('dragging-changed', scale_event, false)
        Scene.add(Controls[2].Scale)
      }
      if(STL_Object[3]) {
        Controls[3].Scale = new TransformControls(Camera, Renderer.domElement)
        Controls[3].Scale.attach(STL_Object[3])
        Controls[3].Scale.setSize(0.5)
        Controls[3].Scale.setSpace('local')
        Controls[3].Scale.setMode('scale')
        Controls[3].Scale.translationSnap = 0.3
        scale_event = () => {
          isStart=!isStart
          if(isStart) {
            console.log("dragging-start")
            Controls.Orbit.enabled = false
            STL_Object[3].material.color.set(0x00ff00)
            if(STL_Object[0]) STL_Object[0].material.color.set(0x555555)
            if(STL_Object[1]) STL_Object[1].material.color.set(0x555555)
            if(STL_Object[2]) STL_Object[2].material.color.set(0x555555)
          }
          else {
            console.log("dragging-end")
            console.log(STL_Object[3].scale.z)
            scaleControl(STL_Object[3].scale.x, STL_Object[3].scale.y, STL_Object[3].scale.z)
            Controls.Orbit.enabled = true
          }
        }
        Controls[3].Scale.addEventListener('dragging-changed', scale_event, false)
        Scene.add(Controls[3].Scale)
      }
    }
    return () => {
      if(Controls[0].Drag) {
        Controls[0].Drag.removeEventListener('dragstart', dragstart_event[0], false)
        Controls[0].Drag.removeEventListener('dragend', dragend_event[0], false)
        Controls[0].Drag.enabled = false
        Controls[0].Drag = undefined
      }
      else if(Controls[0].Rotate) {
        Controls[0].Rotate.enabled = false
        Controls[0].Rotate.removeEventListener('dragging-changed', rotation_event[0], false)
        Scene.remove(Controls[0].Rotate)
        Controls[0].Rotate = undefined
      }
      else if(Controls[0].Scale) {
        Controls[0].Scale.enabled = false
        Controls[0].Scale.removeEventListener('dragging-changed', scale_event[0], false)
        Scene.remove(Controls[0].Scale)
        Controls[0].Scale = undefined
      }
      if(Controls[1].Drag) {
        Controls[1].Drag.removeEventListener('dragstart', dragstart_event[0], false)
        Controls[1].Drag.removeEventListener('dragend', dragend_event[0], false)
        Controls[1].Drag.enabled = false
        Controls[1].Drag = undefined
      }
      else if(Controls[1].Rotate) {
        Controls[1].Rotate.enabled = false
        Controls[1].Rotate.removeEventListener('dragging-changed', rotation_event[1], false)
        Scene.remove(Controls[1].Rotate)
        Controls[1].Rotate = undefined
      }
      else if(Controls[1].Scale) {
        Controls[1].Scale.enabled = false
        Controls[1].Scale.removeEventListener('dragging-changed', scale_event[1], false)
        Scene.remove(Controls[1].Scale)
        Controls[1].Scale = undefined
      }
      if(Controls[2].Drag) {
        Controls[2].Drag.removeEventListener('dragstart', dragstart_event[2], false)
        Controls[2].Drag.removeEventListener('dragend', dragend_event[2], false)
        Controls[2].Drag.enabled = false
        Controls[2].Drag = undefined
      }
      else if(Controls[2].Rotate) {
        Controls[2].Rotate.enabled = false
        Controls[2].Rotate.removeEventListener('dragging-changed', rotation_event[2], false)
        Scene.remove(Controls[2].Rotate)
        Controls[2].Rotate = undefined
      }
      else if(Controls[2].Scale) {
        Controls[2].Scale.enabled = false
        Controls[2].Scale.removeEventListener('dragging-changed', scale_event[2], false)
        Scene.remove(Controls[2].Scale)
        Controls[2].Scale = undefined
      }
      if(Controls[3].Drag) {
        Controls[3].Drag.removeEventListener('dragstart', dragstart_event[3], false)
        Controls[3].Drag.removeEventListener('dragend', dragend_event[3], false)
        Controls[3].Drag.enabled = false
        Controls[3].Drag = undefined
      }
      else if(Controls[3].Rotate) {
        Controls[3].Rotate.enabled = false
        Controls[3].Rotate.removeEventListener('dragging-changed', rotation_event[3], false)
        Scene.remove(Controls[3].Rotate)
        Controls[3].Rotate = undefined
      }
      else if(Controls[3].Scale) {
        Controls[3].Scale.enabled = false
        Controls[3].Scale.removeEventListener('dragging-changed', scale_event[3], false)
        Scene.remove(Controls[3].Scale)
        Controls[3].Scale = undefined
      }
    }
  }, [activeControl])
  useEffect(()=>{
    GridMaker(gridPlane.width, gridPlane.height, 200, 0x000000, 0x999999, Scene)
  }, [gridPlane])
  return (
    <div ref={mountRef}>

    </div>
  );
}


export default CanvasContainer222;