import React, {useContext, useEffect, useState} from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { HStack, List, ListItem } from '@chakra-ui/react';
import line from '../images/line.svg'
import Fields from './Fields';
import { RefreshContext } from './Main';

const SubProjects = ({projectId, selectSubProject}) => {
    const encodedCredentials = useContext(AuthContext);
    const refreshValue = useContext(RefreshContext)
    const [subProjects, setSubProjects] = useState([]);
    const [selectedSubproject, setSelectedSubproject] = useState();
    const fetchSubProjects = async () => {
        try {
            const response = await axios.get(
                `https://cedar.arts.ubc.ca/collections?_format=json&workspace=${projectId}`, {
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    //'X-CSRF-Token': encodedCredentials.csrftoken,
                }
            }
            );
            setSubProjects(response.data);
            console.log(response.data);
        } catch (e) {
            console.log(e.message);
        }
    }
    useEffect(() => {

        fetchSubProjects();
    },[projectId, refreshValue])
    return (
        <div className='tab-items-container'>
            {/* <h2>Sub-Projects Component</h2> */}
            {subProjects.length < 1? <p>Please select a Project to browse Sub-Projects</p>: null}
            <List variant='custom'>
                {subProjects.map((project) => {
                        return <HStack key={project.nid[0].value} >
                            <ListItem
                                className={(project.nid[0].value == selectedSubproject ? 'active-item': '' )} 
                                onClick={() => {
                                    selectSubProject(project.nid[0].value); 
                                    setSelectedSubproject(project.nid[0].value)}} 
                                key={project.nid[0].value}>
                                <div className='label-container'>
                                    {project.title[0].value}
                                </div>
                                {project.nid[0].value == selectedSubproject ? <img src={line}/> : null}
                        </ListItem>
                        </HStack> 
                    })}
            </List>
        </div>
        //TODO: debug overpopulated subprojects (happens only at Test Project 4)
    );
};

export default SubProjects;