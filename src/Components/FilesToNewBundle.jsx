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
import { BUNDLE } from "./EditFormData";
import './styles/BundleToNewFileGroups.css'
import FieldGroup from "./FieldGroup";


function FilesToNewBundle({ currentStep, returnToNewFile, nextStep, newFiles, newBundles }) {
    const encodedCredentials = useContext(AuthContext)
    const [newFileInfo, setNewFileInfo] = useState()
    const [newBundle, setNewBundle] = useState([])
    const [bundleCreated, setBundleCreated] = useState(false)
    const [selectedBundleUuid, setSelectedBundleUuId] = useState()
    const [selectedFiles, setSelectedFiles] = useState([])
    const [fileBundlePair, setFileBundlePair] = useState({})
    const [createBdl, setCreateBdl] = useState(false)
    const [createFormCount, setCreateFormCount] = useState(0)
    const [titleValue, setTitleValue] = useState()

    const onNewFileCreate = async () => {
        if (newFiles) {
            const processedInfo = newFiles.map(item => ({
                filename: item.name,
            }));
            // console.log(processedInfo)
            setNewFileInfo(processedInfo)
        } else {
            console.log("did not get new files")
        }
    }

    useEffect(() => {
        onNewFileCreate();
    }, [newFiles])

    const createNewBundle = async () => {
        try {
            const response = await axios.post('https://cedar.arts.ubc.ca/node?_format=json', {
                'type': [{
                    target_id: 'data_asset_group_homogeneous_'
                }],
                'title': [{
                    value: titleValue
                }],
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
            newBundles(response.data);
            processNewBundle(response.data);
            setBundleCreated(true);
            setCreateFormCount(createFormCount + 1);
            setCreateBdl(false)
        } catch (error) {
            console.log(error)
        }
    }

    const processNewBundle = (data) => {
        // console.log(data)
        const processedData = {}
        for (let fieldName in data) {
            if (data[fieldName].length > 0) {
                switch (fieldName) {
                    case 'title':
                        processedData["title"] = data[fieldName][0].value
                        break;
                    case 'nid':
                        processedData['nid'] = data[fieldName][0].value
                    case 'uuid':
                        processedData['uuid'] = data[fieldName][0].value
                }
            }
        }
        // console.log(processedData)
        setNewBundle([...newBundle, processedData])
    }

    const toggleFileSelection = (fileName) => {
        if (selectedFiles.includes(fileName)) {
            setSelectedFiles(selectedFiles.filter(file => file !== fileName))
        } else {
            setSelectedFiles([...selectedFiles, fileName]);
        }
    };

    const pairFileToBundle = (filename) => {
        let paired = fileBundlePair
        let files = fileBundlePair[selectedBundleUuid]
        const selectedBundle = newBundle.find(group => group.uuid === selectedBundleUuid);
        if (files != null) {
            paired[selectedBundleUuid]["title"] = selectedBundle.title;
            if (paired[selectedBundleUuid]["fileNames"].includes(filename)) {
                paired[selectedBundleUuid]["fileNames"] = paired[selectedBundleUuid]["fileNames"].filter(function (name) {
                    return name != filename
                });
            } else {
                paired[selectedBundleUuid]["title"] = selectedBundle.title;
                paired[selectedBundleUuid]["fileNames"].push(filename)
            }
        } else {
            paired[selectedBundleUuid] = {
                ["title"]: selectedBundle.title,
                ["fileNames"]: [filename]
            }
        }
        console.log(paired)
        setFileBundlePair(paired);
    }

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

    const attachFileToBundle = async () => {
        try {
            for (let uuid in fileBundlePair) {
                for (const fileName of fileBundlePair[uuid].fileNames) {
                    const file = newFiles.find(f => f.name === fileName);
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
        }
    };

    return (
        <div className="container-column">
            <div className="container-row">
                <div className="create-form">
                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>1. Create a Bundle to add new File(s) to</Text>
                    {createFormCount >= 1 &&
                        <Button variant='secondary' onClick={() => { setCreateBdl(true); }}>Create new Bundle</Button>
                    }
                    {bundleCreated &&
                        <div>
                            <Text fontSize='24px' color='#2B2927' fontWeight='500'>New Bundles Created</Text>
                            <Accordion variant='uploadWizardBundle' allowToggle={true}>
                                {newBundle.map((group, index) =>
                                    <AccordionItem key={index}>
                                        <AccordionButton onClick={() => { setSelectedBundleUuId(group.uuid); }}>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', flex: '1 0 0' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                                                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>{group.title}</Text>
                                                </div>
                                                <div>
                                                    <Button variant="anchor">Show Bundle Information</Button>
                                                </div>
                                            </div>
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <FieldGroup type={BUNDLE} data={[group]} id={group.nid}></FieldGroup>
                                        </AccordionPanel>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </div>}
                    <div>
                        {createBdl || createFormCount == 0 ?
                            <div>
                                <CreateForm
                                    type={BUNDLE}
                                    title={setTitleValue}
                                    create={createNewBundle}>
                                </CreateForm>
                            </div>
                            : null}
                    </div>
                </div>
                <div className="created-bundles">
                    <div>
                        <Text fontSize='24px' color='#2B2927' fontWeight='700'>Files to be Added to a Bundle</Text>
                        <Text fontSize='16px' color='#716B66' fontWeight='400'>Expand a Bundle first, then add your Files to the expanded Bundle</Text>
                    </div>
                    {newFileInfo ? newFileInfo.map((file, index) =>
                        <div className='bundle-accordions-panel-files' key={index}>
                            <input
                                type="checkbox"
                                disabled={selectedBundleUuid ? null : 'disabled'}
                                checked={selectedFiles.includes(file.filename)}
                                onChange={() => {
                                    toggleFileSelection(file.filename);
                                    pairFileToBundle(file.filename)
                                }}
                            />
                            <Text>{file.filename}</Text>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '1', justifyContent: 'center' }}>
                                {Object.keys(fileBundlePair).map((uuid) => (
                                    fileBundlePair[uuid])).map((bundleName) =>
                                        bundleName.fileNames.includes(file.filename) ?
                                            <Text fontSize='13px' color='#716B66' fontWeight='400' key={bundleName}>Set to be included in <b>{bundleName.title}</b></Text>
                                            : null
                                    )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div >
            <div className='button-wrapper'>
                <div className='button-wrapper-stretch'>
                    <Button variant='reg' onClick={returnToNewFile}>Back</Button>
                </div>
                <Button variant='secondary'
                    onClick={() => {
                        nextStep();
                        attachFileToBundle();
                    }}>Submit Changes</Button>
            </div>
        </div >
    )
}

export default FilesToNewBundle;