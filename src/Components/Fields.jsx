import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import EditForm from './EditForm';
import { EditFormData, PROJECT, PROJECTDEV, SUBPROJECT, SUBPROJECTDEV, FILEGROUP, FILEGROUPDEV, FILE } from './EditFormData';
import FieldGroup from './FieldGroup';
import './styles/Fields.css';
import {
    Button,
    Text,
    List,
    ListItem,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel
} from '@chakra-ui/react';
import DeleteDialog from './DeleteDialog';

const Fields = ({ selection, editMode, projects, subProjects, fileGroups, bundle, files }) => {
    const encodedCredentials = useContext(AuthContext);
    const [permission, setPermission] = useState('')

    const [projectData, setProjectData] = useState([]);
    const [subprojectData, setSubprojectData] = useState([]);
    const [filegroupData, setFilegroupData] = useState([]);
    const [fileData, setFileData] = useState([]);

    const [expandProject, setExpandProject] = useState(true);
    const [expandSubproject, setExpandSubproject] = useState(true);
    const [expandFilegroup, setExpandFilegroup] = useState(true);
    const [expandFile, setExpandFile] = useState(true);

    const [devInfo, setDevInfo] = useState(false);

    const [dataDef, setDataDef] = useState(EditFormData);

    const [projectEdit, setProjectEdit] = useState(false);
    const [subProjectEdit, setSubProjectEdit] = useState(false);
    const [fileGroupEdit, setFileGroupEdit] = useState(false);
    const [fileEdit, setFileEdit] = useState(false);

    const [projectDelete, setProjectDelete] = useState(false);
    const [subProjectDelete, setSubProjectDelete] = useState(false);
    const [fileGroupDelete, setFileGroupDelete] = useState(false);

    const fetchProjectInfo = async () => {
        //fetching project metadata
        try {
            const response = await axios.get(
                `https://cedar.arts.ubc.ca/projectFields?_format=json&workspace=${selection.projectId}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                }
            }
            );
            setProjectData(response.data);
            projects(response.data);
            console.log(response.data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const fetchSubprojectInfo = async () => {
        //fetching subproject metadata
        try {
            const response = await axios.get(
                `https://cedar.arts.ubc.ca/subProjectFields?_format=json&workspace=${selection.projectId}&collection=${selection.subProjectId}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                }
            }
            );
            setSubprojectData(response.data);
            subProjects(response.data);
            console.log(response.data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const fetchFilegroupInfo = async () => {
        //fetching file group metadata
        try {
            const response = await axios.get(
                `https://cedar.arts.ubc.ca/fileGroupFields?_format=json&workspace=${selection.projectId}&collection=${selection.subProjectId}&dag=${selection.fileGroupId}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                }
            }
            );
            setFilegroupData(response.data);
            fileGroups(response.data);
            console.log(response.data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const fetchFileInfo = async () => {
        //fetching file/file entity metadata
        try {
            const response = await axios.get(
                // `https://cedar.arts.ubc.ca/fileFields?_format=json&workspace=${selection.projectId}&collection=${selection.subProjectId}&dag=${selection.fileGroupid}&file=${selection.fid}`, {
                `https://cedar.arts.ubc.ca/fileFields2?_format=json&workspace=${selection.projectId}&collection=${selection.subProjectId}&dag=${selection.fileGroupid}&file=${selection.fid}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    //'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            }
            );
            setFileData(response.data);
            files(response.data);
            console.log(response.data);
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
        fetchFields();
    }, [selection])

    function fetchFields() {
        fetchProjectInfo();
        fetchSubprojectInfo();
        fetchFilegroupInfo();
        fetchFileInfo();
        checkPermissions();
    }

    return (
        <div className='accordion-list-container'>
            {projectData.length > 0 &&
                <Accordion variant='custom' allowMultiple>
                    <AccordionItem
                        key={projectData[0].id[0].value}
                        className={projectEdit || projectDelete ? '' : (!expandProject ? 'expanded-item' : '')}>
                        <AccordionButton onClick={() => {
                            console.log("del" + projectDelete)
                            console.log("edit" + projectEdit)
                            console.log("button:" + expandProject)
                            if (!(projectEdit || projectDelete)) {
                                setExpandProject(!expandProject);
                            }
                            console.log("button:" + expandProject)
                        }}>
                            <div className='h4-stretcher'>
                                <Text fontSize='h4'>Project Information Attached to this File</Text>
                            </div>
                            {expandProject ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                        </AccordionButton>
                        <>{projectEdit ? <EditForm type={PROJECT} data={projectData} id={selection.projectId} disableEditMode={() => { setProjectEdit(false); fetchFields() }}></EditForm> :
                            <>{projectDelete ? <DeleteDialog projectId={selection.projectId} disableDeleteMode={() => { setProjectDelete(false); fetchFields() }} contentTitle={projectData[0].label[0].value}></DeleteDialog> :
                                <AccordionPanel>
                                    <div className='label-container'>
                                        {projectData.map((pd) => {
                                            return <div className='h4-stretcher' key={pd.id[0].value}>
                                                <Text fontSize='h3' fontWeight='bold'>{pd.label[0].value}</Text>
                                            </div>
                                        })}
                                        <div className='button-wrapper'>
                                            <Button variant='secondary' onClick={() => { setProjectEdit(true) }}>Edit</Button>
                                            <Button variant='reg' onClick={() => { setProjectDelete(true) }}>{permission}</Button>
                                        </div>
                                    </div>
                                    <Accordion variant='customDevInfo' allowToggle={true}>
                                        <AccordionItem>
                                            <AccordionButton onClick={() => setDevInfo(!devInfo)}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>Developer Information</Text>
                                                </div>
                                                {!devInfo ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                                            </AccordionButton>
                                            <AccordionPanel>
                                                <FieldGroup type={PROJECTDEV} data={projectData} id={selection.projectId} editSubmitted={fetchFields}></FieldGroup>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </AccordionPanel>}</>}</>
                    </AccordionItem>
                </Accordion>
            }

            {subprojectData.length > 0 &&
                <Accordion variant='custom' allowToggle={true}>
                    <AccordionItem key={subprojectData[0].nid} className={(!expandSubproject ? 'expanded-item' : '')}>
                        <AccordionButton onClick={() => setExpandSubproject(!expandSubproject)}>
                            <div className='h4-stretcher'>
                                <Text fontSize='h4'>Sub-Project Information Attached to this File</Text>
                            </div>
                            {expandSubproject ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                        </AccordionButton>
                        <>{subProjectEdit ?
                            <EditForm data={subprojectData} type={SUBPROJECT} id={selection.subProjectId} disableEditMode={() => { setSubProjectEdit(false); fetchFields() }} /> :
                            <>{subProjectDelete ? <DeleteDialog subProjectId={selection.subProjectId} disableDeleteMode={() => { setSubProjectDelete(false); fetchFields() }} contentTitle={subprojectData[0].title}></DeleteDialog> :
                                <AccordionPanel>
                                    <div className='label-container'>
                                        <div className='h4-stretcher'>
                                            <Text fontSize='h3' fontWeight='bold'>{subprojectData[0].title}</Text>
                                        </div>
                                        <div className='button-wrapper'>
                                            <Button variant='secondary' onClick={() => setSubProjectEdit(true)}>Edit</Button>
                                            <Button variant='reg' onClick={() => { setSubProjectDelete(true) }}>{permission}</Button>
                                        </div>
                                    </div>
                                    <FieldGroup data={subprojectData} type={SUBPROJECT} editSubmitted={fetchFields}></FieldGroup>
                                    <Accordion variant='customDevInfo' allowToggle={true}>
                                        <AccordionItem>
                                            <AccordionButton onClick={() => setDevInfo(!devInfo)}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>Developer Information</Text>
                                                </div>
                                                {!devInfo ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                                            </AccordionButton>
                                            <AccordionPanel>
                                                <FieldGroup type={SUBPROJECTDEV} data={subprojectData} id={selection.subProjectId}></FieldGroup>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    </Accordion>
                                </AccordionPanel>}</>}</>
                    </AccordionItem>
                </Accordion>
            }

            {filegroupData.length > 0 &&
                <Accordion variant='custom' allowToggle={true}>
                    <AccordionItem className={(!expandFilegroup ? 'expanded-item' : '')}>
                        <AccordionButton onClick={() => setExpandFilegroup(!expandFilegroup)}>
                            <div className='h4-stretcher'>
                                <Text fontSize='h4'>File Group Information Attached to this File</Text>
                            </div>
                            {expandFilegroup ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                        </AccordionButton>
                        <>{fileGroupEdit ? <EditForm data={filegroupData} type={FILEGROUP} disableEditMode={() => { setFileGroupEdit(false); fetchFields(); }} id={selection.fileGroupId} /> :
                            <>{fileGroupDelete ? <DeleteDialog fileGroupId={selection.fileGroupId} disableDeleteMode={() => { setFileGroupDelete(false); fetchFields(); }} contentTitle={filegroupData[0].title} /> : <AccordionPanel>
                                <div className='label-container'>
                                    <div className='h4-stretcher'>
                                        <Text fontSize='h3' fontWeight='bold'>{filegroupData[0].title}</Text>
                                    </div>
                                    <div className='button-wrapper'>
                                        <Button variant='secondary' onClick={() => { setFileGroupEdit(true) }}>Edit</Button>
                                        <Button variant='reg' onClick={() => { setFileGroupDelete(true) }}>{permission}</Button>
                                    </div>
                                </div>
                                <FieldGroup data={filegroupData} type={FILEGROUP} editSubmitted={fetchFields}></FieldGroup>
                                <Accordion variant='customDevInfo' allowToggle={true}>
                                    <AccordionItem>
                                        <AccordionButton onClick={() => setDevInfo(!devInfo)}>
                                            <div className='h4-stretcher'>
                                                <Text fontSize='h4' fontWeight='500'>Developer Information</Text>
                                            </div>
                                            {!devInfo ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                                        </AccordionButton>
                                        <AccordionPanel>
                                            <FieldGroup data={filegroupData} type={FILEGROUPDEV} id={selection.fileGroupId}></FieldGroup>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </Accordion>
                                {/* {filegroupData.length>0? Object.keys(filegroupData[0]).map((e) => 
                        <p>{e}: {filegroupData[0][e]? filegroupData[0][e]:null}</p>): null} */}
                            </AccordionPanel>}</>}</>
                    </AccordionItem>
                </Accordion>}
            {fileData.length > 0 &&
                <Accordion variant='custom' allowToggle={true}>
                    <AccordionItem className={(!expandFile ? 'expanded-item' : '')}>
                        <AccordionButton onClick={() => setExpandFile(!expandFile)}>
                            <div className='h4-stretcher'>
                                <Text fontSize='h4'>Bundle and File Information Attached to this File</Text>
                            </div>
                            {expandFile ? <Button variant="anchor">Show</Button> : <Button variant="anchor">Hide</Button>}
                        </AccordionButton>
                        <AccordionPanel>
                            <div className='label-container'>
                                <div className='h4-stretcher'>
                                    <Text fontSize='h3' fontWeight='bold'>{fileData[0].title}</Text>
                                </div>
                                <div className='button-wrapper'>
                                    <Button variant='secondary' onClick={() => { setFileGroupEdit(true) }}>Edit</Button>
                                    <Button variant='reg'>{permission}</Button>
                                </div>
                            </div>
                            <FieldGroup data={fileData} type={FILE} id={selection.fid}></FieldGroup>
                            {/* {fileData.length > 0 ? Object.keys(fileData[0]).map((e) =>
                                <p>{e}: {fileData[0][e] ? fileData[0][e] : null}</p>) : null} */}
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            }
        </div>
    );
};

export default Fields;