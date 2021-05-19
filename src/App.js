import React, {useState, useEffect, useCallback} from "react";
import CanvasContainer from './containers/CanvasContainer'
import ControlButtons from './components/ControlButtons'
import * as dat from 'dat.gui'
import './App.css';


var Control_Gui = [undefined, undefined, undefined, undefined, undefined]
var x_position = undefined
var y_position = undefined
var usePosition = undefined
var x_rotation = undefined
var y_rotation = undefined
var z_rotation = undefined
var useRotation = undefined
var x_scale = undefined
var y_scale = undefined
var z_scale = undefined
var useScale = undefined
function App() {
  const [activeGui, setActiveGui] = useState(-1)

  const toggleSetup = (value) => {
    if(Control_Gui[value]!==undefined) {
      Control_Gui[value].show()
    }
    if(Control_Gui[activeGui]!==undefined && activeGui !== -1) {
      Control_Gui[activeGui].hide()
    }
    setActiveGui(value)
  }
  const [gridPlane, setGridPlane] = useState({
    width: 500,
    height: 400,
    depth: 400
  })
  const [objectProperty, setObjectProperty] = useState({
    color:0x00ff00,
    wireframe:false,
    opacity: 1,
    useMat: false,
    x:0,
    y:0,
    usePos:false,
    rotate_x:0,
    rotate_y:0,
    rotate_z:0,
    useRot:false,
    scale_x:1,
    scale_y:1,
    scale_z:1,
    useSca:false
  })
  
  const setGridWidth = useCallback((newValue) => {
    setGridPlane((prev) => ({ ...prev, width: newValue}))
  })
  const setGridHeight = useCallback((newValue) => {
    setGridPlane((prev) => ({ ...prev, height: newValue}))
  })
  const setGridDepth = useCallback((newValue) => {
    setGridPlane((prev) => ({...prev, depth: newValue}))
  })
  const setColor = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, color: newValue }))
  }, [])
  const setOpacity = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, opacity: newValue }))
  }, [])
  const setWireFrame = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, wireframe: newValue }))
  }, [])
  const setUseMaterial = useCallback((newValue) => {
    setObjectProperty((prev) =>({ ...prev, useMat: true}))
  })
  const toggleSetMaterial = useCallback(() => {
    setObjectProperty((prev) =>({ ...prev, useMat: false}))
  })
  const setPositionX = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, x: newValue }))
  }, [])
  const setPositionY = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, y: newValue }))
  }, [])
  const setUsePosition = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, usePos: newValue}))
  })
  const toggleSetPosition = useCallback((x_value, y_value) => {
    x_position.setValue(x_value)
    y_position.setValue(y_value)
  }, [])
  const setRotationX = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, rotate_x: newValue }))
  }, [])
  const setRotationY = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, rotate_y: newValue }))
  }, [])
  const setRotationZ = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, rotate_z: newValue }))
  }, [])
  const setUseRotation = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, useRot: newValue}))
  })
  const toggleSetRotation = useCallback((x_value, y_value, z_value) => {
    x_rotation.setValue(x_value / (Math.PI / 180))
    y_rotation.setValue(y_value / (Math.PI / 180))
    z_rotation.setValue(z_value / (Math.PI / 180))
  }, [])
  const setScaleX = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, scale_x: newValue }))
  }, [])
  const setScaleY = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, scale_y: newValue }))
  }, [])
  const setScaleZ = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, scale_z: newValue }))
  }, [])
  const setUseScale = useCallback((newValue) => {
    setObjectProperty((prev) => ({ ...prev, useSca: newValue}))
  })
  const toggleSetScale = useCallback((x_value, y_value, z_value) => {
    x_scale.setValue(x_value)
    y_scale.setValue(y_value)
    z_scale.setValue(z_value)
  }, [])
  const toggleSetAll = useCallback((x_pos, y_pos, x_rot, y_rot, z_rot, x_sca, y_sca, z_sca) => {
    usePosition.setValue(false)
    x_position.setValue(x_pos)
    y_position.setValue(y_pos)
    
    useRotation.setValue(false)
    x_rotation.setValue(x_rot / (Math.PI / 180))
    y_rotation.setValue(y_rot / (Math.PI / 180))
    z_rotation.setValue(z_rot / (Math.PI / 180))
    
    useScale.setValue(false)
    x_scale.setValue(x_sca)
    y_scale.setValue(y_sca)
    z_scale.setValue(z_sca)
    
  })

  var object = {
    color: objectProperty.color,
    wireframe: objectProperty.wireframe,
    opacity: objectProperty.opacity,
    useMaterial: objectProperty.useMat,
    position_x: objectProperty.x,
    position_y: objectProperty.y,
    usePositionBox: objectProperty.usePos,
    rotation_x: objectProperty.rotate_x,
    rotation_y: objectProperty.rotate_y,
    rotation_z: objectProperty.rotate_z,
    useRotationBox: objectProperty.useRot,
    scale_x: objectProperty.scale_x,
    scale_y: objectProperty.scale_y,
    scale_z: objectProperty.scale_z,
    useScaleBox: objectProperty.useSca
  }
  var setup = {
    grid_width:gridPlane.width,
    grid_height:gridPlane.height,
    grid_depth:gridPlane.depth
  }
  useEffect(()=>{
    Control_Gui[0] = new dat.GUI({width:200});
    Control_Gui[0].domElement.id = 'control-gui'
    const setupFolder = Control_Gui[0].addFolder("Setup")
    setupFolder.add(setup, "grid_width", 0, 500, 1).onChange(()=>{
      setGridWidth(setup.grid_width)
    })
    setupFolder.add(setup, "grid_height", 0, 500, 1).onChange(()=>{
      setGridHeight(setup.grid_height)
    })
    setupFolder.add(setup, "grid_depth", 0, 500, 1).onChange(()=>{
      setGridDepth(setup.grid_depth)
    })
    setupFolder.open()

    Control_Gui[1] = new dat.GUI({width:200});
    Control_Gui[1].domElement.id = 'control-gui'
    const materialFolder = Control_Gui[1].addFolder("Material")
    materialFolder.addColor(object, "color").onChange(()=>{
      setColor(object.color)
    })
    materialFolder.add(object, "opacity", 0, 1, 0.1).onChange(()=>{
      setOpacity(object.opacity)
    })
    materialFolder.add(object, "wireframe").onChange(()=>{
      setWireFrame(object.wireframe)
    })
    materialFolder.add({ add:function(){setUseMaterial(true)}}, 'add')
    materialFolder.open()

    Control_Gui[2] = new dat.GUI({width:200});
    Control_Gui[2].domElement.id = 'control-gui'
    const positionFolder = Control_Gui[2].addFolder("Position")
    usePosition = positionFolder.add(object, "usePositionBox").onChange(()=>{
      setUsePosition(object.usePositionBox)
    })
    x_position = positionFolder.add(object, "position_x", -(gridPlane.width/2), (gridPlane.width/2), 1).onChange(()=>{
      setPositionX(object.position_x)
    })
    y_position = positionFolder.add(object, "position_y", -(gridPlane.height/2), (gridPlane.height/2), 1).onChange(()=>{
      setPositionY(object.position_y)
    })
    positionFolder.open()

    Control_Gui[3] = new dat.GUI({width:200});
    Control_Gui[3].domElement.id = 'control-gui'
    const rotationFolder = Control_Gui[3].addFolder("Rotation")
    useRotation = rotationFolder.add(object, "useRotationBox").onChange(()=>{
      setUseRotation(object.useRotationBox)
    })
    x_rotation = rotationFolder.add(object, "rotation_x", -180, 180, 1).onChange(()=>{
      setRotationX(object.rotation_x * (Math.PI / 180))
    })
    y_rotation = rotationFolder.add(object, "rotation_y", -180, 180, 1).onChange(()=>{
      setRotationY(object.rotation_y * (Math.PI / 180))
    })
    z_rotation = rotationFolder.add(object, "rotation_z", -180, 180, 1).onChange(()=>{
      setRotationZ(object.rotation_z * (Math.PI / 180))
    })
    rotationFolder.open()

    Control_Gui[4] = new dat.GUI({width:200})
    Control_Gui[4].domElement.id = 'control-gui'
    const scaleFolder = Control_Gui[4].addFolder("Scale")
    useScale = scaleFolder.add(object, "useScaleBox").onChange(()=>{
      setUseScale(object.useScaleBox)
    })
    x_scale = scaleFolder.add(object, "scale_x", 0.1, 5).onChange(()=>{
      setScaleX(object.scale_x)
    })
    y_scale = scaleFolder.add(object, "scale_y", 0.1, 5).onChange(()=>{
      setScaleY(object.scale_y)
    })
    z_scale = scaleFolder.add(object, "scale_z", 0.1, 5).onChange(()=>{
      setScaleZ(object.scale_z)
    })
    scaleFolder.open()

    Control_Gui[0].hide()
    Control_Gui[1].hide()
    Control_Gui[2].hide()
    Control_Gui[3].hide()
    Control_Gui[4].hide()
  }, [])
  return (
    <>
      <ControlButtons toggleSetup={toggleSetup} />
      <input id="loadButton_wrapper" type="file" accept=".stl"/>
      <input type="button" id="loadButton" value="Load STL"  onClick={()=>{document.getElementById('loadButton_wrapper').click()}}/>
      <CanvasContainer 
        props={objectProperty}
        gridPlane={gridPlane}
        activeControl={activeGui}
        materialControl={toggleSetMaterial}
        positionControl={toggleSetPosition} 
        rotationControl={toggleSetRotation}
        scaleControl={toggleSetScale}
        allControl={toggleSetAll}
      />
    </>
  );
}

export default App;
