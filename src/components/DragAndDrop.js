import {useDropzone} from "react-dropzone";
import {InboxOutlined} from "@ant-design/icons";


const DragAndDrop = ({onDrop}) => {

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.zip',
    });

    return (
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

export default DragAndDrop;
