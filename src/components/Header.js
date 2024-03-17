import React from "react";

import {DeleteOutlined} from "@ant-design/icons/lib/icons";
import {Header} from "antd/es/layout/layout";


const HeaderComponent = ({ onClickDelete }) => {
    return (
        <Header className={'header'}>
            <div className={'header-title'}>
                <p>Image Labeling Tool </p>
            </div>
            <div className={'delete-icon'}
                 onClick={onClickDelete}
            >
                <DeleteOutlined color={'white'} />
            </div>
        </Header>
    );
}

export default HeaderComponent;
