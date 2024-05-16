import React, { useState, createContext, useEffect } from 'react';
import { TabContent } from './TabContent';
import NewWindow from 'react-new-window';
import Files from './Files';
import Fields from './Fields';
import ContentMap from './ContentMap';
import FilePreview from './FilePreview';
import FileWizard from './FileWizard';
import { Button } from '@chakra-ui/react';
import './styles/Main.css';

const dataContext = createContext();
const RefreshContext = createContext();

const Main = () => {
  const [openNewWindow, setOpenNewWindow] = useState(false);
  const [selection, setSelection] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [fileGroups, setFileGroups] = useState([]);
  const [bundle, setBundle] = useState();
  const [files, setFiles] = useState([]);
  const [currentBundle, setCurrentBundle] = useState([]);
  const [permission, setPermission] = useState('');
  const [refreshValue, setRefreshValue] = useState(1);
  const [fileUri, setFileUri] = useState()

  const selectFile = (fid) => {
    setSelection({ ...selection, fid });
  };
  const enableEditMode = () => {
    setEditMode(true);
  };
  const disableEditMode = () => {
    setEditMode(false);
  };

  function handleClick() {
    setOpenNewWindow(true);
  }

  function closeFileWizard() {
    setOpenNewWindow(false)
  }

  const selectedUri = (uri) => {
    setFileUri(uri);
  };

  return (
    <RefreshContext.Provider value={() => { setRefreshValue(refreshValue + 1) }}>
      <dataContext.Provider
        value={{
          projects: projects,
          subProjects: subProjects,
          fileGroups: fileGroups,
          bundle: bundle,
          files: files,
          currentBundle: currentBundle
        }}>
        <div className='main-container'>
          {/* Conditionally displaying the FileWizard button only if a file group is selected */}
          {selection.fileGroupId && (
            <Button variant='FileWizard' onClick={handleClick}>FileWizard</Button>
          )}

          {/* Conditionally displaying the FileWizard window and passing projectId and fileGroupId */}
          {openNewWindow && selection.fileGroupId &&
            <NewWindow title='CEDaR CMS Upload Wizard' features={{ width: 1000, height: 800 }} onUnload={() => setOpenNewWindow(false)}>
              <FileWizard
                projectId={selection.projectId}
                subProjectId={selection.subProjectId}
                closeFileWizard={closeFileWizard}
                fileGroupId={selection.fileGroupId} />
            </NewWindow>
            }
          <div className='top-container'>
            <div className='tab-container'>
              <TabContent setSelection={setSelection}></TabContent>
            </div>
            <div className='file-container'>
              <Files
                projectId={selection.projectId}
                subProjectId={selection.subProjectId}
                fileGroupId={selection.fileGroupId}
                selectFile={selectFile}
                bundle={setBundle}
                currentBundle={setCurrentBundle}
                selectedUri={selectedUri}>
              </Files>
            </div>
          </div>
          <div className='middle-container'>
            <div className='file-view-container'>
              <FilePreview selectedFileUri={fileUri}></FilePreview>
            </div>
            <div className='metadata-container'>
              <Fields className="content-data"
                selection={selection}
                projects={setProjects}
                subProjects={setSubProjects}
                fileGroups={setFileGroups}
                files={setFiles}>
                Content Image
              </Fields>
            </div>
          </div>
          <div className='bottom-container'>
            <div className='graph-container'>
              {selection.fileGroupId ?
                <ContentMap selection={selection} bundle={bundle} currentBundle={currentBundle}></ContentMap>
                : null}
            </div>
          </div>
        </div >
      </dataContext.Provider>
    </RefreshContext.Provider>
  );
};

export default Main;
export { dataContext, RefreshContext };

