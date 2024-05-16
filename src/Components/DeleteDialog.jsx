import axios from 'axios';
import { AuthContext } from './Login';
import React, { useState, useContext, useEffect } from 'react';
import { Button, Text, Input, Alert, AlertIcon } from '@chakra-ui/react';
import './styles/DeleteDialog.css'
import Files from './Files';
import { RefreshContext } from './Main'

const DeleteDialog = ({ selectedFiles, projectId, subProjectId, fileGroupId, disableDeleteMode, contentTitle }) => {
    const encodedCredentials = useContext(AuthContext);
    const [canDelete, setCanDelete] = useState()
    const [deleteReason, setDeleteReason] = useState()
    const [deletionComplete, setDeletionComplete] = useState(false)
    const [deletionRequested, setDeletionRequested] = useState(false)
    const refreshValue = useContext(RefreshContext)

    const checkDeletionPermission = () => {
        if (encodedCredentials.role == 'Administrator' || encodedCredentials.role == 'Content editor') {
            setCanDelete(true)
        } else {
            setCanDelete(false)
        }
    }

    const deleteText = () => {
        if (projectId) {
            return 'If this Project is deleted, all the Sub-Projects, File Groups, Bundles and Files within will all be deleted. The deletion is irreversible.';
        } else if (subProjectId) {
            return 'If this Sub-Project is deleted, all the File Groups, Bundles and Files within will all be deleted. The deletion is irreversible.';
        } else if (fileGroupId) {
            return 'If this File Group is deleted, all the Bundles and Files within will all be deleted. The deletion is irreversible.';
        } else if (selectedFiles) {
            return 'The deletion is irreversible.';
        }
    }

    const sendSubmission = () => {
        if (projectId) {
            const projectInfo = {
                'blocks': [
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `There's been a request for deletion of the following group with ID: ${projectId}`
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `Here's the reason for deletion: ${deleteReason}`
                        }
                    }
                ]
            };
            return projectInfo
        } else if (subProjectId) {
            const subProjectInfo = {
                'blocks': [
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `There's been a request for deletion of the following content with ID: ${subProjectId}`
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `Here's the reason for deletion: ${deleteReason}`
                        }
                    }
                ]
            };
            return subProjectInfo
        } else if (fileGroupId) {
            const fileGroupInfo = {
                'blocks': [
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `There's been a request for deletion of the following content with ID: ${fileGroupId}`
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `Here's the reason for deletion: ${deleteReason}`
                        }
                    }
                ]
            };
            return fileGroupInfo
        } else if (selectedFiles) {
            const fileInfo = {
                'blocks': [
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `There's been a request for deletion of the following file with ID: ${selectedFiles}`
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': `Here's the reason for deletion: ${deleteReason}`
                        }
                    }
                ]
            };
            return fileInfo
        }
    }

    const handleSubmit = async () => {
        const message = JSON.stringify(sendSubmission())
        axios.post(`https://hooks.slack.com/services/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`, message)
            .then(response => {
                console.log('Message sent to Slack:', response.data);
                setDeletionRequested(true)
            })
            .catch(error => {
                console.error('Error sending message to Slack:', error);
            });
    };

    const handleDeletion = async () => {
        if (projectId) {
            try {
                await axios.delete(
                    `https://cedar.arts.ubc.ca/group/${projectId}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                }
                ).then((response) => {
                    console.log(response);
                    console.log(`${projectId} deleted`)
                    refreshValue()
                    setDeletionComplete(true)
                })
            } catch (e) {
                console.log(e.message);
            }
        } else if (subProjectId) {
            try {
                await axios.delete(
                    `https://cedar.arts.ubc.ca/node/${subProjectId}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                }
                ).then((response) => {
                    console.log(response);
                    console.log(`${subProjectId} deleted`)
                    refreshValue()
                    setDeletionComplete(true)
                })
            } catch (e) {
                console.error(e.message);
            }
        } else if (fileGroupId) {
            try {
                await axios.delete(
                    `https://cedar.arts.ubc.ca/node/${fileGroupId}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                }
                ).then((response) => {
                    console.log(response);
                    console.log(`${fileGroupId} deleted`)
                    refreshValue()
                    setDeletionComplete(true)
                })
            } catch (e) {
                console.log(e.message);
            }
        } else if (selectedFiles) {
            try {
                await axios.delete(
                    `https://cedar.arts.ubc.ca/entity/file/${selectedFiles}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                }
                ).then((response) => {
                    console.log(response);
                    console.log(`${selectedFiles} deleted`)
                    setDeletionComplete(true)
                })
            } catch (e) {
                console.log(e.message);
            }
        }
    };

    useEffect(() => {
        checkDeletionPermission();
    }, [])

    return (
        <>{canDelete ?
            <>{deletionComplete ?
                (<div className='delete'>
                    <div className='dialog-header'>
                        <Text fontSize='h3' fontWeight='700'>{contentTitle} has been deleted!</Text>
                        <Button variant='reg' onClick={disableDeleteMode}>Check out other content</Button>
                    </div>
                </div>)
                :
                <div className='delete'>
                    <div className='dialog-header'>
                        <Text fontSize='h3' fontWeight='700'>Are you sure you want to delete {contentTitle}?</Text>
                        <Text fontSize='pSm' color='brown.250'>{deleteText()}</Text>
                    </div>
                    <div className='button-wrapper' style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button variant='secondary' onClick={handleDeletion}>Confirm</Button>
                        <Button variant='reg' onClick={disableDeleteMode}>Cancel</Button>
                    </div>
                </div>}</>
            :
            <>{deletionRequested ?
                (<div className='request-delete'>
                    <div className='dialog-header'>
                        <Text fontSize='h3' fontWeight='700'>Your request to delete {contentTitle} has been sent!</Text>
                        <Button variant='reg' onClick={disableDeleteMode}>Return to list</Button>
                    </div>
                </div>)
                :
                <div className='request-delete'>
                    <div className='dialog-header'>
                        <Text fontSize='h3' fontWeight='700'>Tell your Project Lead why you want to delete {contentTitle}</Text>
                        <Text fontSize='pSm' color='brown.250'>Let your project lead know the reason why you want this deleted. Then, they will delete accordingly. Please note that {deleteText()}</Text>
                    </div>
                    <div className='dialog-container'>
                        <Input variant='deletionDialog' onChange={(e) => setDeleteReason(e.target.value)}></Input>
                    </div>
                    <div className='button-wrapper' style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button variant='secondary' onClick={handleSubmit}>Submit</Button>
                        <Button variant='reg' onClick={disableDeleteMode}>Cancel</Button>
                    </div>
                </div>}</>
        }
        </>)
}

export default DeleteDialog;