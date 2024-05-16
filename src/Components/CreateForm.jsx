import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { EditFormData } from './EditFormData';
import {
    Input,
    Text,
    Select,
    Button,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { AuthContext } from './Login';
import './styles/CreateForm.css'
import CreateRights from './CreateRights';

const CreateForm = ({
    type,
    title,
    description,
    source,
    relation,
    subjects,
    subjectsGeo,
    dateValue,
    digitalType,
    lang,
    format,
    newRights,
    funding,
    agreement,
    status,
    create }) => {
    const encodedCredentials = useContext(AuthContext)
    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])

    useEffect(() => {
        setFormData(EditFormData[type])
    }, [type])

    const handleTextChange = (field, event) => {
        switch (field) {
            case 'field_description':
                // console.log(event.target.value)
                description(event.target.value ? event.target.value : '')
                break;
            case 'field_funding':
                // console.log(event.target.value)
                funding(event.target.value ? event.target.value : '')
                break;
            case 'field_agreement':
                // console.log(event.target.value)
                agreement(event.target.value ? event.target.value : '')
                break;
            case 'title':
                title(event.target.value)
                break;
            case 'field_source':
                // console.log(event.target.value)
                source(event.target.value)
                break;
            case 'field_relation':
                // console.log(event.target.value)
                relation(event.target.value)
                break;
            case 'field_subjects':
                // console.log(event.target.value)
                subjects(event.target.value)
                break;
            case 'field_subjects_geographic':
                // console.log(event.target.value)
                subjectsGeo(event.target.value)
                break;
        }
    }

    const handleDateChange = (event) => {
        // console.log(event.target.value)
        let date = new Date(event.target.value)
        let toString = date.toISOString()
        let reformattedDate = toString.replace('.000Z', '+0200')
        dateValue(event.target.value ? reformattedDate : '')
    }

    const handleFormatChange = (event) => {
        format(event.target.value ? event.target.value : "0")
    }

    const handleTypeChange = (event) => {
        digitalType(event.target.value ? event.target.value : "0")
    }

    const handleLangChange = (event) => {
        // console.log(event.target.value)
        lang(event.target.value ? event.target.value : "0")
    }

    const handleStatusChange = (event) => {
        status(event.target.value ? event.target.value : "0")
    }

    const handleRights = (element, event, newNid) => {
        fetch("https://cedar.arts.ubc.ca/jsonapi/node/rights", {
            headers: {
                Authorization: `Basic ${encodedCredentials.credentials}`,
                'X-CSRF-Token': encodedCredentials.csrftoken,
            }
        }).then((result) => {
            return result.json()
        }).then((rights) => {
            let rightsNodes = rights.data
            if (newNid != undefined) {
                // if there is only a single rights node attached to the file group
                // and selection has been changed
                // and a new rights node has been added instead
                console.log(newNid)
                let selectedRights = rightsNodes.find(function (right) {
                    return right.attributes.drupal_internal__nid == newNid
                })
                newRights({
                    target_id: selectedRights.attributes.drupal_internal__nid,
                    target_type: 'node',
                    target_uuid: selectedRights.id,
                    url: `/node/${selectedRights.attributes.drupal_internal__nid}`
                })
            } else {
                if (event == undefined) {
                    // if there is currently no rights node attached to the file group
                    // and selection is not changed
                    newRights('0')
                } else if (event != undefined) {
                    // if there is only a single rights node attached to the file group
                    // and selection has been changed
                    // console.log(event.target.value)
                    let selectedRights = rightsNodes.find(function (right) {
                        return right.attributes.drupal_internal__nid == event.target.value
                    })
                    newRights({
                        target_id: selectedRights.attributes.drupal_internal__nid,
                        target_type: 'node',
                        target_uuid: selectedRights.id,
                        url: `/node/${selectedRights.attributes.drupal_internal__nid}`
                    })
                }
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleCreateNewRights = (tempFields) => {
        let addRights = tempFields.splice(10, 0, <CreateRights disableCreateNewRights={() => disableAddRights(tempFields)} newRights={handleRights} />)
        setFields([...tempFields, addRights]);
    }

    const disableAddRights = (tempFields) => {
        // console.log(tempFields);
        tempFields.splice(10, 1)
        setFields(tempFields)
    }

    useEffect(() => {
        let tempFields = []
        let fieldPromises = []
        for (let field of Object.keys(formData)) {
            switch (formData[field].type) {
                case "text":
                    if (field == "title") {
                        tempFields.push(
                            <div className='inputLayout' key={field}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="h3" fontWeight='700' color='#2B2927'>
                                        {formData[field].name}
                                    </FormLabel>
                                    <Text fontSize="pReg" color='#716B66'>
                                        {formData[field].description}
                                    </Text>
                                    <Input
                                        onChange={(event) => handleTextChange(field, event)}
                                        key={field}
                                        variant='editFormText'>
                                    </Input>
                                </FormControl>
                            </div>)
                    } else {
                        tempFields.push(
                            <div className='inputLayout' key={field}>
                                <div className='descriptionLayout'>
                                    <Text fontSize="h3" fontWeight='700' color='#2B2927' >
                                        {formData[field].name}
                                    </Text>
                                    <Text fontSize="pReg" color='#716B66'>
                                        {formData[field].description}
                                    </Text>
                                </div>
                                <Input
                                    onChange={(event) => handleTextChange(field, event)}
                                    key={field}
                                    variant='editFormText'>
                                </Input>
                            </div>)
                    }
                    break;
                case "date":
                    tempFields.push(
                        <div className="datePickerLayout" key={field}>
                            <div className='descriptionLayout'>
                                <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                    {formData[field].name}
                                </Text>
                                <Text fontSize="pReg" color='#716B66'>
                                    {formData[field].description}
                                </Text>
                            </div>
                            <Input
                                key={field}
                                variant='editFormText'
                                onChange={handleDateChange}
                                type='datetime-local' />
                        </div>)
                    break;
                case 'selectStatus':
                    fieldPromises.push(new Promise((resolve, reject) => {
                        fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/status?page[limit]=1000", {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        }).then((result) => {
                            return result.json()
                        }).then((json) => {
                            // console.log(json)
                            let options = []
                            options.push(<option key={0} value={'0'}>-None-</option>)
                            for (let term of json.data) {
                                options.push(<option key={term.attributes.drupal_internal__tid} value={term.attributes.drupal_internal__tid}>{term.attributes.name}</option>)

                            }
                            tempFields.push(
                                <div className='selectLayout' key={field}>
                                    <div className='descriptionLayout'>
                                        <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                            {formData[field].name}
                                        </Text>
                                        <Text fontSize="pReg" color='#716B66'>
                                            {formData[field].description}
                                        </Text>
                                    </div>
                                    <Select
                                        variant='editFormSelect'
                                        key={field}
                                        onChange={handleStatusChange}
                                        defaultValue={"0"} >
                                        {options}
                                    </Select>
                                </div>)
                            resolve();
                        }).catch((error) => {
                            console.log(error)
                            reject();
                        })
                    }))
                    break;
                case "selectFormat":
                    fieldPromises.push(new Promise((resolve, reject) => {
                        fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/format?page[limit]=1000", {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        }).then((result) => {
                            return result.json()
                        }).then((json) => {
                            // console.log(json)
                            let formatOptions = []
                            formatOptions.push(<option key={0} value={'0'}>-None-</option>)
                            for (let term of json.data) {
                                formatOptions.push(<option key={term.attributes.drupal_internal__tid} value={term.attributes.drupal_internal__tid}>{term.attributes.name}</option>)

                            }
                            tempFields.push(
                                <div className='selectLayout' key={field}>
                                    <div className='descriptionLayout'>
                                        <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                            {formData[field].name}
                                        </Text>
                                        <Text fontSize="pReg" color='#716B66'>
                                            {formData[field].description}
                                        </Text>
                                    </div>
                                    <Select
                                        variant='editFormSelect'
                                        key={field}
                                        onChange={handleFormatChange}
                                        defaultValue={"0"}>
                                        {formatOptions}
                                    </Select>
                                </div>)
                            resolve();
                        }).catch((error) => {
                            console.log(error)
                            reject();
                        })
                    }));
                    break;
                case "selectType":
                    fieldPromises.push(new Promise((resolve, reject) => {
                        fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/type?page[limit]=1000", {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        }).then((result) => {
                            return result.json()
                        }).then((types) => {
                            // console.log(types)
                            let typeOptions = []
                            typeOptions.push(<option key={0} value={'0'}>-None-</option>)
                            for (let term of types.data) {
                                // console.log(term)
                                typeOptions.push(<option key={term.attributes.drupal_internal__tid} value={term.attributes.drupal_internal__tid}>{term.attributes.name}</option>)

                            }
                            tempFields.push(
                                <div className='selectLayout' key={field}>
                                    <div className='descriptionLayout'>
                                        <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                            {formData[field].name}
                                        </Text>
                                        <Text fontSize="pReg" color='#716B66'>
                                            {formData[field].description}
                                        </Text>
                                    </div>
                                    <Select
                                        variant='editFormSelect'
                                        key={field}
                                        onChange={handleTypeChange}
                                        defaultValue={"0"}>
                                        {typeOptions}
                                    </Select>
                                </div>)
                            resolve();
                        }).catch((error) => {
                            console.log(error)
                            reject();
                        })
                    }))
                    break;
                case "selectLang":
                    fieldPromises.push(new Promise((resolve, reject) => {
                        fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/languages?page[limit]=1000", {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        }).then((result) => {
                            return result.json()
                        }).then((json) => {
                            // console.log(json)
                            let langOptions = []
                            langOptions.push(<option key={0} value={'0'}>-None-</option>)
                            for (let term of json.data) {
                                langOptions.push(<option key={term.attributes.drupal_internal__tid} value={term.attributes.drupal_internal__tid}>{term.attributes.name}</option>)

                            }
                            tempFields.push(
                                <div className='selectLayout' key={field}>
                                    <div className='descriptionLayout'>
                                        <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                            {formData[field].name}
                                        </Text>
                                        <Text fontSize="pReg" color='#716B66'>
                                            {formData[field].description}
                                        </Text>
                                    </div>
                                    <Select
                                        variant='editFormSelect'
                                        key={field}
                                        onChange={handleLangChange}
                                        defaultValue={"0"}>
                                        {langOptions}
                                    </Select>
                                </div>)
                            resolve()
                        }).catch((error) => {
                            console.log(error)
                            reject()
                        })
                    }))
                    break;
                case "contributors":
                    fieldPromises.push(new Promise((resolve, reject) => {
                        let contribOptions = []
                        let roleTerms = []
                        try {
                            axios.get(
                                "https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/roles?page[limit]=1000", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((roles) => {
                                roleTerms = roles.data.data;
                                fetch("https://cedar.arts.ubc.ca/jsonapi/node/contributor_s_", {
                                    headers: {
                                        Authorization: `Basic ${encodedCredentials.credentials}`,
                                        'X-CSRF-Token': encodedCredentials.csrftoken,
                                    }
                                }).then((result) => {
                                    return result.json()
                                }).then((contributors) => {
                                    // populate contributors options
                                    // nid: i.attributes.drupal_internal__nid
                                    // uuid: i.id
                                    // field_roles: i.relationships.field_roles.data.meta.drupal_internal__target_id
                                    // title: i.attributes.title
                                    contribOptions.push(<option key={0} value={'0'}>-None-</option>)
                                    for (let i of contributors.data) {
                                        if (i.relationships.field_roles.data == null) {
                                            i.relationships.field_roles.data = 'No role assigned'
                                            contribOptions.push(<option key={i.attributes.drupal_internal__nid} value={i.attributes.drupal_internal__nid}>Name: {i.attributes.title}, Role: {i.relationships.field_roles.data}</option>)
                                        } else {
                                            let roleName = roleTerms.find(function (role) {
                                                return role.attributes.drupal_internal__tid == i.relationships.field_roles.data.meta.drupal_internal__target_id
                                            })
                                            contribOptions.push(<option key={i.attributes.drupal_internal__nid} value={i.attributes.drupal_internal__nid}>Name: {i.attributes.title}, Role: {roleName.attributes.name}</option>)
                                        }
                                    }
                                    tempFields.push(
                                        <div className='contributorLayout' key={field}>
                                            <div className='descriptionLayout' key={'exisitingContrib1'}>
                                                <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                    {formData[field].name}
                                                </Text>
                                                <Text fontSize="pReg" color='#716B66'>
                                                    {formData[field].description}
                                                </Text>
                                            </div>
                                            <Select
                                                key={field}
                                                variant='editFormSelect'
                                                // onChange={(event) => { handleContributor([event.target.value], e) }} 
                                                defaultValue={"0"}>
                                                {contribOptions}
                                            </Select>
                                            <Button key={'exisitingContrib3'} variant='secondary'>Add a New Contributor</Button>
                                        </div>)
                                    resolve();
                                }).catch((error) => {
                                    console.log(error)
                                })
                            })
                        } catch (e) {
                            console.log(e.message);
                            reject();
                        }
                    }))
                    break;
                case "rights":
                    fieldPromises.push(new Promise((resolve, reject) => {
                        let licenseTerms = []
                        // fetching all license taxonomy terms
                        try {
                            axios.get(
                                "https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/licenses?page[limit]=1000", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((response) => {
                                licenseTerms = response.data.data
                                // fetch all rights nodes existing on the server
                                fetch("https://cedar.arts.ubc.ca/jsonapi/node/rights", {
                                    headers: {
                                        Authorization: `Basic ${encodedCredentials.credentials}`,
                                        'X-CSRF-Token': encodedCredentials.csrftoken,
                                    }
                                }).then((result) => {
                                    return result.json()
                                }).then((rights) => {
                                    // Generating options for rights
                                    // Using licenseTerms to map to the correct term name
                                    let rightsOptions = []
                                    let license = undefined
                                    let licenseOwner = undefined
                                    rightsOptions.push(<option key={0} value={'0'}>-None-</option>)
                                    for (let i of rights.data) {
                                        // uuid: i.id
                                        // nid: i.attributes.drupal_internal__nid
                                        // field_community_rights_owner: i.attributes.field_community_rights_owner
                                        // field_license_link: i.attributes.field_license_link.uri
                                        // field_tk_label_link: i.attributes.field_tk_label_link.uri
                                        // field_find_existing_contributors: i.relationships.field_find_existing_contributors.data.meta.drupal_internal__target_id
                                        // field_licenses: i.relationships.field_licenses.data.meta.drupal_internal__target_id
                                        // title: i.attributes.title
                                        if (i.relationships.field_licenses.data == null && i.relationships.field_find_existing_contributors.data == null) {
                                            license = 'No license assigned'
                                            licenseOwner = 'No license owner'
                                            rightsOptions.push(<option key={i.id} value={i.attributes.drupal_internal__nid}>Name: {i.attributes.title}, License: {license}, Owner: {licenseOwner} </option>)
                                        } else if (i.relationships.field_licenses.data != null && i.relationships.field_find_existing_contributors.data == null && i.attributes.field_community_rights_owner != null) {
                                            license = i.relationships.field_licenses.data.meta.drupal_internal__target_id
                                            let licenseName = licenseTerms.find(function (term) {
                                                return term.attributes.drupal_internal__tid == license
                                            })
                                            licenseOwner = i.attributes.field_community_rights_owner
                                            rightsOptions.push(<option key={i.id} value={i.attributes.drupal_internal__nid}>Name: {i.attributes.title}, License: {licenseName.attributes.name}, Owner: {licenseOwner} </option>)
                                        } else if (i.relationships.field_licenses.data != null && i.relationships.field_find_existing_contributors.data != null && i.attributes.field_community_rights_owner == null) {
                                            license = i.relationships.field_licenses.data.meta.drupal_internal__target_id
                                            let licenseName = licenseTerms.find(function (term) {
                                                return term.attributes.drupal_internal__tid == license
                                            })
                                            licenseOwner = i.relationships.field_find_existing_contributors.data.meta.drupal_internal__target_id
                                            rightsOptions.push(<option key={i.id} value={i.attributes.drupal_internal__nid}>Name: {i.attributes.title}, License: {licenseName.attributes.name}, Owner: {licenseOwner} </option>)
                                        } else if (i.relationships.field_licenses.data != null && i.relationships.field_find_existing_contributors.data == null && i.attributes.field_community_rights_owner == null) {
                                            license = i.relationships.field_licenses.data.meta.drupal_internal__target_id
                                            let licenseName = licenseTerms.find(function (term) {
                                                return term.attributes.drupal_internal__tid == license
                                            })
                                            licenseOwner = 'No license owner'
                                            rightsOptions.push(<option key={i.id} value={i.attributes.drupal_internal__nid}>Name: {i.attributes.title}, License: {licenseName.attributes.name}, Owner: {licenseOwner} </option>)
                                        }
                                    }
                                    tempFields.push(
                                        <div className='rightsLayout' key={field}>
                                            <div className='descriptionLayout' key={'exisitingRights1'}>
                                                <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                    {formData[field].name}
                                                </Text>
                                                <Text fontSize="pReg" color='#716B66'>
                                                    {formData[field].description}
                                                </Text>
                                            </div>
                                            <Select
                                                key={field}
                                                variant='editFormSelect'
                                                onChange={(event) => handleRights("", event)}
                                                defaultValue={"0"}>
                                                {rightsOptions}
                                            </Select>
                                            <Button key={'exisitingRights3'} variant='secondary' onClick={() => handleCreateNewRights(tempFields, "0")}>Add New Rights</Button>
                                        </div>)
                                    resolve()
                                }).catch((error) => {
                                    console.log(error)
                                })
                            })
                        } catch (e) {
                            console.log(e.message);
                            reject()
                        }
                    }))
                    break;
            }
        }
        Promise.all(fieldPromises).then((result) => {
            setFields(tempFields)
            // console.log(tempFields);
        }).catch((error) => {
            console.error(error);
        })
    }, [formData])

    return (
        <div className='form'>
            {fields.map((e) => e)}
            <div className='button-wrapper-form'>
                <Button variant='reg' onClick={create}>Create</Button>
            </div>
        </div>
    )
}

export default CreateForm;