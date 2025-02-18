import React from "react";
import JsonPreviewModal from "./JsonPreviewModal";
import "../css/mapper.css";

function MapperPage({ jsonData }) {
  const [expandedNodes, setExpandedNodes] = React.useState({});
  const [selectedElements, setselectedElements] = React.useState([]);
  const [finalJson, setfinalJson] = React.useState({});

  const toggleExpanded = (key) => {
    setExpandedNodes({
      ...expandedNodes,
      [key]: !expandedNodes[key],
    });
  };

  function getDataByJSONPath(jsonObject, jsonPath) {
    const pathComponents = jsonPath.slice(2, -2).split('"]["');

    let currentObject = jsonObject;

    for (const component of pathComponents) {
      currentObject = currentObject[component];
      if (currentObject === undefined || currentObject === null) {
        break;
      }
    }
    return currentObject;
  }

  const renderData = (data, parentKey = "") => {
    if (typeof data === "object" && data !== null) {
      return (
        <ul className="list-group">
          {Object.entries(data).map(
            ([key, value]) =>
              key !== "payload" &&
              key !== "elements" && (
                <li
                  className="list-group-item"
                  //   key={parentKey + key}
                  key={
                    parentKey === ""
                      ? `$["${key}"]`
                      : parentKey.includes("[")
                      ? `${parentKey}["${key}"]`
                      : `["${parentKey}"]["${key}"]`
                  }
                  name={
                    parentKey === "" ? `$["${key}"]` : `${parentKey}["${key}"]`
                  }
                >
                  {typeof value === "object" && value !== null ? (
                    // Check if the value is an object and not null
                    <React.Fragment>
                      <div className="row">
                        <div className="col-1">
                          <button
                            className="mapper-buttons"
                            onClick={() => toggleExpanded(parentKey + key)}
                          >
                            {expandedNodes[parentKey + key] ? "-" : "+"}
                          </button>
                        </div>
                        <div className="col">
                          <strong>{key}:</strong>
                        </div>
                        <div className="col-1 p-0">
                          <button
                            className="mapper-buttons"
                            name={
                              parentKey === ""
                                ? `["${key}"]`
                                : `${parentKey}["${key}"]`
                            }
                            onClick={() => {
                              let newElements = [...selectedElements];
                              let obj = getDataByJSONPath(
                                jsonData,
                                parentKey === ""
                                  ? `["${key}"]`
                                  : `${parentKey}["${key}"]`
                              );

                              if ("element_desc" in obj) {
                                let newObj = obj;
                                obj = {};
                                obj[newObj["element_desc"]] = newObj["data"];
                              } else {
                                let newObj = {};
                                newObj[`${key}`] = obj;
                                obj = newObj;
                              }
                              newElements.push(JSON.parse(JSON.stringify(obj)));
                              setfinalJson(arrayToObject(newElements));
                              //   setfinalXML(objectToXml(arrayToObject(newElements)));
                              setselectedElements(newElements);
                            }}
                          >
                            <span className="material-symbols-outlined">
                              arrow_forward
                            </span>
                          </button>
                        </div>
                      </div>

                      {expandedNodes[parentKey + key] &&
                        renderData(
                          value,
                          parentKey === ""
                            ? `["${key}"]`
                            : `${parentKey}["${key}"]`
                        )}
                    </React.Fragment>
                  ) : (
                    // Render the key and value directly without a toggle button
                    <React.Fragment>
                      <strong>{key}:</strong>
                      <span>{JSON.stringify(value)}</span>
                    </React.Fragment>
                  )}
                </li>
              )
          )}
        </ul>
      );
    } else {
      return <span>{JSON.stringify(data)}</span>;
    }
  };
  function deleteElementByJSONPath(jsonObject, jsonPath) {
    const cleanedPath = jsonPath.slice(2, -2);

    const pathComponents = cleanedPath.split('"]["');
    let flag = false;
    let currentObject = null;

    for (let i = 0; i <= jsonObject.length - 1; i++) {
      currentObject = jsonObject[i];
      if (pathComponents.length === 1) {
        const key = pathComponents[0].replace('"', "");
        if (key in currentObject) {
          if (Array.isArray(currentObject)) {
            currentObject.splice(key, 1);
          } else {
            delete currentObject[key];
          }
          return jsonObject;
        }
      } else {
        for (let i = 0; i < pathComponents.length - 1; i++) {
          const key = pathComponents[i].replace('"', "");
          if (key in currentObject) {
            currentObject = currentObject[key];
            flag = false;
          } else {
            // If any key is not found, return without modifying the object
            // return jsonObject;
            flag = true;
          }
        }
        if (flag === false) {
          break;
        }
      }
    }
    if (flag) {
      return jsonObject;
    }
    // Get the last path component
    const lastKey = pathComponents[pathComponents.length - 1];

    // Check if the property exists
    if (currentObject && currentObject.hasOwnProperty(lastKey)) {
      // Delete the property
      if (Array.isArray(currentObject)) {
        // console.log(lastKey);
        currentObject.splice(lastKey, 1);
      } else {
        delete currentObject[lastKey];
      }
    }

    return jsonObject;
  }
  const renderSelectedData = (data, parentKey = "") => {
    if (typeof data === "object" && data !== null) {
      return (
        <ul className="list-group">
          {Object.entries(data).map(
            ([key, value]) =>
              key !== "payload" &&
              key !== "elements" && (
                <li
                  className="list-group-item"
                  key={
                    parentKey === "" ? `$["${key}"]` : `${parentKey}["${key}"]`
                  }
                  name={
                    parentKey === "" ? `$["${key}"]` : `${parentKey}["${key}"]`
                  }
                >
                  {typeof value === "object" && value !== null ? (
                    <React.Fragment>
                      <div className="row">
                        <div className="col-1">
                          <button
                            className="mapper-buttons"
                            onClick={() => toggleExpanded(parentKey + key)}
                          >
                            {expandedNodes[parentKey + key] ? "-" : "+"}
                          </button>
                        </div>
                        <div className="col">
                          {/* <input type="text" value={key} name={
                              parentKey === ""
                                ? `$["${key}"]`
                                : `${parentKey}["${key}"]`
                            } onChange={(e)=>updateKeyByPath(selectedElements, key, e.target.value, e.target.name)}/> */}
                          <strong>{key}:</strong>
                        </div>
                        <div className="col-1">
                          <button
                            className="mapper-buttons"
                            name={
                              parentKey === ""
                                ? `$["${key}"]`
                                : `${parentKey}["${key}"]`
                            }
                            onClick={(e) => {
                              // console.log(e.currentTarget.name);
                              // console.log("Hello");
                              let newElements = [...selectedElements];
                              //   console.log(e.currentTarget.name);
                              // console.log(newElements);
                              // console.log(e.currentTarget.name);
                              newElements = deleteElementByJSONPath(
                                newElements,
                                e.currentTarget.name
                              );
                              //   console.log(e.target.name);
                              //   console.log(newElements);
                              setfinalJson(arrayToObject(newElements));
                              //   setfinalXML(objectToXml(arrayToObject(newElements)));
                              setselectedElements(newElements);
                            }}
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>

                      {expandedNodes[parentKey + key] &&
                        renderSelectedData(
                          value,
                          parentKey === ""
                            ? `$["${key}"]`
                            : `${parentKey}["${key}"]`
                        )}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className="row">
                        <div className="col">
                          <strong>{key}:</strong>
                          <span>{JSON.stringify(value)}</span>
                        </div>
                        <div className="col-1 p-0">
                          <button
                            className="mapper-buttons"
                            name={
                              parentKey === ""
                                ? `$["${key}"]`
                                : `${parentKey}["${key}"]`
                            }
                            onClick={(e) => {
                              // console.log(e.currentTarget.name);
                              // console.log("Hello");
                              let newElements = [...selectedElements];
                              //   console.log(e.currentTarget.name);
                              // console.log(newElements);
                              // console.log(e.currentTarget.name);
                              newElements = deleteElementByJSONPath(
                                newElements,
                                e.currentTarget.name
                              );
                              //   console.log(e.target.name);
                              //   console.log(newElements);
                              setfinalJson(arrayToObject(newElements));
                              //   setfinalXML(objectToXml(arrayToObject(newElements)));
                              setselectedElements(newElements);
                            }}
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  )}
                </li>
              )
          )}
        </ul>
      );
    } else {
      return <span>{JSON.stringify(data)}</span>;
      // return (
      //   <div className="row">
      //     <div className="col">
      //       <span>{JSON.stringify(data)}</span>
      //     </div>
      //     <div className="col-1">
      //       <button
      //         className="mapper-buttons"
      //         // name={parentKey === "" ? `$["${key}"]` : `${parentKey}["${key}"]`}
      //         onClick={(e) => {
      //           console.log("Hello");
      //           let newElements = [...selectedElements];
      //           //   console.log(e.currentTarget.name);
      //           // console.log(newElements);
      //           // console.log(e.currentTarget.name);
      //           newElements = deleteElementByJSONPath(
      //             newElements,
      //             e.currentTarget.name
      //           );
      //           //   console.log(e.target.name);
      //           //   console.log(newElements);
      //           setfinalJson(arrayToObject(newElements));
      //           //   setfinalXML(objectToXml(arrayToObject(newElements)));
      //           setselectedElements(newElements);
      //         }}
      //       >
      //         <span className="material-symbols-outlined">delete</span>
      //       </button>
      //     </div>
      //   </div>
      // );
    }
  };
  function arrayToObject(array) {
    return array.reduce((accumulator, current) => {
      return { ...accumulator, ...current };
    }, {});
  }

  return (
    <>
      {Object.keys(finalJson).length > 0 && (
        <JsonPreviewModal json={finalJson} setjson={setfinalJson} />
      )}
      <div className="h1 mx-auto w-25 mt-5">Mapping Page</div>
      {/* <div className="container text-center mb-5">
        <button className="btn btn-danger mx-auto" onClick={previewHandler}>Preview</button>
      </div> */}
      <div className="container">
        <div className="row">
          <div className="col">
            {jsonData && (
              <div className="json-expander">{renderData(jsonData)}</div>
            )}
          </div>

          <div className="col">
            {jsonData && (
              <div className="json-expander">
                {selectedElements &&
                  selectedElements.map((jsonPath) => (
                    <li style={{ listStyle: "none" }} key={jsonPath}>
                      {renderSelectedData(jsonPath)}
                    </li>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default MapperPage;
