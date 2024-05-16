import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { Input, Select, Text, Button } from '@chakra-ui/react'
import './styles/EditForm.css'
import EditForm from './FieldGroup';


const CreateRights = ({ disableCreateNewRights, newRights }) => {

    const encodedCredentials = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [tkLabel, setTkLabel] = useState("");
    const [licenseLink, setLicenseLink] = useState("");
    const [comOwner, setComOwner] = useState("");
    const [selectedLicense, setSelectedLicense] = useState()
    const [selectedLicenseName, setSelectedLicenseName] = useState()
    const [licenseOptions, setLicenseOptions] = useState()
    const [existingContributors, setExistingContributors] = useState()
    const [indOwner, setIndOwner] = useState()
    const [indOwnerName, setIndOwnerName] = useState()
    const [indOwnerOptions, setIndOwnerOptions] = useState([])
    const [rightsCreated, setRightsCreated] = useState(false)
    const [editRights, setEditRights] = useState(false)
    const [removeNid, setRemoveNid] = useState('')
    const [editNid, setEditNid] = useState('')

    // console.log(existingContributors)

    const handleTitleChange = (event) => {
        setTitle(event.target.value)
    }

    const handleChangeLicense = (event) => {
        setSelectedLicense(event.target.value ? event.target.value : "")
        if (licenseOptions) {
            let licenseName = licenseOptions.find(function (option) {
                return option.attributes.drupal_internal__tid == event.target.value
            })
            setSelectedLicenseName(licenseName.attributes.name);
        }
    }

    const handleTKLabelChange = (event) => {
        setTkLabel(event.target.value)
    }

    const handleLicenseLinkChange = (event) => {
        setLicenseLink(event.target.value)
    }

    const handleChangeIndOwner = (event) => {
        setIndOwner(event.target.value ? event.target.value : "")
        if (existingContributors) {
            let indOwnerName = existingContributors.find(function (option) {
                return option.nid == event.target.value
            })
            setIndOwnerName(indOwnerName.title);
        }
    }

    const handleComOwnerChange = (event) => {
        setComOwner(event.target.value)
    }

    const getLicenses = async () => {
        //fetching all license terms
        try {
            const response = await axios.get(
                "https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/licenses?page[limit]=1000", {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            }
            );
            setLicenseOptions(response.data.data);
            // console.log(response.data.data);
        } catch (e) {
            console.log(e.message);
        }
    }

    const getExistingContributors = async () => {
        try {
            const response = await axios.get(
                "https://cedar.arts.ubc.ca/contributorNodes?_format=json", {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            }
            );
            setExistingContributors(response.data)
            const existingContributors = response.data
            const contribOptions = []
            for (let element of existingContributors) {
                // console.log(element.title)
                if (element.field_roles == '') {
                    element.field_roles = 'No role assigned'
                    contribOptions.push(<option key={element.nid} value={element.nid}>Name: {element.title}, Role: {element.field_roles}</option>)
                } else {
                    contribOptions.push(<option key={element.nid} value={element.nid}>Name: {element.title}, Role: {element.field_roles}</option>)
                }
            }
            setIndOwnerOptions(contribOptions);
        } catch (e) {
            console.log(e.message);
        }
    }

    const handleSubmit = async (event) => {
        //make request to cedar.arts.ubc.ca here for new node type rights
        axios.post('https://cedar.arts.ubc.ca/node?_format=json', {
            'type': [{
                target_id: 'rights'
            }],
            'title': [{
                value: title
            }],
            "body": [{
                value: "this is a test", format: "full_html"
            }],
            'field_community_rights_owner': [{
                value: comOwner
            }],
            'field_find_existing_contributors': [{
                target_id: indOwner
            }],
            'field_license_link': [{
                uri: licenseLink
            }],
            'field_licenses': [{
                target_id: selectedLicense
            }],
            'field_tk_label_link': [{
                uri: tkLabel
            }]

        }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Basic ${encodedCredentials.credentials}`,
            }
        }).then((response) => {
            console.log(response)
            setRightsCreated(true)
            setEditNid(response.data.nid[0].value)
            setRemoveNid(response.data.nid[0].value)
            newRights('', undefined, response.data.nid[0].value)
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleEdit = async (event) => {
        //make request to cedar.arts.ubc.ca here for new node type contributor_s_
        axios.patch(`https://cedar.arts.ubc.ca/node/${editNid}?_format=json`, {
            'type': [{
                target_id: 'rights'
            }],
            'title': [{
                value: title
            }],
            'field_community_rights_owner': [{
                value: comOwner
            }],
            'field_find_existing_contributors': [{
                target_id: indOwner
            }],
            'field_license_link': [{
                uri: licenseLink
            }],
            'field_licenses': [{
                target_id: selectedLicense
            }],
            'field_tk_label_link': [{
                uri: tkLabel
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
        getLicenses()
        getExistingContributors()
    }, [])

    return <>{rightsCreated ?
        <div className='newRightsEntryLayout'>
            <div className='rowDisplay'>
                <div className='entryResponse' >
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        {title}
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        Rights Title
                    </Text>
                </div >
                <div className='entryResponse'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        {indOwnerName}
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        Individual Rights Owner
                    </Text>
                </div>
                <div className='entryResponse'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        {comOwner}
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        Community Rights Owner
                    </Text>
                </div>
            </div>
            <div className='rowDisplay'>
                <div className='columnDisplay'>
                    <div className='entryResponse'>
                        <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                            {selectedLicenseName}
                        </Text>
                        <Text fontSize="pReg" color='#716B66'>
                            License
                        </Text>
                    </div>
                    <div className='entryResponse'>
                        <Text fontSize="h4" fontWeight='700' color='#2B2927' width='100%'>
                            {tkLabel}
                        </Text>
                        <Text fontSize="pReg" color='#716B66'>
                            TK Label
                        </Text>
                    </div>
                    <div className='entryResponse'>
                        <Text fontSize="h4" fontWeight='700' color='#2B2927' width='100%'>
                            {licenseLink}
                        </Text>
                        <Text fontSize="pReg" color='#716B66'>
                            License Link
                        </Text>
                    </div>
                </div>
            </div>
            <div className='rowDisplay'>
                <div className='button-wrapper-editForm'>
                    <Button variant='secondary' onClick={() => setEditRights(true)}>Edit</Button>
                    <Button variant='reg' onClick={() => { handleRemove(); disableCreateNewRights() }}>Remove</Button>
                </div>
            </div>
        </div >
        :
        <div className='editFormContainer'>
            <Text fontSize='h3' fontWeight='700' color='base.dark'>Adding New Rights</Text>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    Title
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    Use the license name as the title (Ex. If the license being used is Creative Commons Zero, the title would be “Creative Commons Zero”)
                </Text>
            </div>
            <Input variant='editFormText' value={title} onChange={handleTitleChange}></Input>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    License
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    Choose a License
                </Text>
            </div>
            <Select variant='editFormSelect' value={selectedLicense} onChange={handleChangeLicense}>{licenseOptions ? licenseOptions.map((e) => { return <option value={[e][0].attributes.drupal_internal__tid} key={[e][0].attributes.drupal_internal__tid}>{[e][0].attributes.name}</option> }) : null}</Select>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    TK Label Link
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    The link to the TK label, if applicable
                </Text>
            </div>
            <Input variant='editFormText' value={tkLabel} onChange={handleTKLabelChange}></Input>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    License Link
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    The link to the license, if applicable
                </Text>
            </div>
            <Input variant='editFormText' value={licenseLink} onChange={handleLicenseLinkChange}></Input>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    Individual Rights Owner
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    The full name of the person who owns the right to the files, if applicable
                </Text>
            </div>
            <Select variant='editFormSelect' value={indOwner} onChange={handleChangeIndOwner}>{indOwnerOptions}</Select>
            <div className='descriptionLayout'>
                <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                    Community Rights Owner
                </Text>
                <Text fontSize="pReg" color='#716B66'>
                    The full name of the community that owns the right to the files, if applicable
                </Text>
            </div>
            <Input variant='editFormText' value={comOwner} onChange={handleComOwnerChange}></Input>
            <div className='button-wrapper-editForm'>
                <Button variant='secondary' onClick={handleSubmit}>Create</Button>
                <Button variant='reg' onClick={disableCreateNewRights}>Cancel</Button>
            </div>
        </div>}
        {editRights &&
            <div className='editFormContainer'>
                <Text fontSize='h3' fontWeight='700' color='base.dark'>Adding New Rights</Text>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        Title
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        Use the license name as the title (Ex. If the license being used is Creative Commons Zero, the title would be “Creative Commons Zero”)
                    </Text>
                </div>
                <Input variant='editFormText' value={title} onChange={handleTitleChange}></Input>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        License
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        Choose a License
                    </Text>
                </div>
                <Select variant='editFormSelect' value={selectedLicense} onChange={handleChangeLicense}>{licenseOptions ? licenseOptions.map((e) => { return <option value={[e][0].attributes.drupal_internal__tid} key={[e][0].attributes.drupal_internal__tid}>{[e][0].attributes.name}</option> }) : null}</Select>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        TK Label Link
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        The link to the TK label, if applicable
                    </Text>
                </div>
                <Input variant='editFormText' value={tkLabel} onChange={handleTKLabelChange}></Input>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        License Link
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        The link to the license, if applicable
                    </Text>
                </div>
                <Input variant='editFormText' value={licenseLink} onChange={handleLicenseLinkChange}></Input>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        Individual Rights Owner
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        The full name of the person who owns the right to the files, if applicable
                    </Text>
                </div>
                <Select variant='editFormSelect' value={indOwner} onChange={handleChangeIndOwner}>{indOwnerOptions}</Select>
                <div className='descriptionLayout'>
                    <Text fontSize="h4" fontWeight='700' color='#2B2927'>
                        Community Rights Owner
                    </Text>
                    <Text fontSize="pReg" color='#716B66'>
                        The full name of the community that owns the right to the files, if applicable
                    </Text>
                </div>
                <Input variant='editFormText' value={comOwner} onChange={handleComOwnerChange}></Input>
                <div className='button-wrapper-editForm'>
                    <Button variant='secondary' onClick={() => { handleEdit(); setEditRights(false) }}>Submit Changes</Button>
                    <Button variant='reg' onClick={() => setEditRights(false)}>Cancel</Button>
                </div>
            </div>
        }</>
}

export default CreateRights