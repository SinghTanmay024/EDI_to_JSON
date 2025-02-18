import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

function CodeEditor({
  jsonData,
  handleEditorDidMount,
  handleEditorValidation,
  setjson
}) {
  const [PreviewMode, setPreviewMode] = React.useState("json");
  const [dataToPreview, setdataToPreview] = React.useState(jsonData);
  function jsonToXml(json) {
    let xml = "";

    // Convert JSON to XML recursively
    function jsonToXmlRecursive(jsonObj) {
      for (let prop in jsonObj) {
        if (jsonObj.hasOwnProperty(prop)) {
          if (Array.isArray(jsonObj[prop])) {
            for (let item of jsonObj[prop]) {
              xml += `<${prop.replace(" ", "_")}>`;
              jsonToXmlRecursive(item);
              xml += `</${prop.replace(" ", "_")}>`;
            }
          } else if (typeof jsonObj[prop] === "object") {
            xml += `<${prop.replace(" ", "_")}>`;
            jsonToXmlRecursive(jsonObj[prop]);
            xml += `</${prop.replace(" ", "_")}>`;
          } else {
            xml += `<${prop.replace(" ", "_")}>${jsonObj[prop]}</${prop.replace(
              " ",
              "_"
            )}>`;
          }
        }
      }
    }

    jsonToXmlRecursive(JSON.parse(json));
    return xml;
  }

  function modeSwitchHandler(new_mode) {
    if (new_mode === "xml") {
      let xml_data = jsonToXml(jsonData);
      setdataToPreview(xml_data);
      setPreviewMode("xml");
    } else {
      setdataToPreview(jsonData);
      // setjson(JSON.parse(dataToPreview));
      setPreviewMode("json");
    }
  }

  return (
    <>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="inlineRadioOptions"
          id="inlineRadio1"
          defaultValue="option1"
          onChange={() => modeSwitchHandler("json")}
          defaultChecked="true"
        />
        <label className="form-check-label" htmlFor="inlineRadio1">
          JSON
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name="inlineRadioOptions"
          id="inlineRadio2"
          defaultValue="option2"
          onChange={() => modeSwitchHandler("xml")}
        />
        <label className="form-check-label" htmlFor="inlineRadio2">
          XML
        </label>
      </div>

      <Editor
        height="100vh"
        width="100%"
        theme="vs-light"
        onMount={handleEditorDidMount}
        language={PreviewMode}
        value={dataToPreview}
        onValidate={handleEditorValidation}
      />
    </>
  );
}

export default CodeEditor;
