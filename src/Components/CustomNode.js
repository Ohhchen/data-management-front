import { Handle, Position, ReactFlowProvider, Node } from 'reactflow';
import { useContext, useState, useEffect } from 'react'
import React, { memo } from 'react';
import { dataContext } from './Main';
import { AuthContext } from './Login';
import axios from 'axios';
import { List, ListItem } from '@chakra-ui/react';

const CustomNode = ({ data, isConnectable }) => {
    const importedData = useContext(dataContext);
    const encodedCredentials = useContext(AuthContext);

    const [bundleInfo, setBundleInfo] = useState([]);
    const [currentFilesArray, setCurrentFilesArray] = useState([]);

    const fetchFilesInBundle = async () => {
        try {
            const response = await axios.get(
                `https://cedar.arts.ubc.ca/filesByFilter2?_format=json&workspace=${data.selection.projectId}&bundle=${data.bundle ? data.bundle : 'all'}`, {
                // `https://cedar.arts.ubc.ca/filesByFilter?_format=json&workspace=${data.selection.projectId}&bundle=${data.bundle ? data.bundle : 'all'}`, {
                headers: {
                    Authorization: `Bearer-Token ${encodedCredentials}`,
                }
            }
            );
            setBundleInfo(response.data);
            // console.log(data.selection);
            // console.log(response.data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const updateCustomNode = () => {
        // console.log(data.currentBundle);
        if (data.currentBundle != null && data.currentBundle.length > 0) {
            // console.log(data.currentBundle);
            // console.log(bundleInfo);
            for (let index = 0; index < bundleInfo.length; index++) {
                if (data.currentBundle[0].nid == bundleInfo[index].nid_2) {
                    setCurrentFilesArray(currentFilesArray => [...currentFilesArray, bundleInfo[index]]);
                    // console.log(currentFilesArray);
                    // console.log(currentBundle.length);
                }
            }
        }
    }

    useEffect(() => {
        fetchFilesInBundle();
    }, [data.selection, importedData])

    useEffect(() => {
        setCurrentFilesArray([]);
        updateCustomNode();
    }, [data.selection, bundleInfo])

    return (<>
        {bundleInfo.length <= 0 ? null :
            <ReactFlowProvider>
                <div className='custom-node-container'>
                    <Handle
                        position={Position.Left}
                        style={{ background: '#869463' }}
                        type='target'
                        isConnectable={isConnectable}
                        id={data.currentBundle[0].nid}
                    />
                    {data.currentBundle ? data.currentBundle.map((index) => (
                        <h3 key={index.nid}>{index.title}</h3>
                    )) : null}
                    <ul className='node-list'>
                        {currentFilesArray ? currentFilesArray.map((index) => (
                            <li className={ data.selection.fid == index.fid ? 'active-node-list-item': 'node-list-item'} key={index.fid}>{index.filename}</li>
                        )) : null}
                    </ul>
                </div>
            </ReactFlowProvider>
        }
    </>)
}

export default CustomNode;