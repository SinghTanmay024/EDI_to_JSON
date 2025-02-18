import React, { useState, useRef } from "react";
import Alert from 'react-bootstrap/Alert';
import CodeEditor from './CodeEditor'

const JsonPreviewModal = ({ json, setjson }) => {
  const [jsonText, setjsonText] = useState("");
  const [showAlert, setShowAlert] = React.useState([false, "", ""]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //Monaco things
  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }
  function getEditorValue() {
    setjsonText(editorRef.current.getValue());
    return true;
  }


  const handleDownload = (blob, file_name) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = file_name;
    link.click();
  };


  async function handleFileDownload(data, file_type) {
    const intermediate_data = {};
    intermediate_data['file_type'] = file_type;
    intermediate_data["data"] = data;
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Access-Control-Expose-Headers", "Content-Disposition");
    const response = await fetch("http://127.0.0.1:5000/mappingDownload", {
      headers: header,
      method: "POST",
      body: JSON.stringify(intermediate_data),
    });
    try {
      if (response.status === 200) {
        console.log("Hello");
        const file_data = await response.blob();
        const headerData = response.headers.get("content-disposition");
        console.log(headerData);
        const file_name = `output.${file_type}`;
        handleDownload(file_data, file_name);
        // alert("File uploaded successfully");
        // settextValue(JSON.stringify(data));
      } else {
        console.log(response.status);
        setShowAlert([true, "Failed to upload file!", "danger"]);
      }
    } catch (exception) {
      console.log(`Exception: ${exception}`);
      setShowAlert([true, "Exception occured!", "danger"]);
    }
  }

  function handleEditorValidation(markers) {
    // model markers
    let messages = ""
    markers.forEach((marker) => messages = messages + `\n${marker.message}`);
    setShowAlert([true, "JSON Validation error" + `\n${messages}`, "danger"]);
  }

  function isValidJSON() {
    try {
        JSON.parse(jsonText);
        return true; 
    } catch (error) {
      console.log(error);
        return false; 
    }
  }

  return (
    <>
    {showAlert[0] && (
      <Alert variant={showAlert[2]} onClose={() => setShowAlert([false, "", ""])} dismissible>
        {showAlert[1]}
      </Alert>
    )}
      <button className="btn btn-danger" onClick={handleShow}>
        Customize & Save
      </button>

      {show && (
        <div
          className="modal fade show"
          tabIndex="-1"
          role="dialog"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Preview</h5>
                <button
                  type="button"
                  className="close btn btn-danger"
                  onClick={handleClose}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div
                className="modal-body"
                style={{ overflowY: "scroll", maxHeight: "80vh" }}
              >
                <CodeEditor jsonData={JSON.stringify(json)} setjson = {setjson} handleEditorDidMount={handleEditorDidMount} handleEditorValidation={handleEditorValidation}/>

              </div>
              <div className="modal-footer">
                <div className="btn-group">
                  <button type="button" className="btn btn-danger">
                    Download Format
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger dropdown-toggle dropdown-toggle-split"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="visually-hidden">Toggle Dropdown</span>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#" onClick={()=>{
                       ( getEditorValue() && isValidJSON(JSON.stringify(jsonText))) ? handleFileDownload(JSON.parse(jsonText), 'json') : setShowAlert([true, "JSON file invalid", "danger"]);
                        }}>
                        JSON
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={()=>{
                        ( getEditorValue() && isValidJSON(JSON.stringify(jsonText))) ? handleFileDownload(JSON.parse(jsonText), 'xml') : setShowAlert([true, "JSON file invalid", "danger"]);
                        }}>
                        XML
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item disabled" href="#">
                        CSV
                      </a>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default JsonPreviewModal;
