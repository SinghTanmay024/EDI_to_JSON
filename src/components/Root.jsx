import React from "react";
import logo from "../images/logo.png";
// import simplifyEDIlogo from "../images/logo.png";

import "../css/Root.modules.css";
// import JsonViewer from "./JsonViewer";
import { Link, Outlet } from "react-router-dom";

function Root() {
  const [selectedStyling, setselectedStyling] = React.useState(['link-buttons', 'link-buttons', 'link-buttons', 'link-buttons'])

  function partSelectionHandler(linkNumber){
    const newstyling = ["link-buttons", "link-buttons", "link-buttons", "link-buttons"];
    newstyling[linkNumber] = "selected-buttons";
    setselectedStyling(newstyling);
  }

  return (
    <>
      <nav className="navigationWrapper">
        <div className="logoWrapper">
        <Link to="/" className="link">
          <img src = {logo} alt="Logo" className="logo" onClick={()=>setselectedStyling(['link-buttons', 'link-buttons', 'link-buttons', 'link-buttons'])}/>
          </Link>
        </div>
        {/* <div className="navbarLinks">
          
          <Link to="/generateFile" className="generateJsonLink"><button className={selectedStyling[0]} onClick={() =>partSelectionHandler(0)}>Generate file</button></Link>
          
          <Link to="generateJSON" className="generateJsonLink" style={{marginLeft: "20px"}}><button className={selectedStyling[1]} onClick={() =>partSelectionHandler(1)}>Generate JSON</button></Link>
          <Link to="/generateEDI" className="generateJsonLink" style={{marginLeft: "20px"}}><button className={selectedStyling[2]} onClick={() =>partSelectionHandler(2)}>Generate EDI</button></Link>
          <Link to="/mapperPage" className="generateJsonLink" style={{marginLeft: "20px"}}><button className={selectedStyling[3]} onClick={() =>partSelectionHandler(3)}>MapperPage</button></Link>
        </div> */}
      </nav>
      <Outlet />
    </>
  );
}

export default Root;
