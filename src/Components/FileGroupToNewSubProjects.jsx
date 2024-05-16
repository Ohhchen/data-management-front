import { SUBPROJECT } from "./EditFormData"
import CreateForm from "./CreateForm"
import { useContext, useEffect, useState } from "react"
import axios from "axios"
import { AuthContext } from "./Login"
import { Button, Text, Accordion, AccordionButton, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import './styles/BundleToNewFileGroups.css'
import FieldGroup from "./FieldGroup"

const FileGroupToNewSubProjects = ({ projectId, newFileGroups, nextStep, returnToNewFileGroup, currentStep, setCurrentStep, newData }) => {
    const encodedCredentials = useContext(AuthContext)
    const [descriptionValue, setDescriptionValue] = useState()
    const [fundingValue, setFundingValue] = useState()
    const [agreementValue, setAgreementValue] = useState()
    const [titleValue, setTitleValue] = useState()
    const [statusValue, setStatusValue] = useState()
    const [dagValue, setDagvalue] = useState()
    const [newFileGroupInfo, setNewFileGroupInfo] = useState()
    const [selectedFileGroups, setSelectedFileGroups] = useState([])
    const [newSubProjects, setNewSubProjects] = useState([])
    const [selectedSpId, setSelectedSpId] = useState()
    const [subProjectCreated, setSubProjectCreated] = useState(false)
    const [selectedProjectInfo, setSelectedProjectInfo] = useState({})
    const [createFormCount, setCreateFormCount] = useState(0)
    const [createSp, setCreateSp] = useState(false)
    const [fileGroupSubProjectPair, setFileGroupSubProjectPair] = useState({})

    const onNewFileGroupsCreate = async () => {
        if (newFileGroups) {
            // console.log(newFileGroups)
            const processedData = newFileGroups.map(item => ({
                target_id: item.nid[0].value,
                target_type: 'node',
                target_uuid: item.uuid[0].value,
                url: `/node/${item.nid[0].value}`,
            }));
            // console.log(processedData)
            setDagvalue(processedData)
            const processedInfo = newFileGroups.map(item => ({
                title: item.title[0].value,
                nid: item.nid[0].value,
                // bundles: item.field_assets,
            }));
            setNewFileGroupInfo(processedInfo)
        } else {
            console.log("did not get new bundle")
        }
    }

    useEffect(() => {
        onNewFileGroupsCreate();
    }, [newFileGroups])

    const toggleFileGroupSelection = (fileGroupId) => {
        if (selectedFileGroups.includes(fileGroupId)) {
            setSelectedFileGroups(selectedFileGroups.filter(id => id !== fileGroupId))
        } else {
            setSelectedFileGroups([...selectedFileGroups, fileGroupId]);
        }
    };

    const pairFileGroupToSubProject = (fileGroupId) => {
        let paired = fileGroupSubProjectPair
        let fileGroups = fileGroupSubProjectPair[selectedSpId]
        const selectedGroup = newSubProjects.find(group => group.nid == selectedSpId);
        const fileGroupInfo = dagValue.find(id => id.target_id == fileGroupId)
        if (fileGroups != null) {
            paired[selectedSpId]["title"] = selectedGroup.title;
            if (paired[selectedSpId]["fileGroupIds"].includes(fileGroupId)) {
                paired[selectedSpId]["fileGroupIds"] = paired[selectedSpId]["fileGroupIds"].filter(function (id) {
                    return id != fileGroupId
                });
                paired[selectedSpId]["fileGroups"] = paired[selectedSpId]["fileGroups"].filter(function (data) {
                    return data.target_id != fileGroupId
                });
            } else {
                paired[selectedSpId]["title"] = selectedGroup.title
                paired[selectedSpId]["fileGroupIds"].push(fileGroupId);
                paired[selectedSpId]["fileGroups"].push(fileGroupInfo)
            }
        } else {
            paired[selectedSpId] = {
                ["title"]: selectedGroup.title,
                ["fileGroupIds"]: [fileGroupId],
                ["fileGroups"]: [fileGroupInfo]
            }
        }
        console.log(paired)
        setFileGroupSubProjectPair(paired);
    }

    const getProjectInfo = async () => {
        try {
            const response = await axios.get(`https://cedar.arts.ubc.ca/jsonapi/group_content/group_content_type_fa7136cd5e8e7`, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                    "Content-Type": 'application/vnd.api+json',
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            });
            // console.log(response.data.data)
            if (response.data.data) {
                let projectObject = selectedProjectInfo;
                let findSelectedProject = response.data.data.find(function (id) {
                    return id.relationships.gid.data.meta.drupal_internal__target_id == projectId
                })
                // console.log(findSelectedProject)
                projectObject["uuid"] = findSelectedProject.relationships.gid.data.id;
                projectObject["gid"] = projectId;
                setSelectedProjectInfo(projectObject)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getProjectInfo();
    }, [newSubProjects])

    const createSubProject = async () => {
        try {
            const response = await axios.post('https://cedar.arts.ubc.ca/node?_format=json', {
                'type': [{
                    target_id: 'collection'
                }],
                'title': [{
                    value: titleValue
                }],
                'field_description': [{
                    value: descriptionValue
                }],
                'field_funding': [{
                    value: fundingValue
                }],
                'field_agreement': [{
                    uri: agreementValue
                }],
                'field_status': [{
                    target_id: statusValue
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            });
            if (response.data) {
                // console.log(response.data);
                processNewSubProjects(response.data);
                setSubProjectCreated(true);
                setCreateFormCount(createFormCount + 1);
                setCreateSp(false)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const processNewSubProjects = (data) => {
        const processedData = {}
        let responses = []
        if (data.length) {
            for (let subproject of data) {
                let tempProcessedData = {}
                for (let fieldName of Object.keys(subproject)) {
                    if (subproject[fieldName].length) {
                        if (fieldName == 'field_status') {
                            tempProcessedData[fieldName] = subproject[fieldName][0].target_id
                        } else if (fieldName == "field_data_asset_group") {
                            tempProcessedData[fieldName] = subproject[fieldName]
                        } else if (fieldName == 'field_agreement') {
                            tempProcessedData[fieldName] = subproject[fieldName][0].uri
                        } else {
                            tempProcessedData[fieldName] = subproject[fieldName][0].value
                        }
                    } else {
                        tempProcessedData[fieldName] = ""
                    }
                }
                responses.push(tempProcessedData)
            }
            let cleanedData = {
                project: selectedProjectInfo,
                subprojects: responses
            }
            // console.log(responses)
            newData(cleanedData)
        } else {
            for (let fieldName in data) {
                if (data[fieldName].length > 0) {
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
            setNewSubProjects([...newSubProjects, processedData])
        }
        // console.log(processedData)
    }

    const attachFileGroupToSubproject = async () => {
        let responses = []
        for (let spNid in fileGroupSubProjectPair) {
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
                responses.push(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        processNewSubProjects(responses)
    }

    const attachSPToP = async () => {
        for (let subproject of newSubProjects) {
            try {
                const response = await axios.post(`https://cedar.arts.ubc.ca/jsonapi/group_content/group_content_type_fa7136cd5e8e7`, {
                    "data": {
                        "type": "group_content--group_content_type_fa7136cd5e8e7",
                        "attributes": {
                            "label": subproject.title,
                            // newly created sub-project title
                            "plugin_id": "group_node:collection",
                        },
                        "relationships": {
                            "gid": {
                                "data": {
                                    "id": selectedProjectInfo.uuid,
                                    // project/group uuid
                                    "meta": {
                                        "drupal_internal__target_id": selectedProjectInfo.gid
                                        // project/group gid
                                    },
                                    "type": "group--cedar_projects"
                                }
                            },
                            "entity_id": {
                                "data": {
                                    "id": subproject.uuid,
                                    // newly created sub-project uuid
                                    "meta": {
                                        "drupal_internal__target_id": subproject.nid
                                        // newly created sub-project nid
                                    },
                                    "type": "node--collection"
                                }
                            }
                        },
                    }
                }, {
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        "Content-Type": 'application/vnd.api+json',
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                });
                // console.log(response)
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div className="container-column">
            <div className="container-row">
                <div className="create-form">
                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>3. Create a Sub-Project to add new File Group(s) to</Text>
                    {createFormCount >= 1 &&
                        <Button variant='secondary' onClick={() => { setCreateSp(true); }}>Create new Sub-Project</Button>
                    }
                    {subProjectCreated &&
                        <div>
                            <Text fontSize='24px' color='#2B2927' fontWeight='500'>New Sub-Projects Created</Text>
                            <Accordion variant='uploadWizardBundle' allowToggle={true}>
                                {newSubProjects.map((group, index) =>
                                    <AccordionItem key={index}>
                                        <AccordionButton onClick={() => setSelectedSpId(group.nid)}>
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
                                            <FieldGroup type={SUBPROJECT} data={[group]} id={group.nid}></FieldGroup>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>}
                    <div>
                        {createSp || createFormCount == 0 ?
                            <div>
                                <CreateForm
                                    type={SUBPROJECT}
                                    description={setDescriptionValue}
                                    funding={setFundingValue}
                                    agreement={setAgreementValue}
                                    title={setTitleValue}
                                    status={setStatusValue}
                                    create={createSubProject}>
                                </CreateForm>
                            </div>
                            : null}
                    </div>
                </div>
                <div className="created-bundles">
                    <div>
                        <Text fontSize='24px' color='#2B2927' fontWeight='700'>File Groups to be added to a Sub-Project</Text>
                        <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a Sub-Project first, then add your File Groups to the expanded Sub-Project</Text>
                    </div>
                    {newFileGroupInfo ? newFileGroupInfo.map((fg, index) =>
                        <div className='bundle-accordions-panel-files' key={index}>
                            <input
                                type="checkbox"
                                disabled={selectedSpId ? null : 'disabled'}
                                checked={selectedFileGroups.includes(fg.nid)}
                                onChange={() => {
                                    toggleFileGroupSelection(fg.nid);
                                    pairFileGroupToSubProject(fg.nid)
                                }}
                            />
                            <Text>{fg.title}</Text>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1', justifyContent: 'center' }}>
                                {Object.keys(fileGroupSubProjectPair).map((title) => (
                                    fileGroupSubProjectPair[title])).map((name) =>
                                        name.fileGroupIds.includes(fg.nid) ?
                                            <Text fontSize='13px' color='#716B66' fontWeight='400' key={name}>Set to be included in <b>{name.title}</b></Text>
                                            : null
                                    )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className='button-wrapper'>
                <div className='button-wrapper-stretch'>
                    <Button variant='reg' onClick={returnToNewFileGroup}>Back</Button>
                </div>
                <Button variant='secondary'
                    onClick={() => {
                        nextStep();
                        attachFileGroupToSubproject();
                        attachSPToP();
                    }}>Submit Changes</Button>
            </div>
        </div>
    )
}

export default FileGroupToNewSubProjects