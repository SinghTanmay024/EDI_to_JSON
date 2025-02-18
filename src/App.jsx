
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Root from "./components/Root";
import NewUpload from "./components/NewUpload";
import "bootstrap/dist/css/bootstrap.min.css";
import EDIinfoExtractor from './components/EDIinfoExtractor';
import JsonViewer from "./components/JsonViewer";
import EDIDownloader from './components/EDIDownloader';
import MapperPage from './components/MapperPage'
import NewUploadEdi from "./components/NewUploadEdi";

function App() {
  const [intermediateJSON, setintermediateJSON] = React.useState("");

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Root />}>
        {/* <Route path="" element={<NewUpload intermediateJSON={intermediateJSON} setintermediateJSON={setintermediateJSON}/>} />
        <Route path="generateJSON" element={<JsonViewer intermediate={intermediateJSON} setintermediateJSON={setintermediateJSON}/>} />
        <Route path="generateFile" element={<EDIinfoExtractor intermediate={intermediateJSON} setintermediateJSON={setintermediateJSON}/>} />
        <Route path="generateEDI" element={<EDIDownloader />} />
        <Route path="mapperPage" element={<MapperPage jsonData = {intermediateJSON}/>} />
      </Route> */}
      <Route path="" element={<NewUploadEdi   intermediateJSON={intermediateJSON} setintermediateJSON={setintermediateJSON}/>} />
      </Route>
    </Routes>
    </BrowserRouter>
  );
}

export default App;