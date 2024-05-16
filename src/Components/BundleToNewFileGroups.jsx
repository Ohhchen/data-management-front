import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./Login";
import axios from 'axios';
import {
    Input,
    Text,
    Button,
    Accordion,
    AccordionButton,
    AccordionPanel,
    AccordionItem,
} from '@chakra-ui/react';
import CreateForm from "./CreateForm";
import { FILEGROUP } from "./EditFormData";
import './styles/BundleToNewFileGroups.css'
import FieldGroup from "./FieldGroup";


function BundleToNewFileGroups({ currentStep, returnToNewBundle, nextStep, newBundles, newFileGroups }) {
    const encodedCredentials = useContext(AuthContext)
    const [newBundleInfo, setNewBundleInfo] = useState()
    const [newFieldAssets, setNewFieldAssets] = useState()
    const [newFileGroup, setNewFileGroup] = useState([])
    const [fileGroupCreated, setFileGroupCreated] = useState(false)
    const [selectedGroupId, setSelectedGroupId] = useState()
    const [selectedBundles, setSelectedBundles] = useState([])
    const [bundleFileGroupPair, setBundleFileGroupPair] = useState({})
    const [createFg, setCreateFg] = useState(false)
    const [createFormCount, setCreateFormCount] = useState(0)
    const [descriptionValue, setDescriptionValue] = useState()
    const [titleValue, setTitleValue] = useState()
    const [sourceValue, setSourceValue] = useState()
    const [relationValue, setRelationValue] = useState()
    const [subjectsValue, setSubjectsValue] = useState()
    const [subjectsGeoValue, setSubjectsGeoValue] = useState()
    const [dateTime, setDateTime] = useState()
    const [typeValue, setTypeValue] = useState()
    const [langValue, setLangValue] = useState()
    const [formatValue, setFormatValue] = useState()
    const [rightsValue, setRightsValue] = useState()

    const onNewBundleCreate = async () => {
        const result = await newBundles;
        if (result) {
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
        onNewBundleCreate();
    }, [newBundles])

    const createNewFileGroup = async () => {
        // console.log(`title: ${titleValue}`);
        // console.log(`description: ${descriptionValue}`);
        // console.log(`relation: ${relationValue}`)
        // console.log(`source: ${sourceValue}`)
        // console.log(`subjects: ${subjectsValue}`)
        // console.log(`subjectsGeo: ${subjectsGeoValue}`)
        // console.log(`date: ${dateTime}`)
        // console.log(`format: ${formatValue}`)
        // console.log(`type: ${typeValue}`)
        // console.log(`lang: ${langValue}`)
        // console.log(`rights: ${rightsValue}`)
        try {
            const response = await axios.post('https://cedar.arts.ubc.ca/node?_format=json', {
                'type': [{
                    target_id: 'data_asset_group_heterogeneous_'
                }],
                'title': [{
                    value: titleValue
                }],
                'field_description': [{
                    value: descriptionValue
                }],
                'field_relation': [{
                    uri: relationValue
                }],
                'field_source': [{
                    value: sourceValue
                }],
                'field_subjects': [{
                    value: subjectsValue
                }],
                'field_subjects_geographic': [{
                    value: subjectsGeoValue
                }],
                "field_date": [{
                    value: dateTime
                }],
                'field_digital_content_format_new': [{
                    target_id: formatValue
                }],
                'field_digital_content_type_new_': [{
                    target_id: typeValue
                }],
                'field_languages_new_': [{
                    target_id: langValue
                }],
                // 'field_contributor_s_': contributorResult,
                'field_rights': [
                    rightsValue
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            });
            // console.log(response.data)
            // console.log(`created file group ${response.data.nid[0].value}`)
            newFileGroups(response.data);
            processNewFileGroup(response.data);
            setFileGroupCreated(true);
            setCreateFormCount(createFormCount + 1);
            setCreateFg(false)
        } catch (error) {
            console.log(error)
        }
    }

    const processNewFileGroup = (data) => {
        // console.log(data)
        const processedData = {}
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
        // console.log(processedData)
        setNewFileGroup([...newFileGroup, processedData])
    }

    const toggleBundleSelection = (bundleId) => {
        if (selectedBundles.includes(bundleId)) {
            setSelectedBundles(selectedBundles.filter(bundle => bundle !== bundleId))
        } else {
            setSelectedBundles([...selectedBundles, bundleId]);
        }
    };

    const pairBundleToFileGroup = (bundleId) => {
        let paired = bundleFileGroupPair
        let bundles = bundleFileGroupPair[selectedGroupId]
        const selectedGroup = newFileGroup.find(group => group.nid === selectedGroupId);
        const bundleInfo = newFieldAssets.find(id => id.target_id == bundleId)
        if (bundles != null) {
            paired[selectedGroupId]["title"] = selectedGroup.title;
            if (paired[selectedGroupId]["bundleIds"].includes(bundleId)) {
                paired[selectedGroupId]["bundleIds"] = paired[selectedGroupId]["bundleIds"].filter(function (id) {
                    return id != bundleId
                });
                paired[selectedGroupId]["bundles"] = paired[selectedGroupId]["bundles"].filter(function (data) {
                    return data.target_id != bundleId
                });
            } else {
                paired[selectedGroupId]["title"] = selectedGroup.title
                paired[selectedGroupId]["bundleIds"].push(bundleId);
                paired[selectedGroupId]['bundles'].push(bundleInfo)
            }
        } else {
            paired[selectedGroupId] = {
                ["title"]: selectedGroup.title,
                ["bundleIds"]: [bundleId],
                ["bundles"]: [bundleInfo]
            }
        }
        // console.log(paired)
        setBundleFileGroupPair(paired);
    }

    const attachBundleToFileGroup = async () => {
        // id = filegroup nid
        // bundleFileGroupPair[id] = object within filegroup nid
        for (let fgNid in bundleFileGroupPair) {
            try {
                const response = await axios.patch(`https://cedar.arts.ubc.ca/node/${fgNid}?_format=json`, {
                    'type': [{
                        target_id: 'data_asset_group_heterogeneous_'
                    }],
                    'title': [{
                        value: bundleFileGroupPair[fgNid].title
                    }],
                    'field_assets': bundleFileGroupPair[fgNid].bundles
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                });
                console.log(response.data)
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div className="container-column">
            <div className="container-row">
                <div className="create-form">
                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>2. Create a File Group to add new Bundle(s) to</Text>
                    {createFormCount >= 1 &&
                        <Button variant='secondary' onClick={() => { setCreateFg(true); }}>Create new File Group</Button>
                    }
                    {fileGroupCreated &&
                        <div>
                            <Text fontSize='24px' color='#2B2927' fontWeight='500'>New File Groups Created</Text>
                            <Accordion variant='uploadWizardBundle' allowToggle={true}>
                                {newFileGroup.map((group, index) =>
                                    <AccordionItem key={index}>
                                        <AccordionButton onClick={() => setSelectedGroupId(group.nid)}>
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
                                            <FieldGroup type={FILEGROUP} data={[group]} id={group.nid}></FieldGroup>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>}
                    <div>
                        {createFg || createFormCount == 0 ?
                            <div>
                                <CreateForm
                                    type={FILEGROUP}
                                    title={setTitleValue}
                                    description={setDescriptionValue}
                                    source={setSourceValue}
                                    relation={setRelationValue}
                                    subjects={setSubjectsValue}
                                    subjectsGeo={setSubjectsGeoValue}
                                    dateValue={setDateTime}
                                    digitalType={setTypeValue}
                                    lang={setLangValue}
                                    format={setFormatValue}
                                    newRights={setRightsValue}
                                    create={createNewFileGroup}>
                                </CreateForm>
                            </div>
                            : null}
                    </div>
                </div>
                <div className="created-bundles">
                    <div>
                        <Text fontSize='24px' color='#2B2927' fontWeight='700'>Bundles to be added to a File Group</Text>
                        <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a File Group first, then add your Bundles to the expanded File Group</Text>
                    </div>
                    {newBundleInfo ? newBundleInfo.map((bundle, index) =>
                        <div className='bundle-accordions-panel-files' key={index}>
                            <input
                                type="checkbox"
                                disabled={selectedGroupId ? null : 'disabled'}
                                checked={selectedBundles.includes(bundle.nid)}
                                onChange={() => {
                                    toggleBundleSelection(bundle.nid);
                                    pairBundleToFileGroup(bundle.nid)
                                }}
                            />
                            <Text>{bundle.title}</Text>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1', justifyContent: 'center' }}>
                                {Object.keys(bundleFileGroupPair).map((title) => (
                                    bundleFileGroupPair[title])).map((name) =>
                                        name.bundleIds.includes(bundle.nid) ?
                                            <Text fontSize='13px' color='#716B66' fontWeight='400' key={name}>Set to be included in <b>{name.title}</b></Text>
                                            : null
                                    )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div >
            <div className='button-wrapper'>
                <div className='button-wrapper-stretch'>
                    <Button variant='reg' onClick={returnToNewBundle}>Back</Button>
                </div>
                <Button variant='secondary'
                    onClick={() => {
                        nextStep(); 
                        attachBundleToFileGroup()
                    }}>Submit Changes</Button>
            </div>
        </div >
    )
}

export default BundleToNewFileGroups;