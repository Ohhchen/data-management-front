import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { Input, Select, Text, Button } from '@chakra-ui/react'
import './styles/EditForm.css'
import EditForm from './FieldGroup';

const CreateContributor = ({ disableCreateNewContributor, newContributor, currentExistingElement }) => {

    const encodedCredentials = useContext(AuthContext);
    const [selectedRole, setSelectedRole] = useState("")
    const [title, setTitle] = useState("");
    const [options, setOptions] = useState()
    const [selectedRoleName, setSelectedRoleName] = useState("")
    const [contributorCreated, setContributorCreated] = useState(false)
    const [editContributor, setEditContributor] = useState(false)
    const [removeNid, setRemoveNid] = useState('')
    const [editNid, setEditNid] = useState('')

    const handleChangeRole = (event) => {
        setSelectedRole(event.target.value ? event.target.value : '');
        if (options) {
            let roleName = options.find(function (option) {
                return option.attributes.drupal_internal__tid == event.target.value
            })
            setSelectedRoleName(roleName.attributes.name);
        }
    }

    const handleTitleChange = (event) => {
        setTitle(event.target.value)
    }

    const getRoles = async () => {
        //fetching all roles terms
        try {
            const response = await axios.get(
                "https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/roles?page[limit]=1000", {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'X-CSRF-Token': encodedCredentials.jwttoken,
                }
            }
            );
            setOptions(response.data.data);
            // console.log(response.data.data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const handleSubmit = async (event) => {
        //make request to cedar.arts.ubc.ca here for new node type contributor_s_
        axios.post('https://cedar.arts.ubc.ca/node?_format=json', {
            'type': [{
                target_id: 'contributor_s_'
            }],
            'title': [{
                value: title
            }],
            "body": [{
                value: "this is a test", format: "full_html"
            }],
            'field_roles': [{
                target_id: selectedRole
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${encodedCredentials.credentials}`,
            }
        }).then((response) => {
            console.log(response)
            setContributorCreated(true)
            setRemoveNid(response.data.nid[0].value)
            setEditNid(response.data.nid[0].value)
            // let newContributorArray = []
            // newContributorArray.push(currentExistingElement, response.data.nid[0].value)
            newContributor([`${response.data.nid[0].value}`], null)
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleEdit = async (event) => {
        //make request to cedar.arts.ubc.ca here for new node type contributor_s_
        axios.patch(`https://cedar.arts.ubc.ca/node/${editNid}?_format=json`, {
            'type': [{
                target_id: 'contributor_s_'
            }],
            'title': [{
                value: title
            }],
            "body": [{
                value: "this is a test", format: "full_html"
            }],
            'field_roles': [{
                target_id: selectedRole
            }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${encodedCredentials.credentials}`,
            }
        }).then((response) => {
            console.log(response)
            console.log(`${editNid} patched`)
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleRemove = async (event) => {
        //make request to cedar.arts.ubc.ca here for new node type contributor_s_
        try {
            await axios.delete(
                `https://cedar.arts.ubc.ca/node/${removeNid}`, {
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
                console.log(`${removeNid} deleted`)
            })
        } catch (e) {
            console.log(e.message);
        }
    }

    useEffect(() => {
        getRoles()
    }, [])
    return <>{contributorCreated ?
        // <div className='entryContainer'>
        //     <Text fontSize='h3' fontWeight='700' color='base.dark'>New Contributor Entries</Text>
        <div className='newEntryLayout'>
            < div className='entryResponse' >
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    {title}
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    Full Name
                </Text>
            </div >
            <div className='entryResponse'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    {selectedRoleName}
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    Role
                </Text>
            </div>
            <div className='button-wrapper-newEntry'>
                <Button variant='secondary' onClick={() => setEditContributor(true)}>Edit</Button>
                <Button variant='reg' onClick={() => { handleRemove(); disableCreateNewContributor() }}>Remove</Button>
            </div>
        </div >
        // </div>
        :
        <div className='editFormContainer'>
            <Text fontSize='h3' fontWeight='700' color='base.dark'>Adding a New Contributor</Text>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    Full Name
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    The full name of the contributor
                </Text>
            </div>
            <Input variant='editFormText' value={title} onChange={handleTitleChange}></Input>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    Role
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    The role this contributor has
                </Text>
            </div>
            {/* <Select variant='editFormSelect' value={1} onChange={handleChangeRole}>{Object.keys(roleOptions).map((e, i) => { return <option value={e}>{roleOptions[e]}</option> })}</Select> */}
            <Select variant='editFormSelect' value={selectedRole} onChange={handleChangeRole}>{options ? options.map((e) => { return <option value={[e][0].attributes.drupal_internal__tid} key={[e][0].attributes.drupal_internal__tid}>{[e][0].attributes.name}</option> }) : null}</Select>
            <div className='button-wrapper-editForm'>
                <Button variant='secondary' onClick={handleSubmit}>Create</Button>
                <Button variant='reg' onClick={disableCreateNewContributor}>Cancel</Button>
            </div>
        </div>}
        {editContributor &&
            <div className='editFormContainer'>
                <Text fontSize='h3' fontWeight='700' color='base.dark'>Editing New Contributor</Text>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        Full Name
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        The full name of the contributor
                    </Text>
                </div>
                <Input variant='editFormText' value={title} onChange={handleTitleChange}></Input>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        Role
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        The role this contributor has
                    </Text>
                </div>
                {/* <Select variant='editFormSelect' value={1} onChange={handleChangeRole}>{Object.keys(roleOptions).map((e, i) => { return <option value={e}>{roleOptions[e]}</option> })}</Select> */}
                <Select variant='editFormSelect' value={selectedRole} onChange={handleChangeRole}>{options ? options.map((e) => { return <option value={[e][0].attributes.drupal_internal__tid} key={[e][0].attributes.drupal_internal__tid}>{[e][0].attributes.name}</option> }) : null}</Select>
                <div className='button-wrapper-editForm'>
                    <Button variant='secondary' onClick={() => { handleEdit(); setEditContributor(false) }}>Submit Changes</Button>
                    <Button variant='reg' onClick={() => setEditContributor(false)}>Cancel</Button>
                </div>
            </div>
        }</>
}

export default CreateContributor