import React, { useState, useEffect, useContext } from 'react';
import Projects from './Projects';
import SubProjects from './SubProjects';
import FileGroups from './FileGroups';
import './styles/TabContent.css';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { RefreshContext } from './Main';

const TabContent = ({ setSelection }) => {
  const [projectId, setProjectId] = useState('');
  const [subProjectId, setSubProjectId] = useState('');
  const [fileGroupId, setFileGroupId] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const refreshValue = useContext(RefreshContext)

  const selectProject = (id) => {
    setProjectId(id);
    setTabIndex(1);
    setSelection({ projectId: id })
  }

  const selectSubProject = (id) => {
    setSubProjectId(id);
    setTabIndex(2);
    setSelection({ projectId, subProjectId: id })
  }

  const selectFileGroup = (id) => {
    setFileGroupId(id);
    setSelection({ projectId, subProjectId, fileGroupId: id })
  }

  return (
    
    <div className='tab-main-container'>
      <Tabs variant='custom' index={tabIndex}>
        <TabList>
          <Tab onClick={() => setTabIndex(0)}>
            Projects
          </Tab>
          <Tab onClick={() => setTabIndex(1)}>
            Sub-Projects
          </Tab>
          <Tab onClick={() => setTabIndex(2)}>
            File Groups
          </Tab>
        </TabList>
        <TabPanels className='tab-panels'>
          <TabPanel>
            <Projects selectProject={selectProject} />
          </TabPanel>
          <TabPanel>
            <SubProjects projectId={projectId} selectSubProject={selectSubProject} />
          </TabPanel>
          <TabPanel>
            <FileGroups projectid={projectId} subProjectId={subProjectId} selectFileGroup={selectFileGroup} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export {TabContent};