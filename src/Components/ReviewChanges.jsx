import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "./Login"
import { Text, Button } from "@chakra-ui/react"
import FieldGroup from "./FieldGroup"
import { FILEGROUP, PROJECT, SUBPROJECT } from "./EditFormData"
import headphonesBlack from '../images/headphonesBlack.svg'
import imageBlack from '../images/imageBlack.svg'
import videoBlack from '../images/videoBlack.svg'

const ReviewChanges = ({ newData, submitChanges, changedData }) => {
    const encodedCredentials = useContext(AuthContext);
    const [projectTitle, setProjectTitle] = useState();
    const [newSubprojects, setNewSubprojects] = useState();
    const [editedBundles, setEditedBundles] = useState();
    const [editedFileGroups, setEditedFileGroups] = useState();
    const [editedSubProjects, setEditedSubProjects] = useState();

    // newData = {
    //     project: {...},
    //     subprojects: [{...}, {...}, ...],
    // }
    // newData will ONLY have project and subprojects at ALL times because 
    // it will be the only time when new data needs to be processed

    const getProjectInfo = async (changedDataId) => {
        if (newData) {
            for (let data of Object.keys(newData)) {
                if (data == 'project') {
                    try {
                        const response = await axios.get(`https://cedar.arts.ubc.ca/group/${newData[data].gid}?_format=json`, {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        })
                        // console.log(response)
                        setProjectTitle(response.data.label[0].value)
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        } else if (changedDataId) {
            try {
                const response = await axios.get(`https://cedar.arts.ubc.ca/group/${changedDataId}?_format=json`, {
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                })
                // console.log(response)
                setProjectTitle(response.data.label[0].value)
            } catch (e) {
                console.log(e)
            }
        }
    }

    const processNewSubProjects = async () => {
        let tempData = []
        let fgArray = []
        let bundleArray = []
        let filesArray = []
        let processedNewData = {}
        if (newData) {
            for (let data of Object.keys(newData)) {
                if (data == 'subprojects') {
                    for (let item of newData[data]) {
                        processedNewData['subproject'] = item
                        if (item.field_data_asset_group) {
                            for (let filegroup of item.field_data_asset_group) {
                                const response = await axios.get(`https://cedar.arts.ubc.ca/node/${filegroup.target_id}?_format=json`, {
                                    headers: {
                                        Authorization: `Basic ${encodedCredentials.credentials}`,
                                        'X-CSRF-Token': encodedCredentials.csrftoken,
                                    }
                                })
                                fgArray.push(processFileGroupInfo(response.data))
                                processedNewData['filegroup'] = fgArray
                                for (let bundle of fgArray) {
                                    for (let bundleId of bundle.field_assets) {
                                        const response = await axios.get(`https://cedar.arts.ubc.ca/node/${bundleId.target_id}?_format=json`, {
                                            headers: {
                                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                                'X-CSRF-Token': encodedCredentials.csrftoken,
                                            }
                                        })
                                        bundleArray.push(processBundleInfo(response.data))
                                        for (let file of bundleArray) {
                                            const filesResponse = await axios.get(`https://cedar.arts.ubc.ca/jsonapi/node/data_asset_group_homogeneous_/${file.uuid}/field_file_entity2`, {
                                                headers: {
                                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                                }
                                            })
                                            for (let fileName of filesResponse.data.data) {
                                                filesArray.push(fileName.attributes.filename)
                                            }
                                            file.files = filesArray
                                        }
                                    }
                                    processedNewData['bundle'] = bundleArray
                                }
                            }
                        }
                        // console.log(processedNewData)
                        tempData.push(processedNewData)
                    }
                    setNewSubprojects(tempData)
                }
            }
        }
    }

    // changedData = {
    //     project: projectId,
    //     subprojects: [{...}, {...}, ...],
    //     filegroups: [{...}, {...}, ...],
    //     bundles: [{...}, {...}, ...],
    // }
    // If a SUBPROJECT is edited, changedData contains: project, editedSubProjects
    // If a FILE GROUP is edited, changedData contains: project, subproject, editedFileGroups
    // If a BUNDLE is edited, changedData contains: project, subproject, fileGroup, editedBundles

    const processChangedData = () => {
        if (changedData) {
            if (Object.keys(changedData).includes('editedSubProject')) {
                processChangedSubProjects(changedData)
            } else if (Object.keys(changedData).includes('editedFileGroup')) {
                processChangedFileGroups(changedData)
            } else if (Object.keys(changedData).includes('editedBundle')) {
                processChangedBundles(changedData)
            }
        }
    }

    const processChangedSubProjects = async (data) => {
        // console.log(data)
        let processedData = {}
        let tempData = []
        let fgArray = []
        let bundleArray = []
        let filesArray = []
        for (let item of Object.keys(data)) {
            if (item == 'project') {
                getProjectInfo(data[item])
            }
            if (item == 'editedSubProject') {
                // console.log(data[item])
                for (let subproject of data[item]) {
                    processedData['subproject'] = subproject;
                    for (let filegroup of subproject.field_data_asset_group) {
                        // console.log(filegroup)
                        const response = await axios.get(`https://cedar.arts.ubc.ca/node/${filegroup.target_id}?_format=json`, {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        })
                        fgArray.push(processFileGroupInfo(response.data))
                        if (response.data.field_assets.length) {
                            for (let bundle of response.data.field_assets) {
                                const response = await axios.get(`https://cedar.arts.ubc.ca/node/${bundle.target_id}?_format=json`, {
                                    headers: {
                                        Authorization: `Basic ${encodedCredentials.credentials}`,
                                        'X-CSRF-Token': encodedCredentials.csrftoken,
                                    }
                                })
                                bundleArray.push(processBundleInfo(response.data))
                                for (let bundle of bundleArray) {
                                    const filesResponse = await axios.get(`https://cedar.arts.ubc.ca/jsonapi/node/data_asset_group_homogeneous_/${bundle.uuid}/field_file_entity2`, {
                                        headers: {
                                            Authorization: `Basic ${encodedCredentials.credentials}`,
                                            'X-CSRF-Token': encodedCredentials.csrftoken,
                                        }
                                    })
                                    for (let file of filesResponse.data.data) {
                                        filesArray.push(file.attributes.filename)
                                    }
                                    bundle.files = filesArray
                                }
                            }
                        }
                    }
                    processedData['filegroup'] = fgArray
                    processedData['bundle'] = bundleArray
                }
            }
            console.log(processedData)
        }
        tempData.push(processedData)
        console.log(tempData)
        setEditedSubProjects(tempData)
    }

    const processChangedFileGroups = async (data) => {
        let tempData = []
        let bundleArray = []
        let filesArray = []
        let processedData = {}
        for (let item of Object.keys(data)) {
            if (item == 'project') {
                setProjectTitle(data[item].title)
                // getProjectInfo(data[item])
            }
            if (item == 'subprojects') {
                processedData['subproject'] = data[item].data[0]
            }
            if (item == 'editedFileGroup') {
                // console.log(data[item])
                for (let bundle of data[item]) {
                    processedData['filegroup'] = bundle
                    for (let nid of bundle.field_assets) {
                        const response = await axios.get(`https://cedar.arts.ubc.ca/node/${nid.target_id}?_format=json`, {
                            headers: {
                                Authorization: `Basic ${encodedCredentials.credentials}`,
                                'X-CSRF-Token': encodedCredentials.csrftoken,
                            }
                        })
                        bundleArray.push(processBundleInfo(response.data))
                        for (let bundle of bundleArray) {
                            const filesResponse = await axios.get(`https://cedar.arts.ubc.ca/jsonapi/node/data_asset_group_homogeneous_/${bundle.uuid}/field_file_entity2`, {
                                headers: {
                                    Authorization: `Basic ${encodedCredentials.credentials}`,
                                    'X-CSRF-Token': encodedCredentials.csrftoken,
                                }
                            })
                            for (let file of filesResponse.data.data) {
                                filesArray.push(file.attributes.filename)
                            }
                            bundle.files = filesArray
                        }
                        processedData['bundle'] = bundleArray
                    }
                }
            }
            // console.log(processedData)
        }
        tempData.push(processedData)
        setEditedFileGroups(tempData)
    }

    const processChangedBundles = async (data) => {
        let tempData = []
        let filesArray = []
        let processedBundle = {}
        let processedData = {}
        for (let item of Object.keys(data)) {
            if (item == 'project') {
                setProjectTitle(data[item].title)
            }
            if (item == 'subproject') {
                processedData['subproject'] = data[item].data[0]
            }
            if (item == 'filegroup') {
                processedData['filegroup'] = data[item].data[0]
            }
            if (item == 'bundleId') {
                const response = await axios.get(`https://cedar.arts.ubc.ca/jsonapi/node/data_asset_group_homogeneous_/${data[item]}`, {
                    headers: {
                        Authorization: `Basic ${encodedCredentials.credentials}`,
                        'X-CSRF-Token': encodedCredentials.csrftoken,
                    }
                })
                // console.log(response.data.data.attributes.title)
                processedBundle['title'] = response.data.data.attributes.title
            }
            if (item == 'editedBundle') {
                for (let bundle of data[item]) {
                    filesArray.push(bundle.attributes.filename)
                    processedBundle['files'] = filesArray
                }
                // console.log(processedBundle)
            }
            processedData['bundle'] = processedBundle
            // console.log(processedData)
        }
        tempData.push(processedData)
        setEditedBundles(tempData)
    }

    const processFileGroupInfo = (data) => {
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
        return processedData
    }

    const processBundleInfo = (data) => {
        // console.log(data)
        const processedData = {}
        for (let fieldName in data) {
            if (data[fieldName].length > 0) {
                if (fieldName == 'title') {
                    processedData[fieldName] = data[fieldName][0].value
                } else if (fieldName == 'nid') {
                    processedData[fieldName] = data[fieldName][0].value
                } else if (fieldName == 'uuid') {
                    processedData[fieldName] = data[fieldName][0].value
                }
            } else {
                processedData[fieldName] = ""
            }
        }
        // console.log(processedData)
        return processedData
    }

    useEffect(() => {
        getProjectInfo();
        processNewSubProjects();
        processChangedData();
    }, [newData, changedData])

    console.log(projectTitle)

    return (
        <div>
            <Text fontSize='24px' color='#2B2927' fontWeight='700'>Here are the changes you made</Text>
            <Text fontSize='20px' color='#2B2927' fontWeight='700'> Inside the project: {projectTitle}</Text>
            {newSubprojects ? newSubprojects.map((item, index) =>
                <div className='content-review'>
                    <div className='bundle-accordions-panel'>
                        {item.subproject &&
                            <div className='bundle-review-item' key={index}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.subproject.title}</Text>
                                <FieldGroup type={SUBPROJECT} data={[item.subproject]} id={item.subproject.nid}></FieldGroup>
                            </div>
                        }
                        {item.filegroup ? item.filegroup.map((filegroup, index) =>
                            <div className='bundle-review-item' key={index}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{filegroup.title}</Text>
                                <FieldGroup type={FILEGROUP} data={[filegroup]} id={filegroup.nid}></FieldGroup>
                            </div>
                        )
                            : <Text>No File groups added to this Subproject</Text>}
                        {item.bundle ? item.bundle.map((bundle, index) =>
                            <div className='bundle-review-item' key={index}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{bundle.title}</Text>
                                {bundle.files ? bundle.files.map((file) =>
                                    <div className='bundle-accordions-panel-files' key={file}>
                                        {file.slice(-3) == 'png' || file.slice(-3) == 'jpg' || file.slice(-4) == 'jpeg' ? <img src={imageBlack}></img> : null}
                                        {file.slice(-3) == 'wav' ? <img src={headphonesBlack}></img> : null}
                                        {file.slice(-3) == 'mp4' ? <img src={videoBlack}></img> : null}
                                        <Text>{file}</Text>
                                    </div>
                                ) : <Text>No Files uploaded to this Bundle</Text>}
                            </div>
                        )
                            : <Text>No Bundles added to this Subproject</Text>
                        }
                    </div>
                </div>
            ) : null}

            {editedFileGroups ? editedFileGroups.map((item, index) =>
                <div className='content-review'>
                    <div className='bundle-accordions-panel'>
                        <div className='bundle-review-item' key={index}>
                            <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.subproject.title}</Text>
                            <FieldGroup type={SUBPROJECT} data={[item.subproject]} id={item.subproject.nid}></FieldGroup>
                        </div>
                        {item.filegroup ?
                            <div className='bundle-review-item' key={item.filegroup.nid}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.filegroup.title}</Text>
                                <FieldGroup type={FILEGROUP} data={[item.filegroup]} id={item.filegroup.nid}></FieldGroup>
                            </div>
                            :
                            <Text>No File groups added to this Subproject</Text>}
                        {item.bundle ? item.bundle.map((bundle, index) =>
                            <div className='bundle-review-item' key={index}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{bundle.title}</Text>
                                {bundle.files ? bundle.files.map((file) =>
                                    <div className='bundle-accordions-panel-files' key={file}>
                                        {file.slice(-3) == 'png' || file.slice(-3) == 'jpg' || file.slice(-4) == 'jpeg' ? <img src={imageBlack}></img> : null}
                                        {file.slice(-3) == 'wav' ? <img src={headphonesBlack}></img> : null}
                                        {file.slice(-3) == 'mp4' ? <img src={videoBlack}></img> : null}
                                        <Text>{file}</Text>
                                    </div>
                                ) : <Text>No Files uploaded to this Bundle</Text>}
                            </div>
                        ) :
                            <Text>No Bundles added to this Subproject</Text>}
                    </div>
                </div>
            ) : null}

            {editedSubProjects ? editedSubProjects.map((item, index) =>
                <div className='content-review'>
                    <div className='bundle-accordions-panel'>
                        <div className='bundle-review-item' key={index}>
                            <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.subproject.title}</Text>
                            <FieldGroup type={SUBPROJECT} data={[item.subproject]} id={item.subproject.nid}></FieldGroup>
                        </div>
                        {item.filegroup ? item.filegroup.map((filegroup, index) =>
                            <div className='bundle-review-item' key={filegroup.nid}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{filegroup.title}</Text>
                                <FieldGroup type={FILEGROUP} data={[filegroup]} id={filegroup.nid}></FieldGroup>
                            </div>
                        ) :
                            <Text>No File groups added to this Subproject</Text>}
                        {item.bundle ? item.bundle.map((bundle, index) =>
                            <div className='bundle-review-item' key={index}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{bundle.title}</Text>
                                {bundle.files ? bundle.files.map((file) =>
                                    <div className='bundle-accordions-panel-files' key={file}>
                                        {file.slice(-3) == 'png' || file.slice(-3) == 'jpg' || file.slice(-4) == 'jpeg' ? <img src={imageBlack}></img> : null}
                                        {file.slice(-3) == 'wav' ? <img src={headphonesBlack}></img> : null}
                                        {file.slice(-3) == 'mp4' ? <img src={videoBlack}></img> : null}
                                        <Text>{file}</Text>
                                    </div>
                                ) : <Text>No Files uploaded to this Bundle</Text>}
                            </div>
                        ) :
                            <Text>No Bundles added to this Subproject</Text>}
                    </div>
                </div>
            ) : null}

            {editedBundles ? editedBundles.map((item, index) =>
                <div className='content-review'>
                    <div className='bundle-accordions-panel'>
                        <div className='bundle-review-item' key={index}>
                            <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.subproject.title}</Text>
                            <FieldGroup type={SUBPROJECT} data={[item.subproject]} id={item.subproject.nid}></FieldGroup>
                        </div>
                        {item.filegroup ?
                            <div className='bundle-review-item' key={item.filegroup.nid}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.filegroup.title}</Text>
                                <FieldGroup type={FILEGROUP} data={[item.filegroup]} id={item.filegroup.nid}></FieldGroup>
                            </div>
                            :
                            <Text>No File groups added to this Subproject</Text>}
                        {item.bundle ?
                            <div className='bundle-review-item' key={index}>
                                <Text fontSize='20px' color='#2B2927' fontWeight='700'>{item.bundle.title}</Text>
                                {item.bundle.files.map((file) =>
                                    <div className='bundle-accordions-panel-files' key={file}>
                                        {file.slice(-3) == 'png' || file.slice(-3) == 'jpg' || file.slice(-4) == 'jpeg' ? <img src={imageBlack}></img> : null}
                                        {file.slice(-3) == 'wav' ? <img src={headphonesBlack}></img> : null}
                                        {file.slice(-3) == 'mp4' ? <img src={videoBlack}></img> : null}
                                        <Text>{file}</Text>
                                    </div>
                                )}
                            </div>
                            :
                            <Text>No Bundles added to this Subproject</Text>}
                    </div>
                </div >
            ) : null}

            <div className='button-wrapper'>
                <div className='button-wrapper-stretch'>
                </div>
                <Button variant='secondary' onClick={submitChanges}>Confirm</Button>
            </div>
        </div >
    )
}

export default ReviewChanges