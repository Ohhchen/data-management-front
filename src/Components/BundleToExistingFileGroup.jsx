import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { dataContext } from './Main';
import { Accordion, AccordionButton, AccordionItem, AccordionPanel, Text, Button, List, ListItem } from '@chakra-ui/react';
import FieldGroup from './FieldGroup';
import { PROJECT, SUBPROJECT, FILEGROUP } from './EditFormData';

const BundleToExistingFileGroup = ({ newBundles, projectId, subProjectId, nextStep, returnToNewBundle, changedData }) => {
    const fieldsData = useContext(dataContext);
    const [fileGroups, setFileGroups] = useState();
    const [selectedFileGroupId, setSelectedFileGroupId] = useState()
    const [selectedBundles, setSelectedBundles] = useState([]);
    const [bundleFileGroupPairs, setBundleFileGroupPairs] = useState({});
    const [newFieldAssets, setNewFieldAssets] = useState()
    const [newBundleInfo, setNewBundleInfo] = useState();
    const encodedCredentials = useContext(AuthContext);
    const [projectData, setProjectData] = useState({})
    const [subProjectData, setSubprojectData] = useState({})

    const onNewBundleCreate = async () => {
        if (newBundles.length) {
            // console.log(newBundles)
            const processedData = newBundles.map(item => ({
                target_id: item.nid[0].value,
                target_type: 'node',
                target_uuid: item.uuid[0].value,
                url: `/node/${item.nid[0].value}`,
            }));
            // console.log(processedData)
            setNewFieldAssets(processedData)
            const processedInfo = newBundles.map(item => ({
                title: item.title[0].value,
                nid: item.nid[0].value,
                files: item.field_file_entity2,
            }));
            setNewBundleInfo(processedInfo)
        } else {
            console.log("did not get new bundle")
        }
    }

    useEffect(() => {
        // fetchFileGroups();
        fetchExistingFileGroups();
        onNewBundleCreate();
    }, [newBundles]);

    const fetchExistingFileGroups = async () => {
        try {
            const response = await axios.get(`https://cedar.arts.ubc.ca/filegroup?_format=json&workspace=${projectId}&collection=${subProjectId}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                }
            })
            // console.log(response.data)
            processExistingFileGroup(response.data)
        } catch (e) {
            console.log(e)
        }
    };

    const toggleBundleSelection = (bundleId) => {
        if (selectedBundles.includes(bundleId)) {
            setSelectedBundles(selectedBundles.filter(id => id !== bundleId))
        } else {
            setSelectedBundles([...selectedBundles, bundleId]);
        }
    };

    const processExistingFileGroup = (data) => {
        let tempResponses = []
        let changedResponses = []
        if (data.length) {
            for (let item of data) {
                let processedData = {}
                for (let fieldName in item) {
                    if (item[fieldName].length > 0) {
                        if (fieldName == "field_relation") {
                            processedData[fieldName] = item[fieldName][0].uri
                        } else if (fieldName == 'field_assets') {
                            processedData[fieldName] = item[fieldName]
                        } else if (fieldName == "field_languages_new_") {
                            processedData[fieldName] = item[fieldName][0].target_id
                        } else if (fieldName == "field_digital_content_format_new") {
                            processedData[fieldName] = item[fieldName][0].target_id
                        } else if (fieldName == "field_digital_content_type_new_") {
                            processedData[fieldName] = item[fieldName][0].target_id
                        } else if (fieldName == "field_rights") {
                            processedData[fieldName] = item[fieldName][0].target_id
                        } else if (fieldName == "field_contributor_s_") {
                            processedData[fieldName] = item[fieldName][0].target_id
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
            setFileGroups(tempResponses)
        } else {
            let processedData = {}
            for (let fieldName in data) {
                if (data[fieldName].length > 0) {
                    if (fieldName == "field_relation") {
                        processedData[fieldName] = data[fieldName][0].uri
                    } else if (fieldName == 'field_assets') {
                        processedData[fieldName] = data[fieldName]
                    } else if (fieldName == "field_languages_new_") {
                        processedData[fieldName] = data[fieldName][0].target_id
                    } else if (fieldName == "field_digital_content_format_new") {
                        processedData[fieldName] = data[fieldName][0].target_id
                    } else if (fieldName == "field_digital_content_type_new_") {
                        processedData[fieldName] = data[fieldName][0].target_id
                    } else if (fieldName == "field_rights") {
                        processedData[fieldName] = data[fieldName][0].target_id
                    } else if (fieldName == "field_contributor_s_") {
                        processedData[fieldName] = data[fieldName][0].target_id
                    } else {
                        processedData[fieldName] = data[fieldName][0].value
                    }
                } else {
                    processedData[fieldName] = ""
                }
            }
            console.log(processedData)
            changedResponses.push(processedData)
            let cleanedData = {
                project: projectData,
                subprojects: subProjectData,
                editedFileGroup: changedResponses
            }
            changedData(cleanedData)
        }
    }

    const pairFileGroupToBundles = (bundleId) => {
        let paired = bundleFileGroupPairs
        let bundles = bundleFileGroupPairs[selectedFileGroupId]
        const selectedGroup = fileGroups.find(group => group.nid == selectedFileGroupId);
        const bundleInfo = newFieldAssets.find(id => id.target_id == bundleId)
        if (bundles != null) {
            paired[selectedFileGroupId]["title"] = selectedGroup.title;
            if (paired[selectedFileGroupId]["bundleIds"].includes(bundleId)) {
                paired[selectedFileGroupId]["bundleIds"] = paired[selectedFileGroupId]["bundleIds"].filter(function (id) {
                    return id != bundleId
                });
                paired[selectedFileGroupId]["bundles"] = paired[selectedFileGroupId]["bundles"].filter(function (data) {
                    return data.target_id != bundleId
                });
            } else {
                paired[selectedFileGroupId]["title"] = selectedGroup.title
                paired[selectedFileGroupId]["bundleIds"].push(bundleId);
                paired[selectedFileGroupId]['bundles'].push(bundleInfo)
            }
        } else {
            paired[selectedFileGroupId] = {
                ["title"]: selectedGroup.title,
                ["bundleIds"]: [bundleId],
                ["bundles"]: [bundleInfo]
            }
        }
        // console.log(paired)
        setBundleFileGroupPairs(paired)
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
            }
        })
    }

    const attachBundleToFileGroup = async () => {
        // id = filegroup nid
        // bundleFileGroupPair[id] = object within filegroup nid
        for (let fgNid in bundleFileGroupPairs) {
            const existingBundles = fileGroups.find(function (item) {
                return item.nid == fgNid
            })
            if (existingBundles.field_assets) {
                for (let item of existingBundles.field_assets) {
                    bundleFileGroupPairs[fgNid].bundles.push(item);
                }
                try {
                    const response = await axios.patch(`https://cedar.arts.ubc.ca/node/${fgNid}?_format=json`, {
                        'type': [{
                            target_id: 'data_asset_group_heterogeneous_'
                        }],
                        'title': [{
                            value: bundleFileGroupPairs[fgNid].title
                        }],
                        'field_assets': bundleFileGroupPairs[fgNid].bundles
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: `Basic ${encodedCredentials.credentials}`,
                            'X-CSRF-Token': encodedCredentials.csrftoken,
                        }
                    });
                    // console.log(response.data)
                    processExistingFileGroup(response.data)
                } catch (error) {
                    console.log(error)
                }
            } else {
                try {
                    const response = await axios.patch(`https://cedar.arts.ubc.ca/node/${fgNid}?_format=json`, {
                        'type': [{
                            target_id: 'data_asset_group_heterogeneous_'
                        }],
                        'title': [{
                            value: bundleFileGroupPairs[fgNid].title
                        }],
                        'field_assets': bundleFileGroupPairs[fgNid].bundles
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: `Basic ${encodedCredentials.credentials}`,
                            'X-CSRF-Token': encodedCredentials.csrftoken,
                        }
                    });
                    // console.log(response.data)
                    processExistingFileGroup(response.data)
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
                        <Text fontSize='24px' color='#2B2927' fontWeight='700'>Here are the existing File Group(s) under the project you selected</Text>
                        <Accordion variant='uploadWizardBundle' allowToggle={true}>
                            {fileGroups ? fileGroups.map((group, index) => (
                                <AccordionItem key={index} value={group.title}>
                                    <AccordionButton onClick={(event) => {
                                        setSelectedFileGroupId(event.currentTarget.value);
                                    }} value={group.nid}>
                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', flex: '1 0 0' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                                <Text fontSize='24px' color='#2B2927' fontWeight='700'>{group.title}</Text>
                                            </div>
                                            <div>
                                                <Button variant="anchor">Show File Group Information</Button>
                                            </div>
                                        </div>
                                    </AccordionButton>
                                    <AccordionPanel>
                                        <FieldGroup type={FILEGROUP} id={group.nid} data={[group]}></FieldGroup>
                                    </AccordionPanel>
                                </AccordionItem>
                            )) : null}
                        </Accordion>
                    </div>
                    <div className='metadata-preview'>
                        {newBundleInfo ?
                            <div className='files-draggables-container'>
                                <div>
                                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>Bundles to be added to a File Group</Text>
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a File Group first, then add your Bundle(s) to the expanded File Group</Text>
                                </div>
                                {newBundleInfo.map((bundle, index) => (
                                    <div className='bundle-accordions-panel-files' key={index}>
                                        <input
                                            type="checkbox"
                                            disabled={selectedFileGroupId ? null : 'disabled'}
                                            checked={selectedBundles.includes(bundle.nid)}
                                            onChange={() => {
                                                toggleBundleSelection(bundle.nid);
                                                pairFileGroupToBundles(bundle.nid);
                                            }} />
                                        <Text>{bundle.title}</Text>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1', justifyContent: 'center' }}>
                                            {bundleFileGroupPairs ? Object.keys(bundleFileGroupPairs).map((fileGroups) => (
                                                bundleFileGroupPairs[fileGroups])).map((item) =>
                                                    item.bundleIds.includes(bundle.nid) ?
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
                        {selectedFileGroupId ?
                            <div className='bundle-accordions-panel'>
                                <Text fontSize='24px' color='#2B2927' fontWeight='700'>You are previewing associated files info</Text>
                                <div className='metadata-display'>
                                    <Text fontSize='h4' color='#2B2927' fontWeight='500'>Project information attached to this File Group</Text>
                                    {projectData ? <FieldGroup type={projectData.type} data={projectData.data} id={projectData.id}></FieldGroup> : null}
                                </div>
                                <div className='metadata-display'>
                                    <Text fontSize='h4' color='#2B2927' fontWeight='500'>Sub-Project information attached to this File Group</Text>
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
                            </div>
                            :
                            <div className='metadata-panel'>
                                <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a File Group to view associated files</Text>
                            </div>
                        }
                    </div>
                </div>
                <div className='button-wrapper'>
                    <div className='button-wrapper-stretch'>
                        <Button variant='reg' onClick={returnToNewBundle}>Back</Button>
                    </div>
                    <Button variant='secondary'
                        onClick={() => {
                            nextStep();
                            attachBundleToFileGroup();
                        }}>Submit Changes</Button>
                </div>
            </div>
        </div>
    );
};

export default BundleToExistingFileGroup;
