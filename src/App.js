import {FormatPainterOutlined, InboxOutlined} from '@ant-design/icons';
import {Layout, Menu, theme} from 'antd';
import './App.css';
import { Content, Header } from "antd/es/layout/layout";
import {useCallback, useState} from "react";
import JSZip from "jszip";
import {useDropzone} from "react-dropzone";
import { AppstoreOutlined } from '@ant-design/icons';
import {DeleteOutlined} from "@ant-design/icons/lib/icons";
import DrawingTool from "./DrawingTool";

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const App = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [drawingToolCursor, setDrawingToolCursor] = useState('grab');
  const [selectedTool, setSelectedTool] = useState('')

  const items = [
    getItem('Drawing Tools', 'drawingTools', <FormatPainterOutlined />, [
      getItem('Pen tool', 'pen', null),
      getItem('Brush tool', 'brush', null),
    ]),
    {
      type: 'divider',
    },
    getItem('File Operations', 'file', <AppstoreOutlined />, [
      getItem('Save File', 'save'),
    ]),
  ];


  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];

      // Check if the dropped file is a zip file
      if (droppedFile.type === 'application/zip') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const zipData = event.target.result;

          // Create a new JSZip instance and load the zip file
          const zip = new JSZip();
          const zipFile = await zip.loadAsync(zipData);

          // Extract the first PNG file from the zip file
          const pngFile = Object.values(zipFile.files).find(
              (entry) => entry.name.toLowerCase().endsWith('.png')
          );

          if (pngFile) {
            // Read the contents of the PNG file
            const pngData = await pngFile.async('base64');

            // Display the PNG image
            setImageUrl(`data:image/png;base64,${pngData}`);
          } else {
            console.error('No PNG file found in the zip archive.');
          }
        };

        reader.readAsArrayBuffer(droppedFile);
      } else {
        alert('Please drop a zip file.');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.zip',
  });

  const onClick = (e) => {
    switch (e.key) {
      case 'pen':
      case 'brush':
        setSelectedTool(e.key)
        setDrawingToolCursor('crosshair')
        break
      default:
        setSelectedTool(e.key)
        setDrawingToolCursor('grab')
        break
    }
  };

  return (
      <Layout className={'layout'}>
        <Header className={'header'}>
          <div className={'header-title'}>
            <p>Image Labeling Tool </p>
          </div>
          <div className={'delete-icon'}
              onClick={() => setImageUrl(null)}
          >
            <DeleteOutlined color={'white'} />
          </div>
        </Header>
        <Content>
          <div className={'row'}>
          {
            imageUrl && (
                  <Menu
                      onClick={onClick}
                      defaultSelectedKeys={['1']}
                      defaultOpenKeys={['drawingTools']}
                      className={'menu'}
                      mode="inline"
                      items={items}
                  />
              )
          }
          {
            !imageUrl && (
                  <div {...getRootProps()} style={dropzoneStyle}>
                    <p className={'drag-area-icon'}>
                      <InboxOutlined />
                    </p>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className={'drag-area-text'}>Drop the zip file here...</p>
                    ) : (
                        <>
                          <p className={'drag-area-desc'}>Click or drag file to this area to upload</p>
                          <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                            banned files.
                          </p>
                        </>
                    )}
                  </div>
              )
          }
          {
            imageUrl && (
              <>
                {
                  /*
                   <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                  <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '90vh'}}  />

                </div>
                   */
                }
                <div style={{
                  cursor: drawingToolCursor,
                }}>
                    <DrawingTool imageUrl={imageUrl} selectedTool={selectedTool}/>
                </div>
              </>
          )
          }
          </div>
        </Content>
      </Layout>
  );
}

const dropzoneStyle = {
  border: '2px dashed #ccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  alignSelf: 'center',
  justifySelf: 'center',
  margin: 'auto',

};


export default App;
