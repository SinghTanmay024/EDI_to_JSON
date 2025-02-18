import React from "react";
import "../css/Upload.modules.css";
function Upload() {
    const [file, setFile] = React.useState([]);
    const [textValue, settextValue] = React.useState('');

    const handleFileChange = (event)=>{
        let new_file = [...file];
        for(let temp_file of event.target.files){
            new_file.push(temp_file);
        }
        setFile(new_file);
    }
  const handleSubmit = async (event) => {
    event.preventDefault();
    if(file.length === 0){
        alert("Please select a file first");
    }

    const formData = new FormData();
    // console.log(file);
    for(let temp_file of file){
        formData.append(temp_file.name, temp_file);
    }

    const response = await fetch(
        "http://127.0.0.1:5000/upload",
        {
            method: "POST",
            body: formData
        }
    )
        try{

            if(response.status === 200){
                const data = await response.json();
                alert("File uploaded successfully");
                settextValue(JSON.stringify(data));
            }
            else{
                alert("Failed to upload file");
            }
        } catch (exception){
            console.log(`Exception: ${exception}`);
            alert("Exception occured");
        }

  };

  return (
    <>
      <div className="upload-container">
        <div className="h1">Upload here</div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">
              Enter the EDI file here
            </label>
            <input className="form-control" type="file" id="formFile" onChange={handleFileChange} multiple={true}/>
          </div>
          <button type="submit" className="btn btn-danger">
            Submit
          </button>
        </form>
        <div className="mb-3">
          <label htmlFor="exampleFormControlTextarea1" className="form-label">
            New text area
          </label>
          <textarea
            className="form-control"
            id="exampleFormControlTextarea1"
            rows={3}
            value={textValue}
            
          />
        </div>
      </div>
    </>
  );
}

export default Upload;
