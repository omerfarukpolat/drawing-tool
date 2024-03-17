import React from "react";

import {DeleteOutlined} from "@ant-design/icons/lib/icons";
import {Header} from "antd/es/layout/layout";


const HeaderComponent = ({ isDeleteVisible, onClickDelete }) => {
    return (
        <Header className={'header'}>
            <div className={'header-title'}>
                <p>Image Labeling Tool </p>
            </div>
            {
                isDeleteVisible &&
                <div className={'delete-icon-container'}>
                    <p>Delete Image: </p>
                    <div className={'delete-icon'}
                         onClick={onClickDelete}
                    >
                        <DeleteOutlined color={'white'} />
                    </div>
                </div>
            }
        </Header>
    );
}

export default HeaderComponent;
