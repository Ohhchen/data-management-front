import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import './styles/FileWizard.css'
import {
    Input,
    Text,
    Button,
} from '@chakra-ui/react'
import step0Active from '../images/step0_active.svg'
import step1Active from '../images/step1_active.svg'
import step2Active from '../images/step2_active.svg'
import step3Active from '../images/step3_active.svg'
import step0Inactive from '../images/step0_inactive.svg'
import step1Inactive from '../images/step1_inactive.svg'
import step2Inactive from '../images/step2_inactive.svg'
import step3Inactive from '../images/step3_inactive.svg'
import headphonesBlack from '../images/headphonesBlack.svg'
import imageBlack from '../images/imageBlack.svg'
import videoBlack from '../images/videoBlack.svg'
import FileWizardComplete from '../images/FileWizardComplete.svg'
import ReactDatePicker from 'react-datepicker';
import FilesToExistingBundle from './FilesToExistingBundle';
import BundleToNewFileGroups from './BundleToNewFileGroups'
import FileGroupToNewSubProjects from './FileGroupToNewSubProjects'
import BundleToExistingFileGroup from './BundleToExistingFileGroup'
import ReviewChanges from './ReviewChanges';
import FilesToNewBundle from './FilesToNewBundle'
import FileGroupsToExistingSubProjects from './FileGroupsToExistingSubProjects';

