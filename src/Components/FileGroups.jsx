import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './Login';
import { List, ListItem } from '@chakra-ui/react';
import line from '../images/line.svg'
import Fields from './Fields';
import { RefreshContext } from './Main';

const FileGroups = ({ projectId, subProjectId, selectFileGroup }) => {
  const encodedCredentials = useContext(AuthContext);
  const refreshValue = useContext(RefreshContext)
  const [fileGroups, setFileGroups] = useState([]);
  const [selectedFilegroup, setSelectedFilegroup] = useState();
  const fetchFileGroups = async () => {
    try {
      const response = await axios.get(
        `https://cedar.arts.ubc.ca/filegroup?_format=json&workspace=${projectId}&collection=${subProjectId}`, {
        headers: {
          Authorization: `Basic ${encodedCredentials.credentials}`,
          //'X-CSRF-Token': encodedCredentials.jwttoken,
        }
      }
      );

      // console.log(response.data);
      // if (response.code != 200) {
      //   throw new Error("problem requesting for filegroups")
      // }
      setFileGroups(response.data);
    } catch (e) {
      console.log(e.message);
    }
  }
  useEffect(() => {
    fetchFileGroups();
  }, [projectId, subProjectId, refreshValue])

  return (
    <div className='tab-items-container'>
      {/* <h2>File Groups Component</h2> */}
      {fileGroups.length < 1 ? <p>Please select a Sub-Project to browse File Groups</p> : null}
      <List variant='custom'>
        {fileGroups ? fileGroups.map((fg) => {
          return <ListItem
            className={(fg.nid[0].value == selectedFilegroup ? 'active-item' : '')}
            onClick={() => {
              selectFileGroup(fg.nid[0].value);
              setSelectedFilegroup(fg.nid[0].value)
            }}
            key={fg.title[0].value}>
            <div className='label-container'>
              {fg.title[0].value}
            </div>
            {fg.nid[0].value == selectedFilegroup ? <img src={line} /> : null}
          </ListItem>
        }) : null}
      </List>
    </div>
  );
};

export default FileGroups;