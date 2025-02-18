import React from "react";
import "../css/custom-bootstrap.css";
import icon from "../images/icon.png";
import JsonPathContainer from "./JsonPathContainer";

function formatSelectedElements(selectedElements) {
  let formattedString = '';
  for (const key in selectedElements) {
    formattedString += `\n\n=== ${key} ===\n\n`;
    formattedString += JSON.stringify(selectedElements[key], null, 2);
  }
  return formattedString;
}

function JsonViewer({ intermediate, setintermediateJSON }) {
  const [subscriberState, setSubscriberState] = React.useState([]);
  const [dependentState, setDependentState] = React.useState([]);
  const [patientState, setPatientState] = React.useState([]);
  const [subscriberDataDisplay, setsubscriberDataDisplay] = React.useState([
    false,
    null,
  ]);
  const [dependentDataDisplay, setdependentDataDisplay] = React.useState([
    false,
    null,
    null,
  ]);
  const [patientDataDisplay, setpatientDataDisplay] = React.useState([
    false,
    null,
    null,
    null,
  ]);
  const [firstKey, setfirstKey] = React.useState("");
  const [secondKey, setsecondKey] = React.useState("");
  const [thirdKey, setthirdKey] = React.useState("");
  const [loaderShow, setloaderShow] = React.useState(false);
  const [selectedElements, setselectedElements] = React.useState({});
  const [elementJsonPath, setelementJsonPath] = React.useState("");
  const [selectedMember, setSelectedMember] = React.useState({subscriber: null, dependent: null, patient: null});

  function handleFileSelector(file_name) {
    // setdependentDropDown([]);
    setsubscriberDataDisplay([false, null]);
    setdependentDataDisplay([false, null, null]);
    setpatientDataDisplay([false, null, null, null]);
    // setsubscriberDropDown([]);
    // setpatientDropDown([]);
    if (file_name !== "Select") {
      let subscribers = [];
      let firstKeyhere = Object.keys(intermediate[file_name]["payload"]);
      let index = firstKeyhere.indexOf("data");
      firstKeyhere = firstKeyhere.splice(index, 1)[0];
      setfirstKey(firstKeyhere);
      for (let subscriber of intermediate[file_name]["payload"][firstKeyhere]) {
        let elements = Object.keys(subscriber);
        let first_name = "";
        let middle_name = "";
        let last_name = "";
        for (let element of elements) {
          let broken_element = element.split("_");
          if (
            broken_element[broken_element.length - 1] === "Name First" &&
            (broken_element[1] === "Billing Provider Name" ||
              broken_element[1] === "Member Name")
          ) {
            first_name = subscriber[element];
          } else if (
            broken_element[broken_element.length - 1] === "Name Middle" &&
            (broken_element[1] === "Billing Provider Name" ||
              broken_element[1] === "Member Name")
          ) {
            middle_name = subscriber[element];
          } else if (
            broken_element[broken_element.length - 1] ===
              "Name Last or Organization Name" &&
            (broken_element[1] === "Billing Provider Name" ||
              broken_element[1] === "Member Name")
          ) {
            last_name = subscriber[element];
          }
        }
        subscribers.push({
          fileName: file_name,
          subNumber:
            intermediate[file_name]["payload"][firstKeyhere].indexOf(
              subscriber
            ),
          subName: `${first_name} ${middle_name} ${last_name}`,
        });
      }
      setSubscriberState(subscribers);
      // setsubscriberDropDown(

      // );
    }
  }

  function handleSubscriberSelector(subscriber_number) {
    setpatientDataDisplay([false, null, null, null]);
    setPatientState([]);
    setDependentState([]);
    // setpatientDropDown([]);
    setdependentDataDisplay([false, null, null]);
    setSelectedMember((selectedMember)=>{return {...selectedMember, subscriber: subscriber_number}});
    // setdependentDropDown([]);
    if (subscriber_number === "Select") {
      setsubscriberDataDisplay([false, null]);
    } else {
      for (let subscriber of subscriberState) {
        if (subscriber["subNumber"] == subscriber_number) {
          setsubscriberDataDisplay([true, subscriber]);
          let secondKeyhere = Object.keys(
            intermediate[subscriber["fileName"]]["payload"][firstKey][
              subscriber["subNumber"]
            ]
          );
          for (let key of secondKeyhere) {
            if (
              Array.isArray(
                intermediate[subscriber["fileName"]]["payload"][firstKey][
                  subscriber["subNumber"]
                ][key]
              )
            ) {
              secondKeyhere = key;
              break;
            }
          }
          setsecondKey(secondKeyhere);
          let dependents =
            intermediate[subscriber["fileName"]]["payload"][firstKey][
              subscriber["subNumber"]
            ][secondKeyhere];
          let dependent_info = [];
          for (let dependent of dependents) {
            let elements = Object.keys(dependent);
            let first_name = "";
            let middle_name = "";
            let last_name = "";
            for (let element of elements) {
              let broken_element = element.split("_");
              if (
                broken_element[broken_element.length - 1] === "Name First" &&
                (broken_element[1] === "Subscriber Name" ||
                  broken_element[1] === "Member Name")
              ) {
                first_name = dependent[element];
              } else if (
                broken_element[broken_element.length - 1] === "Name Middle" &&
                (broken_element[1] === "Subscriber Name" ||
                  broken_element[1] === "Member Name")
              ) {
                middle_name = dependent[element];
              } else if (
                broken_element[broken_element.length - 1] ===
                  "Name Last or Organization Name" &&
                (broken_element[1] === "Subscriber Name" ||
                  broken_element[1] === "Member Name")
              ) {
                last_name = dependent[element];
              }
            }
            dependent_info.push({
              depName: `${first_name} ${middle_name} ${last_name}`,
              subNumber: subscriber["subNumber"],
              subName: subscriber["subName"],
              depNumber: dependents.indexOf(dependent),
            });
          }
          setDependentState(dependent_info);
          // setdependentDropDown(
            
          // );
        }
      }
    }
  }

  function dataChangeHandler(type, element_key, field_id, data) {
    data = data.substring(1, data.length - 1);
    if (type === "S") {
      let subscriber_number = field_id.split("|")[0];
      let file_name = field_id.split("|")[1];

      setintermediateJSON((intermediate) => {
        let new_intermediate = { ...intermediate };
        new_intermediate[file_name]["payload"][firstKey][subscriber_number][
          element_key
        ] = data;
        return new_intermediate;
      });
    } else if (type === "D") {
      let dependent_number = field_id.split("|")[0];
      let subscriber_number = field_id.split("|")[1];
      let file_name = field_id.split("|")[2];
      setintermediateJSON((intermediate) => {
        let new_intermediate = { ...intermediate };
        new_intermediate[file_name]["payload"][firstKey][subscriber_number][
          secondKey
        ][dependent_number][element_key] = data;
        return new_intermediate;
      });
    } else if (type === "P") {
      let patient_number = field_id.split("|")[0];
      let dependent_number = field_id.split("|")[1];
      let subscriber_number = field_id.split("|")[2];
      let file_name = field_id.split("|")[3];
      setintermediateJSON((intermediate) => {
        let new_intermediate = { ...intermediate };
        new_intermediate[file_name]["payload"][firstKey][subscriber_number][
          secondKey
        ][dependent_number][thirdKey][patient_number][element_key] = data;
        return new_intermediate;
      });
    }
  }

  function handleDependentSelector(dependent_number) {
    setpatientDataDisplay([false, null, null, null]);
    setSelectedMember((selectedMember)=>{return {...selectedMember, dependent: dependent_number}});
    setPatientState([]);
    if (dependent_number === "Select") {
      setdependentDataDisplay([false, null, null]);
      // setpatientDropDown([]);
    } else {
      for (let dependent of dependentState) {
        if (dependent_number == dependent["depNumber"]) {
          let current_subscriber = {};
          for (let subscriber of subscriberState) {
            if (subscriber["subNumber"] === dependent["subNumber"]) {
              current_subscriber = subscriber;
              break;
            } 
          }
          let thirdKeyhere = Object.keys(
            intermediate[current_subscriber["fileName"]]["payload"][firstKey][
              current_subscriber["subNumber"]
            ][secondKey][dependent["depNumber"]]
          );
          for (let key of thirdKeyhere) {
            if (
              Array.isArray(
                intermediate[current_subscriber["fileName"]]["payload"][
                  firstKey
                ][current_subscriber["subNumber"]][secondKey][
                  dependent["depNumber"]
                ][key]
              )
            ) {
              thirdKeyhere = key;
              break;
            }
          }
          setdependentDataDisplay([true, dependent, current_subscriber]);
          if (!Array.isArray(thirdKeyhere)) {
            setthirdKey(thirdKeyhere);
            let patients =
              intermediate[current_subscriber["fileName"]]["payload"][firstKey][
                current_subscriber["subNumber"]
              ][secondKey][dependent["depNumber"]][thirdKeyhere];
            let patient_info = [];
            for (let patient of patients) {
              let elements = Object.keys(patient);
              let first_name = "";
              let middle_name = "";
              let last_name = "";
              for (let element of elements) {
                let broken_element = element.split("_");
                if (
                  broken_element[broken_element.length - 1] === "Name First"
                ) {
                  first_name = patient[element];
                } else if (
                  broken_element[broken_element.length - 1] === "Name Middle"
                ) {
                  middle_name = patient[element];
                } else if (
                  broken_element[broken_element.length - 1] ===
                  "Name Last or Organization Name"
                ) {
                  last_name = patient[element];
                }
              }
              patient_info.push({
                patName: `${first_name} ${middle_name} ${last_name}`,
                subName: current_subscriber["subName"],
                depName: dependent["depName"],
                subNumber: current_subscriber["subNumber"],
                depNumber: dependent['depNumber'],
                patNumber: patients.indexOf(patient),
              });
            }
            setPatientState(patient_info);
            // setpatientDropDown(
              
            // );
          }
        }
      }
    }
  }

  function handlePatientSelector(patient_number) {
    setSelectedMember((selectedMember)=>{return {...selectedMember, patient: patient_number}});
    if (patient_number !== "Select"){
      for (let patient of patientState) {
        if (patient_number == patient["patNumber"]) {
          let current_dependent = {};
          for (let dependent of dependentState) {
            if (dependent["depNumber"] === patient["depNumber"]) {
              current_dependent = dependent;
              break;
            }
          }
          let current_subscriber = {};
          for (let subscriber of subscriberState) {
            if (subscriber["subNumber"] === patient["subNumber"]) {
              current_subscriber = subscriber;
              break;
            }
          }
          setpatientDataDisplay([
            true,
            patient,
            current_dependent,
            current_subscriber,
          ]);
        }
      }
    }
  }

  const dropDown = Object.keys(intermediate).map((key) => (
    <option key={key} value={key}>
      {key}
    </option>
  ));

  const handleDownload = (blob, file_name) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = file_name;
    link.click();
  };
  async function downloadButtonHandler() {
    setloaderShow(true);
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Access-Control-Expose-Headers", "Content-Disposition");
    const response = await fetch("http://127.0.0.1:5000/edit", {
      headers: header,
      method: "POST",
      body: JSON.stringify(intermediate),
    });
    try {
      if (response.status === 200) {
        const data = await response.blob();
        const headerData = response.headers.get("content-disposition");
        const file_name = headerData.split("=")[1];
        handleDownload(data, file_name);
        setloaderShow(false);

        // settextValue(JSON.stringify(data));
      } else {
        console.log(response.status);
        alert("Failed to upload file");
      }
    } catch (exception) {
      console.log(`Exception: ${exception}`);
      alert("Exception occured");
    }
  }

  function createKeyPathWithValue(obj, searchValue, newKey, path = "") {
    if (typeof obj === "object" && obj !== null) {
      for (const prop in obj) {
        const newPath = path ? `${path}.${prop}` : prop;

        if (obj[prop] === searchValue && prop === "element_name") {
          // Found the matching value, create the new key-value pair
          obj[newKey] = searchValue;
          return newPath; // Return the path where it was placed
        } else if (typeof obj[prop] === "object" && obj[prop] !== null) {
          const foundPath = createKeyPathWithValue(
            obj[prop],
            searchValue,
            newKey,
            newPath
          );
          if (foundPath) {
            return foundPath;
          }
        }
      }
    }
    return null; // Value not found
  }

  function findKeyPath(obj, key, element_key, path = "", find_element = false) {
    if (typeof obj === "object" && obj !== null) {
      for (const prop in obj) {
        if (prop !== "payload") {
          let new_prop = `["${prop}"]`;
          const newPath = path ? `${path}${new_prop}` : new_prop;

          if (prop === key) {
            let new_path = findKeyPath(
              obj[prop],
              element_key,
              element_key,
              newPath,
              true
            );
            return new_path;
          } else if (typeof obj[prop] === "object" && obj[prop] !== null) {
            const foundPath = findKeyPath(
              obj[prop],
              key,
              element_key,
              newPath,
              find_element
            );

            if (foundPath) {
              return foundPath;
            }
          } else if (find_element && obj[prop] === element_key) {
            const element_found_path = path ? `${path}` : new_prop;
            return element_found_path;
          }
        }
      }
    }
    return null;
  }

  function handleChecker(value, isChecked, member_type) {
    let target_key_name;
    if(member_type === 'S'){
      target_key_name = `${firstKey.toUpperCase()}.${selectedMember.subscriber}`
    }else if(member_type === 'D'){
      target_key_name = `${firstKey.toUpperCase()}.${selectedMember.subscriber}|${secondKey.toUpperCase()}.${selectedMember.dependent}`
    }else if(member_type === 'P'){
      target_key_name = `${firstKey.toUpperCase()}.${selectedMember.subscriber}|${secondKey.toUpperCase()}.${selectedMember.dependent}|${thirdKey.toUpperCase()}.${selectedMember.patient}`
    }
    value = value.split("|:|");
    value[0] = value[0].substring(1, value[0].length - 1);
    value[1] = value[1].substring(1, value[1].length - 1);
    let key = value[0];
    value[0] = value[0].split("_").splice(-1);
    key = key.split("_");
    let element_name = key[3];
    key = `${key[0]}_${key[1]}_${key[2]}`;
    // let path = createKeyPathWithValue(intermediate, element_name, key);
    let path = findKeyPath(intermediate, key, element_name);
    // path = path.split(".");
    // path.splice(-1, 1);
    // path = path.join(".");
    path = `$${path}`;
    setelementJsonPath(path);
    if (isChecked) {
      setselectedElements((selectedElements) => {
        return {
          ...selectedElements,
          [target_key_name]:{
            ...selectedElements[target_key_name],
            [value[0]]: value[1],
          }
        };
      });
    } else {
      setselectedElements((selectedElements) => {
          delete selectedElements[target_key_name][value[0]];
        if(Object.keys(selectedElements[target_key_name]).length === 0){
          delete selectedElements[target_key_name];
        }
        return { ...selectedElements };
      });

      setelementJsonPath(""); // Clear the path when the checkbox is unchecked
    }
  }


  
  return (
    <>
      {loaderShow && (
        <div className="spinner-container">
          <div
            class="spinner-border text-primary loadingSpinner"
            role="status"
            style={{ width: "7rem", height: "7rem" }}
          >
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <JsonPathContainer elementJsonPath={elementJsonPath} />

      <div className="dropdown-container">
        <select
          className="dropdown-custom-file"
          aria-label="Default select example"
          onChange={(e) => {
            setSubscriberState([]);
            handleFileSelector(e.target.value);
          }}
        >
          <option value="Select">Select</option>
          {dropDown}
        </select>
        {subscriberState.length > 0 && (
          <select
            className="dropdown-custom-sub"
            aria-label="Default select example"
            onChange={(e) => handleSubscriberSelector(e.target.value)}
          >
            <option value="Select">Choose {firstKey}</option>
            {subscriberState.map((subscriber) => (
              <option
                key={subscriber["subNumber"]}
                id={subscriber["subNumber"]}
                value={subscriber["subNumber"]}
              >
                {subscriber["subName"]}
              </option>
            ))}
          </select>
        )}
        {dependentState.length > 0 && (
          <select
            className="dropdown-custom-dep"
            aria-label="Default select example"
            onChange={(e) => handleDependentSelector(e.target.value)}
          >
            <option value="Select">Choose {secondKey}</option>
            {dependentState.map((dependent_info) => (
              <option
                key={dependent_info["depName"]}
                value={dependent_info["depNumber"]}
              >
                {dependent_info["depName"]}
              </option>
            ))}
          </select>
        )}
        {patientState.length > 0 && (
          <select
            className="dropdown-custom-pat"
            aria-label="Default select example"
            onChange={(e) => handlePatientSelector(e.target.value)}
          >
            <option value="Select">Choose {thirdKey}</option>
            {patientState.map((patient_info) => (
                <option
                  key={patient_info["patName"]}
                  value={patient_info["patNumber"]}
                >
                  {patient_info["patName"]}
                </option>
              ))}
          </select>
        )}
      </div>
      <div className="row px-3">
        <div className="col">
          {subscriberDataDisplay[0] && (
            <div className="container mt-5">
              <div className="row">
                <div className="col subscriber-container">
                  <>
                    <div className="info">
                      <h1>{subscriberDataDisplay[1]["subName"]}</h1>
                      <img src={icon} alt="Subscriber" className="info-image" />
                    </div>

                    {Object.keys(
                      intermediate[subscriberDataDisplay[1]["fileName"]][
                        "payload"
                      ][firstKey][subscriberDataDisplay[1]["subNumber"]]
                    ).map((field) => {
                      if (field !== secondKey) {
                        return (
                          <>
                            <div className="container">
                              <div className="row">
                                <div className="col-1 p-0">
                                  <input
                                    type="checkbox"
                                    value={`"${field}"|:|"${
                                      intermediate[
                                        subscriberDataDisplay[1]["fileName"]
                                      ]["payload"][firstKey][
                                        subscriberDataDisplay[1]["subNumber"]
                                      ][field]
                                    }"`}
                                    key={field}
                                    defaultChecked={false}
                                    onChange={(e) =>
                                      handleChecker(
                                        e.target.value,
                                        e.target.checked,
                                        "S"
                                      )
                                    }
                                  />
                                </div>
                                <div className="col p-0">
                                  <input
                                    className="border-0 w-100"
                                    type="text"
                                    value={`"${field.split("_").splice(-1)}"`}
                                    readOnly={true}
                                  />
                                </div>
                                <div className="col p-0">
                                  <input
                                    className="border-0 w-100"
                                    type="text"
                                    name={field}
                                    id={`${subscriberDataDisplay[1]["subNumber"]}|${subscriberDataDisplay[1]["fileName"]}`}
                                    value={`"${
                                      intermediate[
                                        subscriberDataDisplay[1]["fileName"]
                                      ]["payload"][firstKey][
                                        subscriberDataDisplay[1]["subNumber"]
                                      ][field]
                                    }"`}
                                    onChange={(e) =>
                                      dataChangeHandler(
                                        "S",
                                        e.target.name,
                                        e.target.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      } else return <></>;
                    })}
                  </>
                </div>
              </div>
            </div>
          )}

          {dependentDataDisplay[0] && (
            <div className="container mt-5">
              <div className="row">
                <div className="col dependent-container">
                  <>
                    <div className="info">
                      <h1>{dependentDataDisplay[1]["depName"]}</h1>
                      <img src={icon} alt="Subscriber" className="info-image" />
                    </div>
                    {Object.keys(
                      intermediate[dependentDataDisplay[2]["fileName"]][
                        "payload"
                      ][firstKey][dependentDataDisplay[2]["subNumber"]][
                        secondKey
                      ][dependentDataDisplay[1]["depNumber"]]
                    ).map((field) => {
                      if (field !== thirdKey) {
                        return (
                          <>
                            <div className="container">
                              <div className="row">
                                <div className="col-1 p-0">
                                  <input
                                    type="checkbox"
                                    key={field}
                                    value={`"${field}"|:|"${
                                      intermediate[
                                        dependentDataDisplay[2]["fileName"]
                                      ]["payload"][firstKey][
                                        dependentDataDisplay[2]["subNumber"]
                                      ][secondKey][
                                        dependentDataDisplay[1]["depNumber"]
                                      ][field]
                                    }"`}
                                    defaultChecked={false}
                                    onChange={(e) =>
                                      handleChecker(
                                        e.target.value,
                                        e.target.checked,
                                        "D"
                                      )
                                    }
                                  />
                                </div>
                                <div className="col p-0">
                                  <input
                                    className="border-0 w-100"
                                    type="text"
                                    value={`"${field.split("_").splice(-1)}"`}
                                    readOnly={true}
                                  />
                                </div>
                                <div className="col p-0">
                                  <input
                                    className="border-0 w-100"
                                    type="text"
                                    name={field}
                                    key={field}
                                    id={`${dependentDataDisplay[1]["depNumber"]}|${dependentDataDisplay[2]["subNumber"]}|${dependentDataDisplay[2]["fileName"]}`}
                                    value={`"${
                                      intermediate[
                                        dependentDataDisplay[2]["fileName"]
                                      ]["payload"][firstKey][
                                        dependentDataDisplay[2]["subNumber"]
                                      ][secondKey][
                                        dependentDataDisplay[1]["depNumber"]
                                      ][field]
                                    }"`}
                                    onChange={(e) =>
                                      dataChangeHandler(
                                        "D",
                                        e.target.name,
                                        e.target.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      } else {
                        return <></>;
                      }
                    })}
                  </>
                </div>
              </div>
            </div>
          )}
          {patientDataDisplay[0] && (
            <div className="container mt-5">
              <div className="row">
                {/* This is the column to edit right now */}

                <div className="col patient-container">
                  {patientDataDisplay[0] && (
                    <>
                      <div className="info">
                        <h1>{patientDataDisplay[1]["patName"]}</h1>
                        <img
                          src={icon}
                          alt="Subscriber"
                          className="info-image"
                        />
                      </div>
                      {Object.keys(
                        intermediate[patientDataDisplay[3]["fileName"]][
                          "payload"
                        ][firstKey][patientDataDisplay[3]["subNumber"]][
                          secondKey
                        ][patientDataDisplay[2]["depNumber"]][thirdKey][
                          patientDataDisplay[1]["patNumber"]
                        ]
                      ).map((field) => (
                        <>
                          <div className="container">
                            <div className="row">
                              <div className="col-1 p-0">
                                <input
                                  type="checkbox"
                                  key={field}
                                  value={`"${field}"|:|"${
                                    intermediate[
                                      patientDataDisplay[3]["fileName"]
                                    ]["payload"][firstKey][
                                      patientDataDisplay[3]["subNumber"]
                                    ][secondKey][
                                      patientDataDisplay[2]["depNumber"]
                                    ][thirdKey][
                                      patientDataDisplay[1]["patNumber"]
                                    ][field]
                                  }"`}
                                  defaultChecked={false}
                                  onChange={(e) =>
                                    handleChecker(
                                      e.target.value,
                                      e.target.checked,
                                      "P"
                                    )
                                  }
                                />
                              </div>
                              <div className="col p-0">
                                <input
                                  className="border-0 w-100"
                                  type="text"
                                  value={`"${field.split("_").splice(-1)}"`}
                                  readOnly={true}
                                />
                              </div>
                              <div className="col p-0">
                                <input
                                  className="border-0 w-100"
                                  type="text"
                                  name={field}
                                  id={`${patientDataDisplay[1]["patNumber"]}|${patientDataDisplay[2]["depNumber"]}|${patientDataDisplay[3]["subNumber"]}|${patientDataDisplay[3]["fileName"]}`}
                                  value={`"${
                                    intermediate[
                                      patientDataDisplay[3]["fileName"]
                                    ]["payload"][firstKey][
                                      patientDataDisplay[3]["subNumber"]
                                    ][secondKey][
                                      patientDataDisplay[2]["depNumber"]
                                    ][thirdKey][
                                      patientDataDisplay[1]["patNumber"]
                                    ][field]
                                  }"`}
                                  onChange={(e) =>
                                    dataChangeHandler(
                                      "D",
                                      e.target.name,
                                      e.target.id,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col mt-5">
  {selectedElements && Object.keys(selectedElements).length > 0 && (
    <textarea
      name="finalJSOn"
      className="finalJSON-textarea"
      id="finalJSON"
      cols="30"
      rows="10"
      value={formatSelectedElements(selectedElements)}
      readOnly
    ></textarea>
  )}
</div>


      </div>

      <button
        className="btn btn-danger"
        onClick={downloadButtonHandler}
        style={{
          position: "fixed",
          bottom: "2vh",
          right: "3vh",
          zIndex: "100",
        }}
      >
        Save & Download
      </button>
    </>
  );
}

export default JsonViewer;
