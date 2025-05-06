import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadPage from './components/UploadPage';
import FilesPage from './components/FilesPage';

function App() {
  return (
   <Router>
     <nav>
        <Link to= "/">Upload</Link> | <Link to="/files">Files</Link>
     </nav>
     <Routes>
        <Route path="/" element={<UploadPage/> }/>
        <Route path="/files" element={<FilesPage/> }/>
     </Routes>
   </Router>
  );
}

export default App;