function FileWizard({ projectId, closeFileWizard, subProjectId }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [submitChanges, setSubmitChanges] = useState(false)
    const [filesToBundles, setFilesToBundles] = useState(false)
    const [existingBundles, setExistingBundles] = useState(true)
    const [createNewBundles, setCreateNewBundles] = useState(false)
    const [bundleToFileGroups, setBundleToFileGroups] = useState(false)
    const [fileGroupToSubProjects, setFileGroupToSubProjects] = useState(false)
    const [toExistingFileGroup, setToExistingFileGroup] = useState(false)
    const [toNewFileGroups, setToNewFileGroups] = useState(false)
    const [toExistingSubProject, setToExistingSubProject] = useState(false)
    const [toNewSubProject, setToNewSubProject] = useState(false)
    const [newBundles, setNewBundles] = useState([])
    const [newFileGroups, setNewFileGroups] = useState([])
    const [reviewChanges, setReviewChanges] = useState(false)
    const [newData, setNewData] = useState()
    const [changedData, setChangedData] = useState()

    const setFileGroups = (fileGroup) => {
        setNewFileGroups([...newFileGroups, fileGroup])
    }

    const handleFilesChange = (e) => {
        const addedFiles = Array.from(e.target.files);
        // console.log(addedFiles)
        setFiles([...files, ...addedFiles]);
    };

    const removeFile = (file) => {
        setFiles(files.filter((f) => f !== file))
    }

    const calculateFileSize = (file) => {
        if (file.size.toString().length >= 5) {
            let kiloBytes = file.size / 1000
            return `${Math.floor(kiloBytes)} KB`
        } else if (file.size.toString().length >= 7) {
            let megaBytes = file.size / 1000
            return `${Math.floor(megaBytes)} MB`
        }
    }

    const submittedChanges = () => {
        setSubmitChanges(true)
        setReviewChanges(false)
    }

    const moveToNextStep = () => {
        // if (currentStep <= 1) {
        setCurrentStep(currentStep + 1);
        // }
    };

    const movetoStepTwo = () => {
        // if (currentStep <= 1) {
        setCurrentStep(2);
        // }
    };

    const moveToPreviousStep = () => {
        // if (currentStep >= 1) {
        setCurrentStep(currentStep - 1);
        // }
    };

    return (
        <div className='file-wizard-container'>
            {!submitChanges &&
                <div className='stepper-container'>
                    {currentStep == 0 ?
                        <div className='step'>
                            <img src={step0Active}></img>
                            <Text color='#324126' fontSize='20px' fontWeight='500'>Learn</Text>
                        </div>
                        :
                        <div className='step'>
                            <img src={step0Inactive}></img>
                            <Text color='#716B66' fontSize='20px' fontWeight='500'>Learn</Text>
                        </div>
                    }
                    {currentStep == 1 ?
                        <div className='step'>
                            <img src={step1Active}></img>
                            <Text color='#324126' fontSize='20px' fontWeight='500'>Upload Files</Text>
                        </div>
                        :
                        <div className='step'>
                            <img src={step1Inactive}></img>
                            <Text color='#716B66' fontSize='20px' fontWeight='500'>Upload Files</Text>
                        </div>
                    }
                    {currentStep == 2 ?
                        <div className='step'>
                            <img src={step2Active}></img>
                            <Text color='#324126' fontSize='20px' fontWeight='500'>Fill or Assign Metadata Info</Text>
                        </div>
                        :
                        <div className='step'>
                            <img src={step2Inactive}></img>
                            <Text color='#716B66' fontSize='20px' fontWeight='500'>Fill or Assign Metadata Info</Text>
                        </div>
                    }
                    {currentStep == 3 ?
                        <div className='step'>
                            <img src={step3Active}></img>
                            <Text color='#324126' fontSize='20px' fontWeight='500'>Review and Save</Text>
                        </div>
                        :
                        <div className='step'>
                            <img src={step3Inactive}></img>
                            <Text color='#716B66' fontSize='20px' fontWeight='500'>Review and Save</Text>
                        </div>
                    }
                </div>
            }

            {/* {updateMessage && <p>{updateMessage}</p>} */}

            {currentStep == 0 && (
                <div>
                    Learn some stuff
                    <div className='button-wrapper'>
                        <Button variant='secondary' onClick={moveToNextStep}>Next</Button>
                    </div>
                </div>
            )}

            <>{currentStep == 1 && (
                <div className='step1-container'>
                    {files.length > 0 ?
                        <div className='files-display'>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <Text fontSize='24px' color='#2B2927' fontWeight='700'>Here are the media files you have uploaded</Text>
                                    <Text fontSize='16px' color='#716B66' fontWeight='400'>{files.length} media files</Text>
                                </div>
                            </div>
                            <div className='uploaded-files-list'>
                                {files.map((file, index) => (
                                    <div key={index} className='upload-review-row'>
                                        <img src={imageBlack}></img>
                                        <div className='upload-review-column'>
                                            <Text fontSize='16px' color='#2B2927' fontWeight='400'>{file.name}</Text>
                                            <Text fontSize='13px' color='#716B66' fontWeight='400'>{calculateFileSize(file)}</Text>
                                        </div>
                                        <Button variant='reg' onClick={() => removeFile(file)}>Remove</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        :
                        <div className='upload'>
                            <label htmlFor="file-upload" className="custom-file-upload">
                                <span style={{ fontSize: '20px', fontWeight: '500', color: '#2B2927' }}>Upload Files here</span>
                                <span style={{ fontSize: '16px', fontWeight: '400', color: '#716B66' }}>Click to select multiple files</span>
                            </label>
                            <input id="file-upload" type="file" multiple onChange={handleFilesChange} />
                            <div className='file-rules'>
                                <Text fontSize='anchorLinkReg' color='#716B66' fontWeight='400'>Unlimited number of files can be uploaded.</Text>
                                <Text fontSize='anchorLinkReg' color='#716B66' fontWeight='400'>50 MB limit.</Text>
                                <Text fontSize='anchorLinkReg' color='#716B66' fontWeight='400'>Allowed types: .txt .mp3 .mp4 .wav .png .jpg .jpeg</Text>
                            </div>
                        </div>
                    }
                    <div className='button-wrapper'>
                        <div className='button-wrapper-stretch'>
                            <Button variant='reg' onClick={moveToPreviousStep}>Back</Button>
                        </div>
                        <Button variant='secondary' onClick={() => { moveToNextStep(); setFilesToBundles(true) }}>Next</Button>
                    </div>
                </div>
            )}</>

            {!submitChanges && currentStep == 2 && filesToBundles ?
                <div>
                    <div className='button-wrapper-wizard'>
                        <button className={existingBundles ? 'custom-wizard-button-active' : 'custom-wizard-button'} onClick={() => { setExistingBundles(true); setCreateNewBundles(false) }}>
                            Upload to existing Bundles<br />
                            <span className='wizard-button'>Upload new media files to existing Bundles</span>
                        </button>
                        <button className={createNewBundles ? 'custom-wizard-button-active' : 'custom-wizard-button'} onClick={() => { setExistingBundles(false); setCreateNewBundles(true) }}>
                            Create a new Bundle to upload files<br />
                            <span className='wizard-button'>Create a new Bundle to upload new media files to</span>
                        </button>
                    </div>
                    <>{existingBundles &&
                        <div className='step1-container'>
                            <FilesToExistingBundle
                                projectId={projectId}
                                uploadedFiles={files}
                                setCurrentStep={setCurrentStep}
                                currentStep={currentStep}
                                changedData={setChangedData}
                                nextStep={() => {
                                    setFilesToBundles(false);
                                    setReviewChanges(true);
                                    moveToNextStep();
                                }}
                                returnToNewFile={() => { setCurrentStep(1) }}>
                            </FilesToExistingBundle>
                        </div>
                    }</>
                    {createNewBundles &&
                        <div className='step1-container'>
                            {/* this was not the correct component to put here, creating new component named FilesToNewBundle */}
                            <FilesToNewBundle
                                currentStep={currentStep}
                                returnToNewFile={() => { setCurrentStep(1) }}
                                nextStep={() => {
                                    setBundleToFileGroups(true);
                                    setToExistingFileGroup(true);
                                    setFilesToBundles(false);
                                }}
                                newFiles={files}
                                newBundles={(bundle) => { setNewBundles([...newBundles, bundle]) }}
                            //onBundlesCreated={handleBundlesCreated} 
                            />
                        </div>
                    }
                </div> : null}

            {!submitChanges && currentStep == 2 && bundleToFileGroups ?
                <div>
                    <div className='button-wrapper-wizard'>
                        <button className={toExistingFileGroup ? 'custom-wizard-button-active' : 'custom-wizard-button'} onClick={() => { setToExistingFileGroup(true); setToNewFileGroups(false) }}>
                            Use existing File Group information<br />
                            <span className='wizard-button'>Attach newly created Bundles to existing File Groups</span>
                        </button>
                        <button className={toNewFileGroups ? 'custom-wizard-button-active' : 'custom-wizard-button'} onClick={() => { setToExistingFileGroup(false); setToNewFileGroups(true) }}>
                            Create new File Groups<br />
                            <span className='wizard-button'>Create new File Groups to upload newly created Bundles</span>
                        </button>
                    </div>
                    <>{toExistingFileGroup &&
                        <div className='step1-container'>
                            <BundleToExistingFileGroup
                                newBundles={newBundles}
                                changedData={setChangedData}
                                projectId={projectId}
                                subProjectId={subProjectId}
                                returnToNewBundle={() => {
                                    setBundleToFileGroups(false);
                                    setFilesToBundles(true);
                                }}
                                nextStep={() => {
                                    moveToNextStep();
                                    setExistingBundles(true);
                                    setCreateNewBundles(false);
                                    setBundleToFileGroups(false);
                                    setToExistingFileGroup(false);
                                    setReviewChanges(true);
                                }} />
                        </div>
                    }
                        {toNewFileGroups &&
                            <div>
                                <BundleToNewFileGroups
                                    newFileGroups={setFileGroups}
                                    newBundles={newBundles}
                                    currentStep={currentStep}
                                    returnToNewBundle={() => {
                                        setBundleToFileGroups(false);
                                        setFilesToBundles(true);
                                    }}
                                    nextStep={() => {
                                        setBundleToFileGroups(false);
                                        setFileGroupToSubProjects(true);
                                        setToExistingSubProject(true);
                                    }}>
                                </BundleToNewFileGroups>
                            </div>
                        }</>
                </div>
                : null}



            {fileGroupToSubProjects &&
                <div>
                    <div className='button-wrapper-wizard'>
                        <button className={toExistingSubProject ? 'custom-wizard-button-active' : 'custom-wizard-button'} onClick={() => { setToExistingSubProject(true); setToNewSubProject(false) }}>
                            Use existing Sub-Project information<br />
                            <span className='wizard-button'>Attach newly created File Group to existing Sub-Projects</span>
                        </button>
                        <button className={toNewSubProject ? 'custom-wizard-button-active' : 'custom-wizard-button'} onClick={() => { setToExistingSubProject(false); setToNewSubProject(true) }}>
                            Create new Sub-Projects<br />
                            <span className='wizard-button'>Create new Sub-Projects to upload newly created File Groups</span>
                        </button>
                    </div>
                    {toExistingSubProject &&
                        <FileGroupsToExistingSubProjects
                            projectId={projectId}
                            newFileGroups={newFileGroups}
                            changedData={setChangedData}
                            nextStep={() => {
                                setFileGroupToSubProjects(false);
                                setToExistingSubProject(false);
                                setToNewSubProject(false);
                                setReviewChanges(true)
                                moveToNextStep();
                            }}
                            returnToNewFileGroup={() => {
                                setFileGroupToSubProjects(false);
                                setBundleToFileGroups(true);
                            }}>
                        </FileGroupsToExistingSubProjects>
                    }
                    {toNewSubProject &&
                        <FileGroupToNewSubProjects
                            projectId={projectId}
                            newFileGroups={newFileGroups}
                            newData={setNewData}
                            nextStep={() => {
                                setFileGroupToSubProjects(false);
                                setToExistingSubProject(false);
                                setToNewSubProject(false);
                                setReviewChanges(true);
                                moveToNextStep();
                            }}
                            returnToNewFileGroup={() => {
                                setFileGroupToSubProjects(false);
                                setBundleToFileGroups(true);
                            }}>
                        </FileGroupToNewSubProjects>
                    }
                </div>
            }

            {reviewChanges &&
                <div>
                    <ReviewChanges
                        newData={newData}
                        changedData={changedData}
                        submitChanges={submittedChanges}>
                    </ReviewChanges>
                </div>
            }

            {submitChanges &&
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', width: '100%', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                        <Text fontSize='28px' color='#709157' fontWeight='700' textAlign='center'>Your changes are saved!</Text>
                        <img src={FileWizardComplete}></img>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'center', justifyContent: 'center' }}>
                        <Button variant='reg'
                            onClick={() => {
                                setCurrentStep(1);
                                setSubmitChanges(false);
                            }}>Upload more files</Button>
                        <Button variant='secondary' onClick={() => { closeFileWizard() }}>Go back to homepage</Button>
                    </div>
                </div>
            }
        </div >
    );


}

export default FileWizard;
