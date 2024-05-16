import React, { useState, useContext, useEffect } from 'react';
import axios, { all } from 'axios';
import { Text, Input, List, ListItem, Button } from '@chakra-ui/react';
import { AuthContext } from './Login';
import './styles/Files.css'

const FilePreview = ({ selectedFileUri }) => {
    const encodedCredentials = useContext(AuthContext);
    const [imgSrc, setImgSrc] = useState()
    const [audioSrc, setAudioSrc] = useState()
    const [videoSrc, setVideoSrc] = useState()
    const [textSrc, setTextSrc] = useState()
    const [currentFileType, setCurrentFileType] = useState()
    const [renderEntity, setRenderEntity] = useState()
    const [currentUri, setCurrentUri] = useState()

    const fetchFileEntity = () => {
        if (selectedFileUri != undefined) {
            try {
                let uri = selectedFileUri.replace("amp;", "");
                // console.log(uri)
                fetch(`https://cedar.arts.ubc.ca${uri}`, {
                }).then((response) => {
                    console.log(response)
                    return response.blob()
                }
                ).then((blob) => {
                    console.log(blob.type)
                    const src = URL.createObjectURL(blob);
                    if (blob.type == 'image/png' || blob.type == 'image/jpeg' || blob.type == 'image/jpg') {
                        setImgSrc(src)
                        // setCurrentFileType(blob.type)
                        setCurrentUri(uri)
                        setRenderEntity(<img src={src}></img>)
                        // console.log(`rendering ${uri}`)
                    } else if (blob.type == 'video/mp4') {
                        setVideoSrc(src)
                        // setCurrentFileType(blob.type)
                        setCurrentUri(uri)
                        setRenderEntity(<video controls><source src={src}></source></video>)
                        // console.log(`rendering ${uri}`)
                    } else if (blob.type == 'audio/x-wav') {
                        setAudioSrc(src)
                        // setCurrentFileType(blob.type)
                        setCurrentUri(uri)
                        setRenderEntity(<audio src={src} controls></audio>)
                        // console.log(`rendering ${uri}`)
                    } else if (blob.type == 'text/html') {
                        setTextSrc(src)
                        // setCurrentFileType(blob.type)
                        setCurrentUri(uri)
                        setRenderEntity(<p>{src}</p>)
                        // console.log(`rendering ${uri}`)
                    }
                })
            } catch (e) {
                console.error(e.message);
            }
        }
    }

    useEffect(() => {
        fetchFileEntity()
    }, [selectedFileUri, currentUri])

    return <>
        {renderEntity}
    </>
};

export default FilePreview;