import React from "react";
import DrawingTool from "../components/DrawingTool";

const CanvasContainer = ({
                             drawingToolCursor,
                             imageUrl,
                             selectedTool,
                             onAreaLabeled,
                             selectedArea,
                             labeledAreas,
                             onDeleteArea,
                             onEditArea}) => {

    return (
        <div style={{
            cursor: drawingToolCursor,
        }}>
            <DrawingTool imageUrl={imageUrl} selectedTool={selectedTool}
                         onAreaLabeled={onAreaLabeled}
                         selectedArea={selectedArea}
                         labeledAreas={labeledAreas}
                         onDeleteArea={onDeleteArea}
                         onEditArea={onEditArea}
            />
        </div>
    )
}

export default CanvasContainer;
