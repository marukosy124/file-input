import React, { useState } from 'react';
import './App.css';
import FileInput from './component/FileInput';

function App() {
  const [uploadFiles, setUploadFiles] = useState([]);

  return (
    <div className="App">
      <FileInput
        values={uploadFiles}
        onChange={(images) => setUploadFiles([...uploadFiles, ...images])}
        onClear={() => setUploadFiles([])}
        onRemove={(index) =>
          setUploadFiles([...uploadFiles.filter((_, i) => i != index)])
        }
      />
    </div>
  );
}

export default App;
