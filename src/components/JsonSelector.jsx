import React from "react";

function JsonSelector({ jsonData }) {
  const [selectedItems, setSelectedItems] = React.useState({});
  const [foldedItems, setFoldedItems] = React.useState(
    getInitialFoldedState(jsonData)
  );
  const [receivedJson, setreceivedJson] = React.useState("");
  const [loaderShow, setloaderShow] = React.useState(false);

  function getInitialFoldedState(jsonData) {
    const initialFoldedState = {};

    function traverse(obj, parentKey = "") {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        initialFoldedState[fullKey] = true;

        if (typeof value === "object") {
          traverse(value, fullKey);
        }
      }
    }

    traverse(jsonData);
    return initialFoldedState;
  }

  const handleCheckboxChange = (key, value) => {
    setSelectedItems((prevState) => {
      const updatedItems = { ...prevState };
      if (updatedItems[key] === undefined) {
        updatedItems[key] = value;
      } else {
        delete updatedItems[key];
      }
      return updatedItems;
    });
  };

  const handleFoldToggle = (key) => {
    setFoldedItems((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const renderJson = (json, parentKey = "") => {
    return Object.entries(json).map(([key, value]) => {
      if (key !== "payload") {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const isChecked = selectedItems[fullKey] !== undefined;
        const isFolded = foldedItems[fullKey] || false;

        return (
          <div className="card ps-2" key={fullKey}>
            <div>
              {typeof value === "object" && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleFoldToggle(fullKey)}
                >
                  {isFolded ? "+" : "-"}
                </button>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(fullKey, value)}
                />
                {typeof value === "object" ? key : `${key}: ${value}`}
              </label>
            </div>
            {!isFolded &&
              typeof value === "object" &&
              renderJson(value, fullKey)}
          </div>
        );
      }
    });
  };

  const handleSubmit = async () => {
    setloaderShow(true);
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Access-Control-Expose-Headers", "Content-Disposition");
    const response = await fetch("http://127.0.0.1:5000/jsonFilter", {
      headers: header,
      method: "POST",
      body: JSON.stringify(selectedItems),
    });
    try {
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        setloaderShow(false);

        // settextValue(JSON.stringify(data));
      } else {
        console.log(response.status);
        setloaderShow(false);
        alert("Failed to upload file");
      }
    } catch (exception) {
      console.log(`Exception: ${exception}`);
      setloaderShow(false);
      alert("Exception occured");
    }
  };
  return (
    <div>
      {loaderShow && (
        <div className="spinner-container">
          <div
            className="spinner-border text-primary loadingSpinner"
            role="status"
            style={{ width: "7rem", height: "7rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <div className="card  p-5" style={{ height: "60vh", overflow: "scroll" }}>
        <h2>JSON Viewer</h2>
        {renderJson(jsonData)}
      </div>
      {receivedJson.length > 0 && (
        <textarea name="receivedJSON" id="receivedJSON" cols="30" rows="10">
          {receivedJson}
        </textarea>
      )}
      <button className="btn btn-danger" onClick={handleSubmit}>
        Get JSON
      </button>
    </div>
  );
}

export default JsonSelector;
