import React from 'react';
import clipboard from "../images/clipboard.jpg";

function JsonPathContainer({ elementJsonPath }) {
  const handleCopyPath = () => {
    navigator.clipboard.writeText(elementJsonPath);
  };

  return (
    <div className="JsonPathContainer">
      <input
        type="text"
        value={elementJsonPath}
        readOnly={true}
        className="JsonPath"
      />
      <button onClick={handleCopyPath} className="ClipboardButton">
        <img src={clipboard} alt="Copy JSON Path" className="ClipboardIcon" />
      </button>
    </div>
  );

}

export default JsonPathContainer;
