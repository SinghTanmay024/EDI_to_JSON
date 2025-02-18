import React from "react";
import "../css/UploadJson.modules.css";
function UploadJson() {
  const [textValue, settextValue] = React.useState("");

  const handleDownload = (blob, file_name) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = file_name;
    link.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (textValue === "") {
      alert("Please select a file first");
    }
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append('Access-Control-Expose-Headers', 'Content-Disposition')
    const response = await fetch("http://127.0.0.1:5000/edit", {
      headers: header,
      method: "POST",
      body: JSON.stringify(JSON.parse(textValue)),
    });
    try {
      if (response.status === 200) {
        const data = await response.blob();
        const headerData = response.headers.get("content-disposition");
        const file_name = headerData.split('=')[1]
        handleDownload(data, file_name);
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
  };

  return (
    <>
      <div className="upload-json-container mt-5">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="exampleFormControlTextarea1" className="form-label">
              New text area
            </label>
            <textarea
              className="form-control"
              id="exampleFormControlTextarea1"
              rows={3}
              value={textValue}
              onChange={(e) => settextValue(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-danger">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default UploadJson;
