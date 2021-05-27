import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import CanvasContainer from "./containers/CanvasContainer";
import ControlButtons from "./components/ControlButtons";
import * as dat from "dat.gui";
import "./App.css";

const Button = styled.div`
  width: 230px;
  height: 19px;
  font-size: 14px;
  padding-left: 2px;
  cursor: pointer;
`;

const ButtonToggle = styled(Button)`
  backgroud-color: 0x555555;
  font-weight: 300;
  color: white;
  ${({ active }) =>
    active &&
    `
    background-color: #08fff2;
    color:black;
    font-weight: 500;
  `}
`;

var Control_Gui = [],
  Setup_Gui = undefined,
  tempProps = [],
  materialFolder = [],
  positionFolder = [],
  x_position = [],
  y_position = [],
  rotationFolder = [],
  x_rotation = [],
  y_rotation = [],
  z_rotation = [],
  scaleFolder = [],
  x_scale = [],
  y_scale = [],
  z_scale = [],
  tempObj = undefined,
  tempGui = undefined;

function App() {
  const [activeGui, setActiveGui] = useState(-1);
  const [activeObj, setActiveObj] = useState(-1);
  const toggleSetActiveObj = (index) => {
    setActiveObj(index);
  };
  const toggleSetInitialGui = () => {
    setActiveGui(-1);
  };
  const toggleSetup = (value) => {
    if (value === 0) {
      Setup_Gui.show();
    } else {
      Setup_Gui.hide();
    }
    setActiveGui(value);
  };
  useEffect(() => {
    if (tempObj !== undefined && tempGui !== undefined) {
      Control_Gui[tempObj][tempGui].hide();
    }
    if (activeGui !== -1 && activeObj !== -1) {
      if (Control_Gui[activeObj][activeGui - 1]) {
        Control_Gui[activeObj][activeGui - 1].show();
        tempObj = activeObj;
        tempGui = activeGui - 1;
      }
    }
  }, [activeGui, activeObj]);
  const [gridPlane, setGridPlane] = useState({
    width: 500,
    height: 400,
    depth: 400,
  });
  // Object Property Array
  const [objectProps, setObjectProps] = useState([
    {
      id: 1,
      color: 0x00ff00,
      wireframe: false,
      opacity: 1,
      x: 0,
      y: 0,
      rotate_x: 0,
      rotate_y: 0,
      rotate_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1,
    },
  ]);

  const nextId = useRef(2);
  const createObjectProps = () => {
    var objectProp = {
      id: nextId.current,
      color: 0x00ff00,
      wireframe: false,
      opacity: 1,
      x: 0,
      y: 0,
      rotate_x: 0,
      rotate_y: 0,
      rotate_z: 0,
      scale_x: 1,
      scale_y: 1,
      scale_z: 1,
    };

    setObjectProps((prev) => [...prev, objectProp]);
    // setObjectProps(tempProps)
    createObjectGui(nextId.current - 1);
    nextId.current += 1;
  };
  const toggleCreateObjectProps = () => {
    createObjectProps();
  };
  const removeObjectProps = (id) => {
    setObjectProps(objectProps.filter((objectProp) => objectProp.id !== id));
  };
  const toggleRemoveObjectProps = (id) => {
    removeObjectProps(id);
  };
  const updateObjectProps = (id, name_1, value_1) => {
    setObjectProps((prev) =>
      prev.map((objectProp) =>
        objectProp.id === id ? { ...objectProp, [name_1]: value_1 } : objectProp
      )
    );
  };
  const toggleUpdateObjectPos = (id, value_1, value_2) => {
    console.log(id, value_1, value_2);
    x_position[id - 1].setValue(value_1);
    y_position[id - 1].setValue(value_2);
  };
  const toggleUpdateObjectRot = (id, value_1, value_2, value_3) => {
    x_rotation[id - 1].setValue(value_1 / (Math.PI / 180));
    y_rotation[id - 1].setValue(value_2 / (Math.PI / 180));
    z_rotation[id - 1].setValue(value_3 / (Math.PI / 180));
  };
  const toggleUpdateObjectSca = (id, value_1, value_2, value_3) => {
    x_scale[id - 1].setValue(value_1);
    y_scale[id - 1].setValue(value_2);
    z_scale[id - 1].setValue(value_3);
  };
  const [outline, setOutline] = useState({
    edgeStrength: 8,
    edgeGlow: 0,
    edgeThickness: 1.5,
    pulsePeriod: 0,
    usePatternTexture: false,
    visibleEdgeColor: "#1c298e",
    hiddenEdgeColor: "#ff0259",
  });
  const setGridWidth = (newValue) => {
    setGridPlane((prev) => ({ ...prev, width: newValue }));
  };
  const setGridHeight = (newValue) => {
    setGridPlane((prev) => ({ ...prev, height: newValue }));
  };
  const setGridDepth = (newValue) => {
    setGridPlane((prev) => ({ ...prev, depth: newValue }));
  };

  var setup = {
    grid_width: gridPlane.width,
    grid_height: gridPlane.height,
    grid_depth: gridPlane.depth,
  };
  var outline_param = {
    edgeStrength: outline.edgeStrength,
    edgeGlow: outline.edgeGlow,
    edgeThickness: outline.edgeThickness,
    pulsePeriod: outline.pulsePeriod,
    usePatternTexture: outline.usePatternTexture,
    visibleEdgeColor: outline.visibleEdgeColor,
    hiddenEdgeColor: outline.hiddenEdgeColor,
  };

  const createObjectGui = (index) => {
    tempProps.push(objectProps[0]);
    Control_Gui.push([]);
    Control_Gui[index].push(new dat.GUI({ width: 200 }));
    Control_Gui[index][0].domElement.id = "control-gui";
    materialFolder.push(
      Control_Gui[index][0].addFolder(`Material [${index + 1}]`)
    );
    materialFolder[index].addColor(tempProps[index], "color").onChange(() => {
      updateObjectProps(index + 1, "color", tempProps[index].color);
    });
    materialFolder[index]
      .add(tempProps[index], "opacity", 0, 1, 0.1)
      .onChange(() => {
        updateObjectProps(index + 1, "opacity", tempProps[index].opacity);
      });
    materialFolder[index].add(tempProps[index], "wireframe").onChange(() => {
      updateObjectProps(index + 1, "wireframe", tempProps[index].wireframe);
    });
    materialFolder[index].open();
    Control_Gui[index][0].hide();

    Control_Gui[index].push(new dat.GUI({ width: 200 }));
    Control_Gui[index][1].domElement.id = "control-gui";
    positionFolder.push(
      Control_Gui[index][1].addFolder(`Position [${index + 1}]`)
    );
    x_position.push(
      positionFolder[index]
        .add(
          tempProps[index],
          "x",
          -(gridPlane.width / 2),
          gridPlane.width / 2,
          1
        )
        .onChange(() => {
          updateObjectProps(index + 1, "x", tempProps[index].x);
        })
    );
    y_position.push(
      positionFolder[index]
        .add(
          tempProps[index],
          "y",
          -(gridPlane.height / 2),
          gridPlane.height / 2,
          1
        )
        .onChange(() => {
          updateObjectProps(index + 1, "y", tempProps[index].y);
        })
    );
    positionFolder[index].open();
    Control_Gui[index][1].hide();

    Control_Gui[index].push(new dat.GUI({ width: 200 }));
    Control_Gui[index][2].domElement.id = "control-gui";
    rotationFolder.push(
      Control_Gui[index][2].addFolder(`Rotation [${index + 1}]`)
    );
    x_rotation.push(
      rotationFolder[index]
        .add(tempProps[index], "rotate_x", -180, 180, 1)
        .onChange(() => {
          updateObjectProps(
            index + 1,
            "rotate_x",
            tempProps[index].rotate_x * (Math.PI / 180)
          );
        })
    );
    y_rotation.push(
      rotationFolder[index]
        .add(tempProps[index], "rotate_y", -180, 180, 1)
        .onChange(() => {
          updateObjectProps(
            index + 1,
            "rotate_y",
            tempProps[index].rotate_y * (Math.PI / 180)
          );
        })
    );
    z_rotation.push(
      rotationFolder[index]
        .add(tempProps[index], "rotate_z", -180, 180, 1)
        .onChange(() => {
          updateObjectProps(
            index + 1,
            "rotate_z",
            tempProps[index].rotate_z * (Math.PI / 180)
          );
        })
    );
    rotationFolder[index].open();
    Control_Gui[index][2].hide();

    Control_Gui[index].push(new dat.GUI({ width: 200 }));
    Control_Gui[index][3].domElement.id = "control-gui";
    scaleFolder.push(Control_Gui[index][3].addFolder(`Scale [${index + 1}]`));
    x_scale.push(
      scaleFolder[index]
        .add(tempProps[index], "scale_x", -0.1, 5)
        .onChange(() => {
          updateObjectProps(index + 1, "scale_x", tempProps[index].scale_x);
        })
    );
    y_scale.push(
      scaleFolder[index]
        .add(tempProps[index], "scale_y", -0.1, 5)
        .onChange(() => {
          updateObjectProps(index + 1, "scale_y", tempProps[index].scale_y);
        })
    );
    z_scale.push(
      scaleFolder[index]
        .add(tempProps[index], "scale_z", -0.1, 5)
        .onChange(() => {
          updateObjectProps(index + 1, "scale_z", tempProps[index].scale_z);
        })
    );
    scaleFolder[index].open();
    Control_Gui[index][3].hide();
  };
  useEffect(() => {}, [objectProps]);

  useEffect(() => {
    Setup_Gui = new dat.GUI({ width: 200 });
    Setup_Gui.domElement.id = "control-gui";
    const setupFolder = Setup_Gui.addFolder("Setup");
    setupFolder.add(setup, "grid_width", 0, 500, 1).onChange(() => {
      setGridWidth(setup.grid_width);
    });
    setupFolder.add(setup, "grid_height", 0, 500, 1).onChange(() => {
      setGridHeight(setup.grid_height);
    });
    setupFolder.add(setup, "grid_depth", 0, 500, 1).onChange(() => {
      setGridDepth(setup.grid_depth);
    });
    setupFolder.open();
    const outlineFolder = setupFolder.addFolder("Outline");
    outlineFolder.add(outline_param, "edgeStrength", 0.01, 30).onChange(() => {
      setOutline((prev) => ({
        ...prev,
        edgeStrength: outline_param.edgeStrength,
      }));
    });
    outlineFolder.add(outline_param, "edgeGlow", 0.0, 1).onChange(() => {
      setOutline((prev) => ({ ...prev, edgeGlow: outline_param.edgeGlow }));
    });
    outlineFolder.add(outline_param, "edgeThickness", 1, 4).onChange(() => {
      setOutline((prev) => ({
        ...prev,
        edgeThickness: outline_param.edgeThickness,
      }));
    });
    outlineFolder.add(outline_param, "pulsePeriod", 0.0, 5).onChange(() => {
      setOutline((prev) => ({
        ...prev,
        pulsePeriod: outline_param.pulsePeriod,
      }));
    });
    outlineFolder.add(outline_param, "usePatternTexture").onChange(() => {
      setOutline((prev) => ({
        ...prev,
        usePatternTexture: outline_param.usePatternTexture,
      }));
    });
    outlineFolder.addColor(outline_param, "visibleEdgeColor").onChange(() => {
      setOutline((prev) => ({
        ...prev,
        visibleEdgeColor: outline_param.visibleEdgeColor,
      }));
    });
    outlineFolder.addColor(outline_param, "hiddenEdgeColor").onChange(() => {
      setOutline((prev) => ({
        ...prev,
        hiddenEdgeColor: outline_param.hiddenEdgeColor,
      }));
    });
    outlineFolder.open();
    Setup_Gui.hide();

    createObjectGui(0);
  }, []);
  const [objectLists, setObjectLists] = useState([]);
  const nextObjectListId = useRef(0);
  const createObjectList = (name) => {
    var objectList = {
      id: nextObjectListId.current,
      name: name,
    };

    setObjectLists((prev) => [...prev, objectList]);
    nextObjectListId.current += 1;
  };
  const toggleCreateObjectList = (name) => {
    createObjectList(name);
  };
  const toggleDeleteObjectList = (id) => {
    setObjectLists((prev) =>
      prev.map((objectList) =>
        objectList.id === id ? { ...objectList, name: undefined } : objectList
      )
    );
  };
  return (
    <>
      <ControlButtons props={activeGui} toggleSetup={toggleSetup} />
      <input id="loadButton_wrapper" type="file" accept=".stl" />
      <input
        type="button"
        id="loadButton"
        value="Load STL"
        onClick={() => {
          document.getElementById("loadButton_wrapper").click();
        }}
      />
      <button id="view_refresh">Camera Refresh</button>
      <div id="object_list">
        <div id="object_list_name">Object List</div>
        <div id="object_list_area">
          {objectLists.map(
            (info) =>
              info.name && (
                <ButtonToggle
                  key={info.id}
                  active={activeObj === info.id}
                  onClick={() => setActiveObj(info.id)}
                >
                  {`[${info.id}] ${info.name}`}
                </ButtonToggle>
              )
          )}
        </div>
      </div>
      <CanvasContainer
        props={objectProps}
        newObj={toggleCreateObjectProps}
        newObjList={toggleCreateObjectList}
        delObjList={toggleDeleteObjectList}
        gridPlane={gridPlane}
        activeObj={activeObj}
        setActiveObj={toggleSetActiveObj}
        initialGui={toggleSetInitialGui}
        outline={outline}
        activeControl={activeGui}
        positionControl={toggleUpdateObjectPos}
        rotationControl={toggleUpdateObjectRot}
        scaleControl={toggleUpdateObjectSca}
      />
    </>
  );
}

export default App;
