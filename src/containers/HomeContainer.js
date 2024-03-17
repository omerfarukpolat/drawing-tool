import {useCallback, useState} from "react";
import JSZip from "jszip";

import {Menu} from "antd";
import {Content} from "antd/es/layout/layout";
import {AppstoreOutlined, CompassOutlined, FlagOutlined, FormatPainterOutlined } from "@ant-design/icons";

import CanvasContainer from "./CanvasContainer";

import DragAndDrop from "../components/DragAndDrop";
import HeaderComponent from "../components/Header";

function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

const HomeContainer = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const [drawingToolCursor, setDrawingToolCursor] = useState('grab');
    const [selectedTool, setSelectedTool] = useState('')
    const [labeledAreas, setLabeledAreas] = useState([])
    const [selectedArea, setSelectedArea] = useState(null)

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
        getItem('Labeled Areas', 'labeledAreas', <FlagOutlined />, labeledAreas.map((area, index) => {
            return getItem(`Area ${index + 1}: ${area.value}`, area.key, <CompassOutlined />, null, 'area')
        })),
    ];

    const onClick = (e) => {
        if(e.keyPath.includes('drawingTools')) {
            switch (e.key) {
                case 'pen':
                case 'brush':
                    setSelectedArea(null)
                    setSelectedTool(e.key)
                    setDrawingToolCursor('crosshair')
                    break
                default:
                    setSelectedTool(e.key)
                    setDrawingToolCursor('grab')
                    break
            }
        }
        if (e.keyPath.includes('labeledAreas')) {
            const area = labeledAreas.find(area => area.key === e.key)
            setSelectedArea(area)
        }
    };

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


    return (
        <>
        <HeaderComponent
            isDeleteVisible={imageUrl !== null}
            onClickDelete={() => setImageUrl(null)} />
    <Content>
        <div className={'row'}>
            {
                imageUrl && (
                    <Menu
                        onClick={onClick}
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['drawingTools', 'labeledAreas']}
                        className={'menu'}
                        mode="inline"
                        items={items}
                    />
                )
            }
            {
                !imageUrl && (
                    <DragAndDrop onDrop={onDrop}/>
                )
            }
            {
                imageUrl && (
                        <CanvasContainer imageUrl={imageUrl}
                                            drawingToolCursor={drawingToolCursor}
                                            selectedTool={selectedTool}
                                            selectedArea={selectedArea}
                                            labeledAreas={labeledAreas}
                                            onAreaLabeled={(area) => setLabeledAreas([...labeledAreas, area])}
                                            onDeleteArea={(area) => {
                                                setLabeledAreas(labeledAreas.filter(a => a.key !== area.key))
                                                setSelectedArea(null)
                                            }}
                                            onEditArea={(newValue, area) => {
                                                setLabeledAreas(labeledAreas.map(a => {
                                                    if (a.key === area.key) {
                                                        a.value = newValue
                                                    }
                                                    return a
                                                }))
                                            }}
                        />
                )
            }
        </div>
    </Content>
            </>
    )
}



export default HomeContainer;
