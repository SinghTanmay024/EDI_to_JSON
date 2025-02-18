import React from "react";
import "../css/Extractor.css";

function EDIinfoExtractor({ intermediate, setintermediateJSON }) {
  const [selectedFile, setselectedFile] = React.useState("");
  const [fileType, setfileType] = React.useState("");
  const [fields, setFields] = React.useState([]);

  const dropDown = Object.keys(intermediate).map((key) => (
    <option key={key} value={key}>
      {key}
    </option>
  ));

  function checkerHandler(value, isChecked) {
    if (isChecked) {
      setFields((fields) => [...fields, value]);
    } else {
      setFields((fields) => {
        fields.splice(fields.indexOf(value), 1);
        return fields;
      });
    }
  }

  const handleDownload = (blob, file_name) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = file_name;
    link.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (fields.length === 0) {
      alert("Please select a field first");
    } else if (fileType == "" || fileType == "Select Format") {
      alert("Please select a file format first");
    } else {
      const header = new Headers();
      header.append("Content-Type", "application/json");
      header.append("Access-Control-Expose-Headers", "Content-Disposition");
      const response = await fetch("http://127.0.0.1:5000/extract", {
        headers: header,
        method: "POST",
        body: JSON.stringify({
          intermediate: intermediate[selectedFile]["data"],
          fields: fields,
          file_type: fileType,
        }),
      });
      try {
        if (response.status === 200) {
          const data = await response.blob();
          const headerData = response.headers.get("content-disposition");
          if(headerData){
            const file_name = headerData.split("=")[1];
            handleDownload(data, file_name);
          }
          else{
            handleDownload(data, "output.json");
          }
          alert("File uploaded successfully");
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
  };

  return (
    <div className="container ">
      <div className="row">
        <div className="col ">
          <select
            className="dropdown-custom-file my-3"
            aria-label="Default select example"
            onChange={(e) => setselectedFile(e.target.value)}
          >
            <option value="Select">Select File</option>
            {dropDown}
          </select>
        </div>
        <div className="col">
          <select
            className="dropdown-custom-file my-3"
            aria-label="Default select example"
            onChange={(e) => setfileType(e.target.value)}
          >
            <option value="Select">Select Format</option>
            <option value="xml">XML</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        
        {selectedFile !== '' && (
          intermediate[selectedFile]?.elements && (
            <div className="elements-container p-5 my-5">
            {intermediate[selectedFile].elements.map((element) => (
              <div className="checkbox-container" key={element}>
                <div className="col-1 p-0">
                  <input
                    type="checkbox"
                    value={element}
                    onChange={(e) => checkerHandler(e.target.value, e.target.checked)}
                  />
                </div>
                <div className="col p-0">
                  <label>{element}</label>
                  
                </div>
              </div>
              
            ))}
            </div>
          )
        )}
        <button type="submit" className="btn btn-danger">Submit and download</button>
      </form>
    </div>
  );
}

export default EDIinfoExtractor;
