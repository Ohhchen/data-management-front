import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { EditFormData } from './EditFormData';
import CreateContributor from './CreateContributor';
import { Input, Select, Text, Button } from '@chakra-ui/react'
import { RefreshContext } from './Main.jsx';
import "react-datepicker/dist/react-datepicker.css";
import './styles/EditForm.css'
import calendar from '../images/calendar.svg'
import CreateRights from './CreateRights.jsx';


const EditForm = ({ type, data, id, disableEditMode }) => {
    const refreshValue = useContext(RefreshContext)
    const encodedCredentials = useContext(AuthContext);
    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])
    const [changesSubmitted, setChangesSubmitted] = useState(false)

    // field values
    const [label, setLabel] = useState('')
    const [titleValue, setTitleValue] = useState('')
    const [descriptionValue, setDescriptionValue] = useState('')
    const [fundingValue, setFundingValue] = useState('')
    const [agreementValue, setAgreementValue] = useState('')
    const [sourceValue, setSourceValue] = useState('')
    const [relationValue, setRelationValue] = useState('')
    const [subjectsValue, setSubjectsValue] = useState('')
    const [subjectsGeoValue, setSubjectsGeoValue] = useState('')
    const [statusValue, setStatusValue] = useState("")
    const [formatValue, setFormatValue] = useState("")
    const [typeValue, setTypeValue] = useState("")
    const [langValue, setLangValue] = useState("")
    const [dateTime, setDateTime] = useState()
    const [contributorValue, setContributorValue] = useState({})
    const [rightsValue, setRightsValue] = useState()

    useEffect(() => {
        setFormData(EditFormData[type])
    }, [type, data, id])

    const handleTextChange = (element, event) => {
        switch (element) {
            case 'field_description':
                // console.log(event.target.value)
                setDescriptionValue(event.target.value ? event.target.value : descriptionValue)
                break;
            case 'field_funding':
                // console.log(event.target.value)
                setFundingValue(event.target.value ? event.target.value : fundingValue)
                break;
            case 'field_agreement':
                // console.log(event.target.value)
                setAgreementValue(event.target.value ? event.target.value : agreementValue)
                break;
            case 'title':
                // console.log(event.target.value)
                setTitleValue(event.target.value ? event.target.value : titleValue)
                break;
            case 'label':
                // console.log(event.target.value)
                setLabel(event.target.value ? event.target.value : label)
                break;
            case 'field_source':
                // console.log(event.target.value)
                setSourceValue(event.target.value)
                break;
            case 'field_relation':
                // console.log(event.target.value)
                setRelationValue(event.target.value)
                break;
            case 'field_subjects':
                // console.log(event.target.value)
                setSubjectsValue(event.target.value)
                break;
            case 'field_subjects_geographic':
                // console.log(event.target.value)
                setSubjectsGeoValue(event.target.value)
                break;
        }
    }

    const handleDateChange = (event) => {
        let date = new Date(event.target.value)
        let toString = date.toISOString()
        let reformattedDate = toString.replace('.000Z', '+0200')
        setDateTime(event.target.value ? reformattedDate : dateTime)
    }

    const handleStatusChange = (event) => {
        setStatusValue(event.target.value ? event.target.value : statusValue)
    }

    const handleFormatChange = (event) => {
        setFormatValue(event.target.value ? event.target.value : formatValue)
    }

    const handleTypeChange = (event) => {
        setTypeValue(event.target.value ? event.target.value : typeValue)
    }

    const handleLangChange = (event) => {
        setLangValue(event.target.value ? event.target.value : langValue)
    }

    const handleContributor = (selected, changed) => {
        // selected = initial nids and if selected on change gotten, selected = newly selected nid
        // changed = the nid of the select element that got changed
        fetch("https://cedar.arts.ubc.ca/jsonapi/node/contributor_s_", {
            headers: {
                Authorization: `Basic ${encodedCredentials.credentials}`,
                'X-CSRF-Token': encodedCredentials.csrftoken,
            }
        }).then((result) => {
            return result.json()
        }).then((contributors) => {
            let contribResults = contributors.data
            if (changed === null) {
                //construct initial value for contributors
                // if selected == ['0'], initialContributor = { 0 : {} }
                // if selected == ['123'], initialContributor = { 123: { newContrib }}
                // if selected == ['123', '456', ...], 
                // initialContributor = {
                //      123: { newContrib }, 456: { newContrib }, ...
                // }
                let initialContributors = {};
                for (let selectedContributor in selected) {
                    if (selected[selectedContributor] === '0') {
                        initialContributors[selected[selectedContributor]] = {}
                        setContributorValue(initialContributors)
                    } else {
                        let newContrib = contribResults.find(function (contrib) {
                            return contrib.attributes.drupal_internal__nid == selected[selectedContributor]
                        })
                        initialContributors[selected[selectedContributor]] = {
                            target_id: newContrib.attributes.drupal_internal__nid,
                            target_type: 'node',
                            target_uuid: newContrib.id,
                            url: `/node/${newContrib.attributes.drupal_internal__nid}`
                        }
                        setContributorValue(initialContributors)
                    }
                }
                console.log(initialContributors)
            } else {
                // initial contributor state already set, onchange for select clicked
                // delete 'changed' and replace with 'selected'
                // selected != null 
                // changed could == null
                // contributorValue could be : { 0: {} } OR { 123: newContrib } OR { 123: newContrib, 456: newContrib, ...}
                let tempContributorValue = contributorValue
                for (let selectedContributor in selected) {
                    delete tempContributorValue[changed]
                    if (selected[selectedContributor] === '0') continue;
                    let newContrib = contribResults.find(function (contrib) {
                        return contrib.attributes.drupal_internal__nid == selected[selectedContributor]
                    })
                    tempContributorValue[selected[selectedContributor]] = {
                        target_id: newContrib.attributes.drupal_internal__nid,
                        target_type: 'node',
                        target_uuid: newContrib.id,
                        url: `/node/${newContrib.attributes.drupal_internal__nid}`
                    }
                }
                setContributorValue(tempContributorValue);
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const handleCreateNewContributor = (tempFields) => {
        let addContributor = tempFields.splice(11, 0, <CreateContributor disableCreateNewContributor={() => disableAddContributor(tempFields)} newContributor={handleContributor} />)
        setFields([...tempFields, addContributor]);
    }

    const disableAddContributor = (tempFields) => {
        // console.log(tempFields);
        tempFields.splice(11, 1)
        setFields(tempFields)
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
                setRightsValue({
                    target_id: selectedRights.attributes.drupal_internal__nid,
                    target_type: 'node',
                    target_uuid: selectedRights.id,
                    url: `/node/${selectedRights.attributes.drupal_internal__nid}`
                })
            } else {
                if (element == '' && event == undefined) {
                    // if there is currently no rights node attached to the file group
                    // and selection is not changed
                    setRightsValue('0')
                } else if (element != '' && event == undefined) {
                    // if there is only a single rights node attached to the file group
                    // and selection is not changed
                    let selectedRights = rightsNodes.find(function (right) {
                        return right.attributes.drupal_internal__nid == element
                    })
                    setRightsValue({
                        target_id: selectedRights.attributes.drupal_internal__nid,
                        target_type: 'node',
                        target_uuid: selectedRights.id,
                        url: `/node/${selectedRights.attributes.drupal_internal__nid}`
                    })
                } else if (element != '' && event != undefined) {
                    // if there is only a single rights node attached to the file group
                    // and selection has been changed
                    let selectedRights = rightsNodes.find(function (right) {
                        return right.attributes.drupal_internal__nid == event.target.value
                    })
                    setRightsValue({
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

    const handleCreateNewRights = (tempFields, newNid) => {
        let addRights = tempFields.splice(10, 0, <CreateRights disableCreateNewRights={() => disableAddRights(tempFields)} newRights={handleRights} />)
        setFields([...tempFields, addRights]);
    }

    const disableAddRights = (tempFields) => {
        // console.log(tempFields);
        tempFields.splice(10, 1)
        setFields(tempFields)
    }

    const handleSubmit = async () => {
        //based on type, send PATCH request to cedar.arts.ubc.ca
        //pass in information stored in the fields variables, format it based on EditFormdata
        switch (type) {
            case 0:
                console.log('patch request to projects')
                await axios.patch(`https://cedar.arts.ubc.ca/group/${id}?_format=json`, {
                    'type': [{
                        target_id: 'cedar_projects'
                    }],
                    'label': [{
                        value: label
                    }],
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                }).then((response) => {
                    console.log(response)
                    setChangesSubmitted(true)
                    refreshValue()
                }).catch((error) => {
                    console.log(error)
                })
                break;
            case 2:
                console.log('patch request to subprojects')
                await axios.patch(`https://cedar.arts.ubc.ca/node/${id}?_format=json`, {
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
                    }],
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                }).then((response) => {
                    console.log(response)
                    refreshValue()
                    setChangesSubmitted(true)
                }).catch((error) => {
                    console.log(error)
                })
                break;
            case 4:
                console.log('patch request to filegroups')
                console.log(contributorValue);
                let contributorResult = Object.values(contributorValue);
                axios.patch(`https://cedar.arts.ubc.ca/node/${id}?_format=json`, {
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
                    "field_date": {
                        value: dateTime
                    },
                    'field_digital_content_format_new': [{
                        target_id: formatValue
                    }],
                    'field_digital_content_type_new_': [{
                        target_id: typeValue
                    }],
                    'field_languages_new_': [{
                        target_id: langValue
                    }],
                    'field_contributor_s_': contributorResult,
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
                }).then((response) => {
                    setChangesSubmitted(true)
                    refreshValue()
                    console.log(response.data)
                }).catch((error) => {
                    console.log(error)
                })
                break;
            case 6:
                console.log('patch request to files')
                break;
        }
    }

    useEffect(() => {
        // console.log(formData)
        let tempFields = []
        let fieldPromises = [];
        for (let element of Object.keys(formData)) {
            // console.log(element)
            if (data[0].hasOwnProperty(element)) {
                switch (formData[element].type) {
                    case 'text':
                        if (element == 'title') {
                            setTitleValue(data[0][element])
                        } else if (element == 'label') {
                            setLabel(data[0][element][0].value)
                        } else if (element == 'field_funding') {
                            setFundingValue(data[0][element])
                        } else if (element == 'field_description') {
                            setDescriptionValue(descriptionValue)
                        } else if (element == 'field_agreement') {
                            setAgreementValue(data[0][element])
                        } else if (element == 'field_subjects') {
                            setSubjectsValue(data[0][element])
                        } else if (element == 'field_relation') {
                            setRelationValue(data[0][element])
                        } else if (element == 'field_subjects_geographic') {
                            setSubjectsGeoValue(data[0][element])
                        } else if (element == 'field_source') {
                            setSourceValue(data[0][element])
                        }
                        tempFields.push(
                            <div className='inputLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                <div className='descriptionLayout'>
                                    <Text fontSize="h3" fontWeight='700' color='#2B2927' >
                                        {formData[element].name}
                                    </Text>
                                    <Text fontSize="pReg" color='#716B66'>
                                        {formData[element].description}
                                    </Text>
                                </div>
                                <Input
                                    onChange={(event) => handleTextChange(element, event)}
                                    key={data[0][element]}
                                    variant='editFormText'
                                    defaultValue={element == "label" ? data[0][element][0].value : data[0][element]}>
                                </Input>
                            </div>)
                        break;
                    case 'date':
                        let date = new Date(data[0][element])
                        let toString = date.toISOString()
                        let reformattedDate = toString.replace('.000Z', '+0200')
                        setDateTime(reformattedDate)
                        tempFields.push(
                            <div className="datePickerLayout" key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                <div className='descriptionLayout'>
                                    <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                        {formData[element].name}
                                    </Text>
                                    <Text fontSize="pReg" color='#716B66'>
                                        {formData[element].description}
                                    </Text>
                                </div>
                                <Input
                                    key={data[0][element]}
                                    variant='editFormText'
                                    type='datetime-local'
                                    defaultValue={data[0][element]}
                                    onChange={handleDateChange} />
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
                                if (data[0][element] == '') {
                                    setStatusValue('0')
                                }
                                tempFields.push(
                                    <div className='selectLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                        <div className='descriptionLayout'>
                                            <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                {formData[element].name}
                                            </Text>
                                            <Text fontSize="pReg" color='#716B66'>
                                                {formData[element].description}
                                            </Text>
                                        </div>
                                        <Select
                                            variant='editFormSelect'
                                            key={data[0][element]}
                                            defaultValue={data[0][element]}
                                            onChange={handleStatusChange} >
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
                    case 'selectFormat':
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
                                if (data[0][element] == '') {
                                    setFormatValue('0')
                                }
                                // console.log(options)
                                tempFields.push(
                                    <div className='selectLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                        <div className='descriptionLayout'>
                                            <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                {formData[element].name}
                                            </Text>
                                            <Text fontSize="pReg" color='#716B66'>
                                                {formData[element].description}
                                            </Text>
                                        </div>
                                        <Select
                                            variant='editFormSelect'
                                            key={data[0][element]}
                                            defaultValue={data[0][element]}
                                            onChange={handleFormatChange} >
                                            {formatOptions}
                                        </Select>
                                    </div>)
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                    case 'selectType':
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
                                if (data[0][element] == '') {
                                    setTypeValue('0')
                                }
                                tempFields.push(
                                    <div className='selectLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                        <div className='descriptionLayout'>
                                            <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                {formData[element].name}
                                            </Text>
                                            <Text fontSize="pReg" color='#716B66'>
                                                {formData[element].description}
                                            </Text>
                                        </div>
                                        <Select
                                            variant='editFormSelect'
                                            key={data[0][element]}
                                            defaultValue={data[0][element]}
                                            onChange={handleTypeChange} >
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
                    case 'selectLang':
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
                                if (data[0][element] == '') {
                                    setLangValue('0')
                                }
                                tempFields.push(
                                    <div className='selectLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                        <div className='descriptionLayout'>
                                            <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                {formData[element].name}
                                            </Text>
                                            <Text fontSize="pReg" color='#716B66'>
                                                {formData[element].description}
                                            </Text>
                                        </div>
                                        <Select
                                            variant='editFormSelect'
                                            key={data[0][element]}
                                            defaultValue={data[0][element]}
                                            onChange={handleLangChange} >
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
                    case 'contributors':
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
                                    // 'https://cedar.arts.ubc.ca/contributorNodes?_format=json'
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
                                        // processing the contributor data
                                        let elementArray = [data[0][element]]
                                        for (let node in elementArray) {
                                            if (elementArray[node] === '') {
                                                // if there are no contributor nid
                                                elementArray[node] = '0'
                                            } else if (elementArray[node].indexOf(',') != -1) {
                                                // if there more than one contributor nids
                                                let multipleContrib = elementArray[node].split(',')
                                                elementArray.splice(0, 1)
                                                for (let id in multipleContrib) {
                                                    elementArray.push(multipleContrib[id].trim())
                                                }
                                            }
                                        }
                                        let contribOptionsKeys = contribOptions.map((e) => e.key)
                                        let match = contribOptionsKeys.filter(element => elementArray.includes(element))
                                        handleContributor(elementArray, null) // ['123','345']
                                        tempFields.push(
                                            <div className='contributorLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                                <div className='descriptionLayout' key={'exisitingContrib1'}>
                                                    <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                        {formData[element].name}
                                                    </Text>
                                                    <Text fontSize="pReg" color='#716B66'>
                                                        {formData[element].description}
                                                    </Text>
                                                </div>
                                                {match.map((e) =>
                                                    <Select
                                                        key={e}
                                                        id={e}
                                                        variant='editFormSelect'
                                                        defaultValue={e}
                                                        onChange={(event) => { handleContributor([event.target.value], e) }} >
                                                        {contribOptions}
                                                    </Select>
                                                )}
                                                <Button key={'exisitingContrib3'} variant='secondary' onClick={() => handleCreateNewContributor(tempFields)}>Add a New Contributor</Button>
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
                    case 'rights':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            handleRights(data[0][element])
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
                                        let rightsNodes = rights.data
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
                                            <div className='rightsLayout' key={data[0][element] == '' ? formData[element].name : data[0][element]}>
                                                <div className='descriptionLayout' key={'exisitingRights1'}>
                                                    <Text fontSize="h3" fontWeight='700' color='#2B2927'>
                                                        {formData[element].name}
                                                    </Text>
                                                    <Text fontSize="pReg" color='#716B66'>
                                                        {formData[element].description}
                                                    </Text>
                                                </div>
                                                <Select
                                                    key={'exisitingRights2'}
                                                    variant='editFormSelect'
                                                    defaultValue={data[0][element]}
                                                    onChange={(event) => handleRights(data[0][element], event)} >
                                                    {rightsOptions}
                                                </Select>
                                                <Button key={'exisitingRights3'} variant='secondary' onClick={() => handleCreateNewRights(tempFields, data[0][element])}>Add New Rights</Button>
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
        }
        Promise.all(fieldPromises).then((result) => {
            setFields(tempFields)
            // console.log(tempFields);
        }).catch((error) => {
            console.error(error);
        })
    }, [formData])

    return (<>{changesSubmitted ?
        <div className='delete'>
            <div className='dialog-header'>
                <Text fontSize='h3' fontWeight='700'>Your changes has been captured!</Text>
                <Button variant='reg' onClick={disableEditMode}>Done</Button>
            </div>
        </div>
        :
        <div className='editFormContainer'>
            {fields.map((e) => e)}
            <div className='button-wrapper-editForm'>
                <Button variant='secondary' onClick={handleSubmit}>Save Changes</Button>
                <Button variant='reg' onClick={disableEditMode}>Cancel</Button>
            </div>
        </div>
    }</>)
}

export default EditForm;