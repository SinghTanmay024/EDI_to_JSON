import React from "react";
import JsonExpander from "./JsonExpander";
import upload from "../images/upload.jpg";
import "../css/custom-bootstrap.css";
import Alert from 'react-bootstrap/Alert';

function Upload({ intermediateJSON, setintermediateJSON }) {
  const [files, setFiles] = React.useState([]);
  const [showAlert, setShowAlert] = React.useState([false, "", ""]);

  const handleFileChange = (event) => {
    let newFiles = [];
    for (let temp_file of event.target.files) {
      newFiles.push(temp_file);
    }
    setFiles(newFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles([...files, ...droppedFiles.filter(file => !files.some(existingFile => existingFile.name === file.name))]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length === 0) {
      setShowAlert([true, "Please select a file first!", "danger"]);
      // alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append(file.name, file);
    }

    const response = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    });

    try {
      if (response.status === 200) {
        const data = await response.json();
        setintermediateJSON(data);
        setShowAlert([true, "Successfully uploaded", "success"]);
      } else {
        setShowAlert([true, "Failed to upload file!", "danger"]);
      }
    } catch (exception) {
      console.log(`Exception: ${exception}`);
      setShowAlert([true, "Exception occured!", "danger"]);
    }
  };

  return (
    <>
    {showAlert[0] && (
      <Alert variant={showAlert[2]} onClose={() => setShowAlert([false, "", ""])} dismissible>
        {showAlert[1]}
      </Alert>
    )}
      <div
        className="upload-container w-75 mx-auto pt-5"
        style={{ height: "100%", border: "2px dashed #ccc", padding: "20px", textAlign: "center" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="h1">
          Drag and drop files here
          <img src={upload} alt="Upload Icon" className="img-upload" />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mt-4"
            type="file"
            id="formFile"
            onChange={handleFileChange}
            multiple={true}
          />
          <button type="submit" className="btn btn-danger mt-3">
            Submit
          </button>
        </form>
        {files.length > 0 && (
          <div>
            <h4>Selected Files:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index} style={{listStyle: "none"}}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {intermediateJSON && (
        <div className="container mt-5" style={{ maxWidth: "78%"}}>
          <div className="row">
            <div className="col">
              <JsonExpander jsonData={intermediateJSON}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Upload;
