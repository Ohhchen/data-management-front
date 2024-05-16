import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { EditFormData } from './EditFormData';
import { List, ListIcon, ListItem, Text } from '@chakra-ui/react';

const FieldGroup = ({ type, data, id, editSubmitted }) => {
    const encodedCredentials = useContext(AuthContext);
    const [formData, setFormData] = useState({})
    const [fields, setFields] = useState([])
    const [statusName, setStatusName] = useState()
    const [formatName, setFormatName] = useState()
    const [typeName, setTypeName] = useState()
    const [langName, setLangName] = useState()
    const [rightsName, setRightsName] = useState()
    const [contributorName, setContributorName] = useState()

    useEffect(() => {
        setFormData(EditFormData[type])
    }, [type, data, id])

    // const responseParser = (element) => {
    //     //parse json responses that come with html elements as strings and grabs the text
    //     const parser = new DOMParser();
    //     var text = parser.parseFromString(element, 'text/html');
    //     if (text.body.children.length > 1) {
    //         let childElements = [];
    //         for (let childElement = 0; childElement < text.body.childElementCount; childElement++) {
    //             childElements.push(text.body.children[childElement].textContent);
    //             // console.log(childElements);
    //         }
    //         return (childElements);
    //     } else if (text.children.length === 1 && text.body.firstChild == null) {
    //         return (null);
    //     } else if (text.children.length === 1 && text.body.firstChild != null) {
    //         // console.log(text.children.length);
    //         // console.log(text);
    //         return (text.body.firstChild.textContent);
    //     }
    // }

    useEffect(() => {
        // console.log(formData)
        // console.log(data)
        let tempFields = []
        let fieldPromises = []
        for (let element of Object.keys(formData)) {
            if (data[0].hasOwnProperty(element) && element != 'title') {
                switch (formData[element].type) {
                    // console.log('adding fields')
                    // console.log(formData[element])
                    case 'text':
                        if (data[0].label == undefined) {
                            tempFields.push(<>
                                <List variant='metadata' key={data[0][element]}>
                                    <ListItem>
                                        <div className='h4-stretcher'>
                                            <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                        </div>
                                        <Text fontSize='pReg'>{data[0][element]}</Text>
                                    </ListItem>
                                </List></>)
                        } else {
                            tempFields.push(<>
                                <List variant='metadata' key={data[0].label[0].value}>
                                    <ListItem>
                                        <div className='h4-stretcher'>
                                            <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                        </div>
                                        <Text fontSize='pReg'>{data[0].label[0].value}</Text>
                                    </ListItem>
                                </List></>)
                        }
                        break;
                    case 'urlProject':
                        tempFields.push(<>
                            <List variant='metadata' key={data[0][element]}>
                                <ListItem>
                                    <div className='h4-stretcher'>
                                        <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                    </div>
                                    <Text fontSize='pReg'>{formData[element].prefix}{data[0][element][0].value}</Text>
                                </ListItem>
                            </List></>)
                        break;
                    case 'parse':
                    case 'url':
                        tempFields.push(<>
                            <List variant='metadata' key={data[0][element]}>
                                <ListItem>
                                    <div className='h4-stretcher'>
                                        <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                    </div>
                                    <Text fontSize='pReg'>{formData[element].prefix}{data[0][element]}</Text>
                                </ListItem>
                            </List></>)
                        break;
                    case 'selectStatus':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            setStatusName(data[0][element]);
                            fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/status?page[limit]=1000", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((statusResult) => {
                                return statusResult.json()
                            }).then((status) => {
                                let statusResponse = status.data
                                if (data[0][element] == '') {
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{statusName}</Text>
                                            </ListItem>
                                        </List></>)
                                } else {
                                    let statuses = statusResponse.find(function (status) {
                                        return status.attributes.drupal_internal__tid == data[0][element]
                                    })
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{statuses.attributes.name}</Text>
                                            </ListItem>
                                        </List></>)
                                }
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                    case 'selectFormat':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            setFormatName(data[0][element]);
                            fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/format?page[limit]=1000", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((formatResult) => {
                                return formatResult.json()
                            }).then((format) => {
                                let formatResponse = format.data
                                if (data[0][element] == '') {
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{formatName}</Text>
                                            </ListItem>
                                        </List></>)
                                } else {
                                    let formats = formatResponse.find(function (format) {
                                        return format.attributes.drupal_internal__tid == data[0][element]
                                    })
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{formats.attributes.name}</Text>
                                            </ListItem>
                                        </List></>)
                                }
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                    case 'selectType':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            setTypeName(data[0][element]);
                            fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/type?page[limit]=1000", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((typeResult) => {
                                return typeResult.json()
                            }).then((type) => {
                                let typeResponse = type.data
                                if (data[0][element] == '') {
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{typeName}</Text>
                                            </ListItem>
                                        </List></>)
                                } else {
                                    let types = typeResponse.find(function (type) {
                                        return type.attributes.drupal_internal__tid == data[0][element]
                                    })
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{types.attributes.name}</Text>
                                            </ListItem>
                                        </List></>)
                                }
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                    case 'selectLang':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            setLangName(data[0][element]);
                            fetch("https://cedar.arts.ubc.ca/jsonapi/taxonomy_term/languages?page[limit]=1000", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((langResult) => {
                                return langResult.json()
                            }).then((lang) => {
                                let langResponse = lang.data
                                if (data[0][element] == '') {
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{langName}</Text>
                                            </ListItem>
                                        </List></>)
                                } else {
                                    let language = langResponse.find(function (lang) {
                                        return lang.attributes.drupal_internal__tid == data[0][element]
                                    })
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{language.attributes.name}</Text>
                                            </ListItem>
                                        </List></>)
                                }
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                    case 'date':
                        tempFields.push(<>
                            <List variant='metadata'>
                                <ListItem key={data[0][element]}>
                                    <div className='h4-stretcher'>
                                        <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                    </div>
                                    <Text fontSize='pReg'>{data[0][element]}</Text>
                                </ListItem>
                            </List></>)
                        break;
                    case 'contributors':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            setContributorName(data[0][element]);
                            fetch("https://cedar.arts.ubc.ca/jsonapi/node/contributor_s_", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((contribResult) => {
                                return contribResult.json()
                            }).then((contrib) => {
                                let contribResponse = contrib.data
                                let splitContribName = []
                                if (data[0][element].match(',') != null) {
                                    let splitContrib = data[0][element].split(',')
                                    for (let node in splitContrib) {
                                        let removeSpace = splitContrib[node].replace(' ', '')
                                        let contribName = contribResponse.find(function (contributor) {
                                            return contributor.attributes.drupal_internal__nid == removeSpace
                                        })
                                        splitContribName.push(contribName)
                                    }
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} key={data[0][element]}>
                                                    {splitContribName.map((e) => e == undefined ? null : <Text fontSize='pReg' key={e.attributes.title}>{e.attributes.title}</Text>)}
                                                </div>
                                            </ListItem>
                                        </List></>)
                                } else if (data[0][element] == '') {
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{contributorName}</Text>
                                            </ListItem>
                                        </List></>)
                                } else {
                                    let contribName = contribResponse.find(function (contributor) {
                                        return contributor.attributes.drupal_internal__nid == data[0][element]
                                    })
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{contribName.attributes.title}</Text>
                                            </ListItem>
                                        </List></>)
                                }
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                    case 'rights':
                        fieldPromises.push(new Promise((resolve, reject) => {
                            setRightsName(data[0][element]);
                            fetch("https://cedar.arts.ubc.ca/jsonapi/node/rights", {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            }).then((rightsResult) => {
                                return rightsResult.json()
                            }).then((right) => {
                                let rightsResponse = right.data
                                if (data[0][element] == '') {
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{rightsName}</Text>
                                            </ListItem>
                                        </List></>)
                                } else {
                                    let rightName = rightsResponse.find(function (right) {
                                        return right.attributes.drupal_internal__nid == data[0][element]
                                    })
                                    tempFields.push(<>
                                        <List variant='metadata'>
                                            <ListItem key={data[0][element]}>
                                                <div className='h4-stretcher'>
                                                    <Text fontSize='h4' fontWeight='500'>{formData[element].name}</Text>
                                                </div>
                                                <Text fontSize='pReg'>{rightName.attributes.title}</Text>
                                            </ListItem>
                                        </List></>)
                                }
                                resolve();
                            }).catch((error) => {
                                console.log(error)
                                reject();
                            })
                        }))
                        break;
                }
            }
        }
        // for (let element of Object.keys(formData)) {
        //     if (data[0].hasOwnProperty(element) && element != 'title') {
        // for (let element in data[0]) {
        //     console.log(element)
        //     if (formData.hasOwnProperty(element) && element != 'title') {
        //         // console.log('adding fields')
        //         // console.log(formData[element])
        //         // console.log(formData)
        //     }
        // }
        Promise.all(fieldPromises).then((result) => {
            setFields(tempFields)
        }).catch((error) => {
            console.error(error);
        })
    }, [formData, editSubmitted])
    return <List>
        {fields.map((e) => e)}
    </List>
}

export default FieldGroup;