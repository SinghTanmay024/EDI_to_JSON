import React from "react";
import "../css/JsonExpander.css";

function JsonExpander({ jsonData }) {
  const [expandedNodes, setExpandedNodes] = React.useState({});

  const toggleExpanded = (key) => {
    setExpandedNodes({
      ...expandedNodes,
      [key]: !expandedNodes[key],
    });
  };

  const renderData = (data, parentKey = "") => {
    if (typeof data === "object" && data !== null) {
      return (
        <ul className="list-group">
          {Object.entries(data).map(([key, value]) => (key!== 'payload' && key !== 'elements')&&(
            <li className="list-group-item" key={parentKey + key}>
              {typeof value === "object" && value !== null ? (
                // Check if the value is an object and not null
                <React.Fragment>
                  <button
                    className="btn btn-danger"
                    onClick={() => toggleExpanded(parentKey + key)}
                  >
                    {expandedNodes[parentKey + key] ? "-" : "+"}
                  </button>
                  <strong>{key}:</strong>
                  {expandedNodes[parentKey + key] &&
                    renderData(value, parentKey + key)}
                </React.Fragment>
              ) : (
                // Render the key and value directly without a toggle button
                <React.Fragment>
                  <strong>{key}:</strong>
                  <span>{JSON.stringify(value)}</span>
                </React.Fragment>
              )}
            </li>
          ))}
        </ul>
      );
    } else {
      return <span>{JSON.stringify(data)}</span>;
    }
  };

  return <div className="json-expander">{renderData(jsonData)}</div>;
}

export default JsonExpander;
