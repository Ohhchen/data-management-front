import React, { useState, useContext, useEffect, createContext } from 'react';
import axios, { all } from 'axios';
import { AuthContext } from './Login';
import { Text, Input, List, ListItem, Button } from '@chakra-ui/react';
import './styles/Files.css'
import DeleteDialog from './DeleteDialog';
import headphonesBlack from '../images/headphonesBlack.svg'
import headphonesGreen from '../images/headphonesGreen.svg'
import imageBlack from '../images/imageBlack.svg'
import imageGreen from '../images/imageGreen.svg'
import videoBlack from '../images/videoBlack.svg'
import videoGreen from '../images/videoGreen.svg'


const Files = ({ projectId, subProjectId, fileGroupId, selectFile, bundle, currentBundle, selectedUri }) => {
    const encodedCredentials = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState();
    const [selectedFileName, setSelectedFileName] = useState();
    const [img, setImg] = useState([]);
    const [permission, setPermission] = useState('')
    const [deletion, setDeletion] = useState(false)

    const fetchFiles = async () => {
        try {
            await axios.get(
                `https://cedar.arts.ubc.ca/filesByFilter2?_format=json&workspace=${projectId}&collection=${subProjectId ? subProjectId : "all"}&dag=${fileGroupId ? fileGroupId : "all"}`, {
                // `https://cedar.arts.ubc.ca/filesByFilter?_format=json&workspace=${projectId}&collection=${subProjectId ? subProjectId : "all"}&dag=${fileGroupId ? fileGroupId : "all"}`, {
                withCredentials: true,
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }
            }
            ).then((response) => {
                setFiles(response.data);
                console.log(response.data)
            })
        } catch (e) {
            console.log(e.message);
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [projectId, subProjectId, fileGroupId])

    const fetchBundle = async () => {
        // this request fetches for the bundle information along with all file entities within the bundle from a selected file entity aka selection.fid
        try {
            await axios.get(
                // `https://cedar.arts.ubc.ca/bundleByFile/?_format=json&fid=${selectedFiles}`, {
                `https://cedar.arts.ubc.ca/bundleByFile2/?_format=json&fid=${selectedFiles}`, {
                withCredentials: true,
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }
            }
            ).then((response) => {
                bundle(response.data[0].nid);
                console.log(response.data);
                currentBundle(response.data);
            })
        } catch (e) {
            console.log(e.message);
        }
    }

    const checkPermissions = () => {
        if (encodedCredentials.role == 'Administrator' || encodedCredentials.role == 'Content editor') {
            setPermission('Delete')
        } else {
            setPermission('Request Delete')
        }
    }

    useEffect(() => {
        renderFiles()
    }, [selectedFiles])

    function renderFiles() {
        fetchFiles();
        fetchBundle();
        checkPermissions();
    }

    return (
        <>{deletion ? <DeleteDialog selectedFiles={selectedFiles} disableDeleteMode={() => { setDeletion(false); renderFiles() }} contentTitle={selectedFileName}></DeleteDialog> :
            <div className='file-items-container'>
                <div className='file-items-title'>
                    <div className='h4-stretcher'>
                        <Text fontSize='h4'>Files in your selection</Text>
                    </div>
                    <Input variant='search' placeholder='Search for a file...'></Input>
                </div>
                <div className='file-items-list'>
                    <List variant='custom'>
                        {files ? files.map((file) => {
                            let isImage = undefined
                            let isAudio = undefined
                            let isVideo = undefined
                            if (file.filename.slice(-3) == 'png' || file.filename.slice(-3) == 'jpg' || file.filename.slice(-4) == 'jpeg') {
                                isImage = true
                            } else if (file.filename.slice(-3) == 'wav' || file.filename.slice(-3) == 'mp3') {
                                isAudio = true
                            } else if (file.filename.slice(-3) == 'mp4' || file.filename.slice(-3) == 'mov') {
                                isVideo = true
                            }
                            return <ListItem
                                className={(file.fid == selectedFiles ? 'active-item' : '')}
                                onClick={() => {
                                    console.log(file);
                                    selectFile(file.fid);
                                    setSelectedFiles(file.fid);
                                    setSelectedFileName(file.filename)
                                    selectedUri(file.uri);
                                }}
                                key={file.fid}>
                                <div className='label-container'>
                                    {isImage == true && file.fid == selectedFiles ? <img src={imageGreen}></img> : isAudio == true || isVideo == true ? null : <img src={imageBlack}></img>}
                                    {isVideo == true && file.fid == selectedFiles ? <img src={videoGreen}></img> : isAudio == true || isImage == true ? null : <img src={videoBlack}></img>}
                                    {isAudio == true && file.fid == selectedFiles ? <img src={headphonesGreen}></img> : isVideo == true || isImage == true ? null : <img src={headphonesBlack}></img>}
                                    {file.filename}
                                </div>
                                {file.fid == selectedFiles ? <Button variant='anchor' onClick={() => setDeletion(true)}>{permission}</Button> : null}
                            </ListItem>
                        }) : null}
                    </List>
                </div>
            </div>
        }</>
    );
};

export default Files;