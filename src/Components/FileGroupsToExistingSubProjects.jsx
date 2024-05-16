import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { dataContext } from './Main';
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Text, Button, List, ListItem } from '@chakra-ui/react';
import FieldGroup from './FieldGroup';
import { PROJECT, SUBPROJECT } from './EditFormData';

const FileGroupsToExistingSubProjects = ({ projectId, newFileGroups, nextStep, returnToNewFileGroup, changedData }) => {
    const encodedCredentials = useContext(AuthContext)
    const fieldsData = useContext(dataContext);
    const [newFieldDag, setNewFieldDag] = useState()
    const [newFileGroupInfo, setNewFileGroupInfo] = useState()
    const [subProjects, setSubProjects] = useState()
    const [selectedSubProjectId, setSelectedSubProjectId] = useState()
    const [selectedFileGroups, setSelectedFileGroups] = useState([])
    const [fileGroupSubProjectPair, setFileGroupSubProjectPair] = useState({})
    const [projectData, setProjectData] = useState({})


    const onNewFileGroupsCreate = async () => {
        if (newFileGroups.length) {
            // console.log(newFileGroups)
            const processedData = newFileGroups.map(item => ({
                target_id: item.nid[0].value,
                target_type: 'node',
                target_uuid: item.uuid[0].value,
                url: `/node/${item.nid[0].value}`,
            }));
            // console.log(processedData)
            setNewFieldDag(processedData)
            const processedInfo = newFileGroups.map(item => ({
                title: item.title[0].value,
                nid: item.nid[0].value,
            }));
            setNewFileGroupInfo(processedInfo)
        } else {
            console.log("did not get new bundle")
        }
    }

    useEffect(() => {
        onNewFileGroupsCreate();
        fetchExistingSubProjects();
    }, [newFileGroups])

    const fetchExistingSubProjects = async () => {
        try {
            const response = await axios.get(`https://cedar.arts.ubc.ca/collections?_format=json&workspace=${projectId}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                }
            })
            console.log(response.data)
            processExistingSubProjects(response.data)
        } catch (e) {
            console.log(e)
        }
    };

    const toggleFileGroupSelection = (fileGroupId) => {
        if (selectedFileGroups.includes(fileGroupId)) {
            setSelectedFileGroups(selectedFileGroups.filter(id => id !== fileGroupId))
        } else {
            setSelectedFileGroups([...selectedFileGroups, fileGroupId]);
        }
    };

    const processExistingSubProjects = (data) => {
        // console.log(data)
        let tempResponses = []
        let changedResponses = []
        if (data.length) {
            for (let item of data) {
                let processedData = {}
                for (let fieldName in item) {
                    if (item[fieldName].length) {
                        if (fieldName == 'field_status') {
                            processedData[fieldName] = item[fieldName][0].target_id
                        } else if (fieldName == "field_data_asset_group") {
                            processedData[fieldName] = item[fieldName]
                        } else if (fieldName == 'field_agreement') {
                            processedData[fieldName] = item[fieldName][0].uri
                        } else {
                            processedData[fieldName] = item[fieldName][0].value
                        }
                    } else {
                        processedData[fieldName] = ""
                    }
                }
                // console.log(processedData)
                tempResponses.push(processedData)
            }
            console.log(tempResponses)
            setSubProjects(tempResponses)
        } else {
            let processedData = {}
            for (let fieldName in data) {
                if (data[fieldName].length) {
                    if (fieldName == 'field_status') {
                        processedData[fieldName] = data[fieldName][0].target_id
                    } else if (fieldName == "field_data_asset_group") {
                        processedData[fieldName] = data[fieldName]
                    } else if (fieldName == 'field_agreement') {
                        processedData[fieldName] = data[fieldName][0].uri
                    } else {
                        processedData[fieldName] = data[fieldName][0].value
                    }
                } else {
                    processedData[fieldName] = ""
                }
            }
            changedResponses.push(processedData)
            console.log(changedResponses)
            let cleanedData = {
                project: projectId,
                editedSubProject: changedResponses,
            }
            changedData(cleanedData)
        }
    }

    const pairSubProjectToFileGroups = (fileGroupId) => {
        let paired = fileGroupSubProjectPair
        let fileGroups = fileGroupSubProjectPair[selectedSubProjectId]
        const selectedGroup = subProjects.find(group => group.nid == selectedSubProjectId);
        const fileGroupInfo = newFieldDag.find(id => id.target_id == fileGroupId)
        if (fileGroups != null) {
            paired[selectedSubProjectId]["title"] = selectedGroup.title;
            if (paired[selectedSubProjectId]["fileGroupIds"].includes(fileGroupId)) {
                paired[selectedSubProjectId]["fileGroupIds"] = paired[selectedSubProjectId]["fileGroupIds"].filter(function (id) {
                    return id != fileGroupId
                });
                paired[selectedSubProjectId]["fileGroups"] = paired[selectedSubProjectId]["fileGroups"].filter(function (data) {
                    return data.target_id != fileGroupId
                });
            } else {
                paired[selectedSubProjectId]["title"] = selectedGroup.title
                paired[selectedSubProjectId]["fileGroupIds"].push(fileGroupId);
                paired[selectedSubProjectId]['fileGroups'].push(fileGroupInfo)
            }
        } else {
            paired[selectedSubProjectId] = {
                ["title"]: selectedGroup.title,
                ["fileGroupIds"]: [fileGroupId],
                ["fileGroups"]: [fileGroupInfo]
            }
        }
        // console.log(paired)
        setFileGroupSubProjectPair(paired)
    }

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
            }
        })
    }

    const attachFileGroupToSubproject = async () => {
        // id = filegroup nid
        // bundleFileGroupPair[id] = object within filegroup nid
        for (let spNid in fileGroupSubProjectPair) {
            const existingFileGroups = subProjects.find(function (item) {
                return item.nid == spNid
            })
            if (existingFileGroups.field_data_asset_group.length) {
                // add existing file groups to new file groups array, if there are any
                for (let item of existingFileGroups.field_data_asset_group) {
                    fileGroupSubProjectPair[spNid].fileGroups.push(item)
                }
                try {
                    const response = await axios.patch(`https://cedar.arts.ubc.ca/node/${spNid}?_format=json`, {
                        'type': [{
                            target_id: 'collection'
                        }],
                        'title': [{
                            value: fileGroupSubProjectPair[spNid].title
                        }],
                        'field_data_asset_group': fileGroupSubProjectPair[spNid].fileGroups
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: `Basic ${encodedCredentials.credentials}`,
                            'X-CSRF-Token': encodedCredentials.csrftoken,
                        }
                    });
                    // console.log(response.data)
                    processExistingSubProjects(response.data)
                } catch (error) {
                    console.log(error)
                }
            } else {
                try {
                    const response = await axios.patch(`https://cedar.arts.ubc.ca/node/${spNid}?_format=json`, {
                        'type': [{
                            target_id: 'collection'
                        }],
                        'title': [{
                            value: fileGroupSubProjectPair[spNid].title
                        }],
                        'field_data_asset_group': fileGroupSubProjectPair[spNid].fileGroups
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: `Basic ${encodedCredentials.credentials}`,
                            'X-CSRF-Token': encodedCredentials.csrftoken,
                        }
                    });
                    // console.log(response.data)
                    processExistingSubProjects(response.data)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }


    return (
        <div>
            <div className='step1-container'>
                <div className='step2-container'>
                    <div className='bundle-accordions'>
                        <Text fontSize='24px' color='#2B2927' fontWeight='700'>Here are the existing Sub-Project(s) under the project you selected</Text>
                        <Accordion variant='uploadWizardBundle' allowToggle={true}>
                            {subProjects ? subProjects.map((group, index) => (
                                <AccordionItem key={index} value={group.title}>
                                    <AccordionButton onClick={(event) => {
                                        setSelectedSubProjectId(event.currentTarget.value);
                                    }} value={group.nid}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', flex: '1 0 0' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                                <Text fontSize='24px' color='#2B2927' fontWeight='700'>{group.title}</Text>
                                            </div>
                                            <div>
                                                <Button variant="anchor">Show Sub-Project Information</Button>
                                            </div>
                                        </div>
                                    </AccordionButton>
                                    <AccordionPanel>
                                        <FieldGroup type={SUBPROJECT} id={group.nid} data={[group]}></FieldGroup>
                                    </AccordionPanel>
                                </AccordionItem>
                            )) : null}
                        </Accordion>
                    </div>
                    <div className='metadata-preview'>
                        {newFileGroupInfo ?
                            <div className='files-draggables-container'>
                                <div>
                                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>File Groups to be added to a Sub-Project</Text>
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a Sub-Project first, then add your File Group(s) to the expanded Sub-Project</Text>
                                </div>
                                {newFileGroupInfo.map((group, index) => (
                                    <div className='bundle-accordions-panel-files' key={index}>
                                        <input
                                            type="checkbox"
                                            disabled={selectedSubProjectId ? null : 'disabled'}
                                            checked={selectedFileGroups.includes(group.nid)}
                                            onChange={() => {
                                                toggleFileGroupSelection(group.nid);
                                                pairSubProjectToFileGroups(group.nid);
                                            }} />
                                        <Text>{group.title}</Text>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1', justifyContent: 'center' }}>
                                            {fileGroupSubProjectPair ? Object.keys(fileGroupSubProjectPair).map((subProjects) => (
                                                fileGroupSubProjectPair[subProjects])).map((item) =>
                                                    item.fileGroupIds.includes(group.nid) ?
                                                        <Text fontSize='13px' color='#716B66' fontWeight='400' key={item.nid}>Set to be included in <b>{item.title}</b></Text>
                                                        : null
                                                ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            :
                            <div className='metadata-panel'>
                                <Text fontSize='16px' color='#716B66' fontWeight='400'>No Bundles have been created</Text>
                                <Text fontSize='16px' color='#716B66' fontWeight='400'>Click "Back" to upload</Text>
                            </div>
                        }
                        {selectedSubProjectId ?
                            <div className='bundle-accordions-panel'>
                                <Text fontSize='24px' color='#2B2927' fontWeight='700'>You are previewing associated files info</Text>
                                <div className='metadata-display'>
                                    <Text fontSize='h4' color='#2B2927' fontWeight='500'>Project information attached to this File Group</Text>
                                    {projectData ? <FieldGroup type={projectData.type} data={projectData.data} id={projectData.id}></FieldGroup> : null}
                                </div>
                            </div>
                            :
                            <div className='metadata-panel'>
                                <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a Sub-Project to view associated files</Text>
                            </div>
                        }
                    </div>
                </div>
                <div className='button-wrapper'>
                    <div className='button-wrapper-stretch'>
                        <Button variant='reg' onClick={returnToNewFileGroup}>Back</Button>
                    </div>
                    <Button variant='secondary' onClick={() => {
                        nextStep();
                        attachFileGroupToSubproject();
                    }}>Submit Changes</Button>
                </div>
            </div>
        </div>
    );
}

export default FileGroupsToExistingSubProjects