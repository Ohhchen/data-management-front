import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Buffer } from 'buffer';
import axios from 'axios';
import { AuthContext } from './Login';
import './styles/FileWizard.css'
import {
    Input,
    Text,
    Button,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    List,
    ListItem,
} from '@chakra-ui/react'
import headphonesBlack from '../images/headphonesBlack.svg'
import imageBlack from '../images/imageBlack.svg'
import videoBlack from '../images/videoBlack.svg'
import { dataContext } from './Main';
import { EditFormData, PROJECT, SUBPROJECT, FILEGROUP } from './EditFormData';
import FieldGroup from './FieldGroup';

function FilesToExistingBundle({ projectId, uploadedFiles, currentStep, changedData, nextStep, returnToNewFile }) {
    const fieldsData = useContext(dataContext)
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [updateMessage, setUpdateMessage] = useState(null);
    const [dataGroups, setDataGroups] = useState([]);
    const [selectedGroupUuid, setSelectedGroupUuid] = useState();
    const [bundleFilePair, setBundleFilePair] = useState({})
    const encodedCredentials = useContext(AuthContext);
    const [projectData, setProjectData] = useState({})
    const [subProjectData, setSubprojectData] = useState({})
    const [fileGroupData, setFileGroupData] = useState({})
    const [step, setStep] = useState(currentStep)

    useEffect(() => {
        if (currentStep == 2) {
            fetchTitles();
        }
    }, [currentStep]);

    useEffect(() => {
        mapFields();
    }, [dataContext]);

    function mapFields() {
        Object.keys(fieldsData).map((content) => {
            switch (content) {
                case "projects":
                    let projectObject = projectData
                    for (let info in fieldsData[content]) {
                        projectObject["id"] = fieldsData[content][info].id[0].value;
                        projectObject["type"] = PROJECT;
                        projectObject["data"] = [fieldsData[content][info]];
                        projectObject["title"] = fieldsData[content][info].label[0].value;
                    }
                    setProjectData(projectObject)
                    break;
                case "subProjects":
                    let subProjectObject = subProjectData
                    for (let info in fieldsData[content]) {
                        subProjectObject["id"] = fieldsData[content][info].nid;
                        subProjectObject["type"] = SUBPROJECT;
                        subProjectObject["data"] = [fieldsData[content][info]];
                        subProjectObject["title"] = fieldsData[content][info].title
                    }
                    setSubprojectData(subProjectObject)
                    break;
                case "fileGroups":
                    let fileGroupObject = fileGroupData
                    for (let info in fieldsData[content]) {
                        fileGroupObject["id"] = fieldsData[content][info].nid_1;
                        fileGroupObject["type"] = FILEGROUP;
                        fileGroupObject["data"] = [fieldsData[content][info]];
                        fileGroupObject["title"] = fieldsData[content][info].title;
                    }
                    setFileGroupData(fileGroupObject)
                    break;
            }
        })
    }

    const toggleFileSelection = (fileName) => {
        if (selectedFiles.includes(fileName)) {
            setSelectedFiles(selectedFiles.filter(file => file !== fileName))
        } else {
            setSelectedFiles([...selectedFiles, fileName]);
        }
    };

    const pairBundleToFiles = (file) => {
        let paired = bundleFilePair // {}
        let files = bundleFilePair[selectedGroupUuid] // { bundleuuid: { file info }}
        const selectedGroup = dataGroups.find(group => group.uuid === selectedGroupUuid);
        if (files != null) {
            paired[selectedGroupUuid]["title"] = selectedGroup.title;
            if (paired[selectedGroupUuid]["filesToAdd"].includes(file)) {
                paired[selectedGroupUuid]["filesToAdd"] = paired[selectedGroupUuid]["filesToAdd"].filter(function (name) {
                    return name !== file
                })
            } else {
                paired[selectedGroupUuid]["filesToAdd"].push(file);
            }
            // paired[selectedGroupUuid].push(file)
        } else {
            paired[selectedGroupUuid] = {
                ["title"]: selectedGroup.title,
                ["filesToAdd"]: [file],
            }
            // paired[selectedGroupUuid] = [file]
        }
        // console.log(paired)
        setBundleFilePair(paired);
    }

    const fetchTitles = async () => {
        try {
            const response = await axios.get(
                `https://cedar.arts.ubc.ca/bundles/?_format=json&workspace=${projectId}`,
                {
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                    }
                }
            );
            // console.log(response.data)
            if (response.data.length) {
                const processedData = response.data.filter(item =>
                    item.type[0].target_id === "data_asset_group_homogeneous_"
                ).map(item => ({
                    title: item.title[0].value,
                    nid: item.nid[0].value,
                    uuid: item.uuid[0].value,
                    field_file_entity: item.field_file_entity2
                }));
                // setDataGroups(processedData);
                fetchFileEntityName(processedData)
                // console.log(response)
            }
        } catch (error) {
            console.error("Error fetching the data", error);
            setUpdateMessage(`Error fetching the data. Details: ${error.message}`);
        }
    };

    const fetchFileEntityName = async (bundleData) => {
        // gets the filenames of all the files currently attached to the bundles
        let filenames = []
        let filesInBundle = []
        if (bundleData.length <= 1) {
            // if there is only one bundle found within the file group
            for (let file of bundleData[0].field_file_entity) {
                if (file.target_uuid == undefined) continue;
                try {
                    const response = await axios.get(
                        `https://cedar.arts.ubc.ca/jsonapi/file/file/${file.target_uuid}`,
                        {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                            }
                        }
                    );
                    filenames.push(response.data.data.attributes.filename)
                } catch (error) {
                    console.log(error)
                }
            }
            bundleData[0].file_name = filenames
            setDataGroups(bundleData)
        } else {
            // if there is more than one bundle found within the file group
            bundleData.forEach((bundle) => {
                // mapping out each file uuid to a bundle so that it could be regrouped
                // console.log(bundle.field_file_entity)
                bundle.field_file_entity.forEach((file) => {
                    if (file.target_uuid != undefined) {
                        let filesObject = {}
                        filesObject.bundleTitle = bundle.title
                        filesObject.fileId = file.target_uuid
                        filesInBundle.push(filesObject)
                    }
                })
            })
            for (let fileId of filesInBundle) {
                // fetch for the filename of the current fileId
                if (fileId.fileId == undefined) continue;
                try {
                    const response = await axios.get(
                        `https://cedar.arts.ubc.ca/jsonapi/file/file/${fileId.fileId}`,
                        {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                            }
                        })
                    // console.log(response.data.data.attributes.filename)
                    fileId.name = response.data.data.attributes.filename
                } catch (error) {
                    console.log(error)
                }
            }

            for (let group in bundleData) {
                let array = []
                filesInBundle.map((file) => {
                    if (file.bundleTitle == bundleData[group].title) {
                        array.push(file.name)
                    }
                    bundleData[group].file_name = array
                })
            }
            setDataGroups(bundleData)
        }
    };

    async function readDataIntoBuffer(file) {
        let result = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function () {
                resolve(reader.result);
            }
            reader.onerror = (err) => {
                reject(err)
            }
            reader.readAsArrayBuffer(file)
        })
        return result;
    }

    const handleSubmit = async () => {
        try {
            for (let uuid in bundleFilePair) {
                // bundleFilePair = uuid : {
                //      title: titleOfBundle,
                //      filesToAdd: [file, file, ... ]
                // }
                // uuid = uuid of the bundle
                // bundleFilePair[uuid] = an object that contains the title of bundle and filenames of files
                // bundleFilePair[uuid].title = title of the bundle
                // bundleFilePair[uuid].filesToAdd = array of files to add
                for (const fileName of bundleFilePair[uuid].filesToAdd) {
                    const file = uploadedFiles.find(f => f.name === fileName);
                    // Read the file as a binary string
                    const fileBuffer = await readDataIntoBuffer(file)
                    // Update the URL to include the UUID of the selected bundle
                    const drupalUploadUrl = `https://cedar.arts.ubc.ca/jsonapi/node/data_asset_group_homogeneous_/${uuid}/field_file_entity2`;
                    try {
                        const drupalResponse = await axios.post(drupalUploadUrl, fileBuffer, {
                            headers: {
                                'Authorization': `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                                'Content-Type': 'application/octet-stream',
                                'Content-Disposition': `file; filename="${file.name}"`,
                                'Accept': 'application/vnd.api+json'
                            }
                        });
                        if (drupalResponse.data && drupalResponse.data.data) {
                            console.log(`Uploaded File Details:`, drupalResponse.data.data);
                            let cleanedData = {
                                project: projectData,
                                subproject: subProjectData,
                                filegroup: fileGroupData,
                                bundleId: uuid,
                                editedBundle: drupalResponse.data.data
                            }
                            changedData(cleanedData);
                        } else {
                            console.log(`File uploaded but no details received for file: ${file.name}`);
                        }
                    } catch (uploadError) {
                        console.error("Error uploading the file to Drupal", uploadError);
                    }
                }
            }
        } catch (error) {
            console.error("Error in handleSubmit", error);
            setUpdateMessage(`Error in handleSubmit. Details: ${error.message}`);
        }
    };

    return (
        <div>
            {updateMessage && <p>{updateMessage}</p>}

            {currentStep == 2 && step !== 3 ?
                <div className='step1-container'>
                    <div className='step2-container'>
                        <div className='bundle-accordions'>
                            {/* <h3>Step 2: Select Files to Send & Choose a Title</h3> */}
                            <Text fontSize='24px' color='#2B2927' fontWeight='700'>Here are the existing bundle under the project you selected</Text>
                            <Accordion variant='uploadWizardBundle' allowToggle={true}>
                                {dataGroups.length ? dataGroups.map((group, index) => (
                                    <AccordionItem key={index} value={group.title}>
                                        <AccordionButton onClick={(event) => {
                                            setSelectedGroupUuid(event.currentTarget.value);
                                        }} value={group.uuid}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', flex: '1 0 0' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>{group.title}</Text>
                                                    {group.file_name ?
                                                        <Text fontSize='16px' color='#716B66' fontWeight='400'>{group.file_name.length} media files</Text>
                                                        :
                                                        <Text fontSize='16px' color='#716B66' fontWeight='400'>No media files</Text>
                                                    }
                                                </div>
                                                <div>
                                                    <Button variant="anchor">Show Bundle Information</Button>
                                                </div>
                                            </div>
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <div className='bundle-accordions-panel'>
                                                <Text fontSize='20px' color='#2B2927' fontWeight='500'>Files</Text>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                                    {group.file_name ? group.file_name.map((item, index) => (
                                                        <div className='bundle-accordions-panel-files' key={index}>
                                                            {item.slice(-3) == 'png' || item.slice(-3) == 'jpg' || item.slice(-4) == 'jpeg' ? <img src={imageBlack}></img> : null}
                                                            {item.slice(-3) == 'wav' ? <img src={headphonesBlack}></img> : null}
                                                            {item.slice(-3) == 'mp4' ? <img src={videoBlack}></img> : null}
                                                            <Text>{item}</Text>
                                                        </div>
                                                    ))
                                                        :
                                                        <Text fontSize='16px' color='#716B66' fontWeight='400'>No files yet</Text>}
                                                </div>
                                            </div>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )) :
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>There are no bundles in the selected file groups yet</Text>
                                }
                            </Accordion>
                        </div>
                        <div className='metadata-preview'>
                            {uploadedFiles.length > 0 ?
                                <div className='files-draggables-container'>
                                    <div>
                                        <Text fontSize='24px' color='#2B2927' fontWeight='700'>Files to be added to a Bundle</Text>
                                        <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a Bundle first, then add your files to the expanded Bundle</Text>
                                    </div>
                                    {uploadedFiles.map((file, index) => (
                                        <div className='bundle-accordions-panel-files' key={index}>
                                            <input
                                                type="checkbox"
                                                disabled={selectedGroupUuid ? null : 'disabled'}
                                                checked={selectedFiles.includes(file.name)}
                                                onChange={() => {
                                                    toggleFileSelection(file.name);
                                                    pairBundleToFiles(file.name);
                                                }} />
                                            {file.name.slice(-3) == 'png' || file.name.slice(-3) == 'jpg' || file.name.slice(-4) == 'jpeg' ? <img src={imageBlack}></img> : null}
                                            {file.name.slice(-3) == 'wav' ? <img src={headphonesBlack}></img> : null}
                                            {file.name.slice(-3) == 'mp4' ? <img src={videoBlack}></img> : null}
                                            <Text>{file.name}</Text>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1', justifyContent: 'center' }}>
                                                {Object.keys(bundleFilePair).map((title) => (
                                                    bundleFilePair[title])).map((name) =>
                                                        name.filesToAdd.includes(file.name) ?
                                                            <Text fontSize='13px' color='#716B66' fontWeight='400' key={name}>Set to be included in <b>{name.title}</b></Text>
                                                            : null
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                :
                                <div className='metadata-panel'>
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>No files have been uploaded</Text>
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>Click "Back" to upload</Text>
                                </div>
                            }
                            {selectedGroupUuid ?
                                <div className='bundle-accordions-panel'>
                                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>You are previewing associated files info</Text>
                                    <div className='metadata-display'>
                                        <Text fontSize='h4' color='#2B2927' fontWeight='500'>Project information attached to this Bundle</Text>
                                        {projectData ? <FieldGroup type={projectData.type} data={projectData.data} id={projectData.id}></FieldGroup> : null}
                                    </div>
                                    <div className='metadata-display'>
                                        <Text fontSize='h4' color='#2B2927' fontWeight='500'>Sub-Project information attached to this Bundle</Text>
                                        <List variant='metadata'>
                                            <ListItem>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>Title</Text>
                                                </div>
                                                <Text fontSize='pReg'>{subProjectData ? subProjectData.title : null}</Text>
                                            </ListItem>
                                        </List>
                                        {subProjectData ? <FieldGroup type={subProjectData.type} data={subProjectData.data} id={subProjectData.id}></FieldGroup> : null}
                                    </div>
                                    <div className='metadata-display'>
                                        <Text fontSize='h4' color='#2B2927' fontWeight='500'>File Group information attached to this Bundle</Text>
                                        <List variant='metadata'>
                                            <ListItem>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>Title</Text>
                                                </div>
                                                <Text fontSize='pReg'>{fileGroupData ? fileGroupData.title : null}</Text>
                                            </ListItem>
                                        </List>
                                        {fileGroupData ? <FieldGroup type={fileGroupData.type} data={fileGroupData.data} id={fileGroupData.id}></FieldGroup> : null}
                                    </div>
                                </div>
                                :
                                <div className='metadata-panel'>
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a Bundle to view associated files</Text>
                                </div>
                            }
                        </div>
                    </div>
                    <div className='button-wrapper'>
                        <div className='button-wrapper-stretch'>
                            <Button variant='reg' onClick={returnToNewFile}>Back</Button>
                        </div>
                        <Button variant='secondary' onClick={() => { nextStep(); handleSubmit(); }}>Submit Changes</Button>
                    </div>
                </div>
                : null}
        </div>
    );
}

export default FilesToExistingBundle;