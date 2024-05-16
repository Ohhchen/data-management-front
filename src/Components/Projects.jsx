import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { RefreshContext } from './Main';
import './styles/TabItems.css';
import {
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
    HStack,
} from '@chakra-ui/react'
import line from '../images/line.svg'
import Fields from './Fields';

const Projects = ({selectProject}) => {
    const encodedCredentials = useContext(AuthContext);
    const refreshValue = useContext(RefreshContext)
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState();
    const fetchProjects = async () => {
        // console.log(encodedCredentials);
        try {
            await axios.get(
                `https://cedar.arts.ubc.ca/workspace?_format=json`, {
                withCredentials: true,
                headers: {
                    Authorization: `Basic ${encodedCredentials.credentials}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-Token': encodedCredentials.jwttoken,
                }
            }
            ).then((response) => {
                setProjects(response.data);
                console.log(response);
            })
        } catch (e) {
            console.log(e.message);
        }
    }

    useEffect(() => {
        fetchProjects();
    },[refreshValue])
    
    return (
        <div className='tab-items-container'>
            {/* <h2>Projects Component</h2> */}
            <List variant='custom'>
                {projects.map((project) => {
                    return <HStack key={project.id[0].value}>
                        <ListItem 
                            className={(project.id[0].value == selectedProject ? 'active-item': '' )} 
                            onClick={()=> { 
                                selectProject(project.id[0].value); 
                                setSelectedProject(project.id[0].value); 
                            }} 
                            key={project.id[0].value}>
                            <div className='label-container'>
                                {project.label[0].value}
                            </div>
                            {project.id[0].value == selectedProject ? <img src={line}/> : null}
                        </ListItem>
                    </HStack>
                })}
            </List>
        </div>
    );
};

export default Projects;