import React from "react";
import Alert from 'react-bootstrap/Alert';

function EDIDownloader() {
  const [jsonText, setjsonText] = React.useState("[]");
  const [fileType, setfileType] = React.useState("Select");
  const [showAlert, setShowAlert] = React.useState([false, "", ""]);

  const handleDownload = (blob, file_name) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = file_name;
    link.click();
  };
  async function handleEDIDownload(data) {
    const intermediate_data = {};
    intermediate_data[`${fileType}.json`] = {};
    intermediate_data[`${fileType}.json`]["data"] = data;
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Access-Control-Expose-Headers", "Content-Disposition");
    console.log(intermediate_data);
    const response = await fetch("http://127.0.0.1:5000/edit", {
      headers: header,
      method: "POST",
      body: JSON.stringify(intermediate_data),
    });
    try {
      if (response.status === 200) {
        const edi_data = await response.blob();
        const headerData = response.headers.get("content-disposition");
        const file_name = headerData.split("=")[1];
        handleDownload(edi_data, file_name);
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

  async function handleGeneration() {
    if (jsonText === "" || fileType === "Select") {
      setShowAlert([true,"Please enter a json first or select the file type", "danger"]);
    } else {
      const toSend = {data: JSON.parse(jsonText), file: fileType};
      const header = new Headers();
      header.append("Content-Type", "application/json");
      // header.append('Access-Control-Expose-Headers', 'Content-Disposition')
      const response = await fetch("http://127.0.0.1:5000/target_input", {
        headers: header,
        method: "POST",
        body: JSON.stringify(toSend),
      });
      try {
        if (response.status === 200) {
          const data = await response.json();
          if(Object.keys(data['missing']).length > 0){
            setShowAlert([true, `The following mandatory elements are missing:\n\n${JSON.stringify(data['missing'])}`, "danger"]);
            // alert(`The following mandatory elements are missing:\n\n${JSON.stringify(data['missing'])}`);
          }
          handleEDIDownload(data['intermediate']);
          
        } else {
          console.log(response.status);
          setShowAlert([true, "Failed to upload file!", "danger"]);
          // const error = await response.json();
          // console.log(error);
          // alert(`The following mandatory elements are missing:\n\n${JSON.stringify(error)}`);
        }
      } catch (exception) {
        console.log(`Exception: ${exception}`);
        setShowAlert([true, "Exception occured!", "danger"]);
      }
    }
  }

  return (
    <>
        {showAlert[0] && (
      <Alert variant={showAlert[2]} onClose={() => setShowAlert([false, "", ""])} dismissible>
        {showAlert[1]}
      </Alert>
    )}
      <div className="container text-center my-2">
        <select
          className="dropdown-custom-file"
          aria-label="Default select example"
          onChange={(e)=>setfileType(e.target.value)}
        >
          <option value="Select">Select</option>
          <option value="834">834</option>
          <option value="837">837</option>
        </select>
        <div className="h1">Paste the JSON here</div>
        <textarea
          name="JSONText"
          id="jsonText"
          value={jsonText}
          onChange={(e) => setjsonText(e.target.value)}
        />
        <button
          className="btn btn-danger"
          onClick={handleGeneration}
          style={{ position: "fixed", top: "120px", right: "3vw" }}
        >
          Download EDI
        </button>
      </div>
    </>
  );
}

export default EDIDownloader;
