const PROJECT = 0;
const PROJECTDEV = 1;
const SUBPROJECT = 2;
const SUBPROJECTDEV = 3;
const FILEGROUP = 4;
const FILEGROUPDEV = 5;
const FILE = 6;
const BUNDLE = 7;

const EditFormData = [
    //PROJECT
    {
        'label': {
            type: 'text',
            name: 'Title',
            description: "A meaningful name that describes this Project (Ex. For CEDaR CMS project, a meaningful name may be 'CEDaR CMS')",
        }

    },
    //PROJECTDEV
    {
        'id': {
            type: 'urlProject',
            //Different type than regular URL because getting id value was different
            name: 'URI',
            prefix: 'https://cedar.arts.ubc.ca/group/'
        }
    },
    //SUBPROJECT
    {
        'title': {
            type: 'text',
            name: 'Title',
            description: "A meaningful name that describes this sub-project (Ex. 'Assets' for a Sub-Project that will contain Images, Videos, and Audios File Groups)",
        },
        'field_description': {
            type: 'text',
            name: 'Description',
            description: 'A meaningful description that you and your team members will understand',

        },
        'field_funding': {
            type: 'text',
            name: 'Funding',
            description: 'List the grant(s) used on this project, if any/applicable',
        },
        'field_agreement': {
            type: 'text',
            name: 'Agreement',
            description: 'The link(s) to the agreement with the community and/or collaborators, if applicable',
        },
        'field_status': {
            type: 'selectStatus',
            name: 'Status',
            description: 'The status of the project. Choose from the options below'
        },
        'revision_uid': {
            //Revision user
            type: 'parse',
            name: 'Last Revised By'
        },
    },
    //SUBPROJECTDEV
    {
        'nothing_1': {
            //Revision log
            type: 'parse',
            name: 'View Previous Revisions',
        },
        'nid': {
            type: 'url',
            name: 'URI',
            prefix: 'https://cedar.arts.ubc.ca/node/'
        }
    },
    //FILEGROUP
    {
        'title': {
            name: 'Title',
            type: 'text',
            description: "A meaningful name that describes this File Group (Ex. A File Group titled 'Images' that will contain a bundle of image files)",
        },
        'field_description': {
            name: 'Description',
            type: 'text',
            description: 'A meaningful description that you and your team members will understand',
        },
        'field_source': {
            name: 'Source',
            type: 'text',
            description: 'The source where the files are from, if not created by the contributors',
        },
        'field_relation': {
            name: 'Relation',
            type: 'text',
            description: 'The link(s) of related files, if applicable',
        },
        'field_subjects': {
            name: 'Subjects',
            type: 'text',
            description: 'The topic of the files that will be uploaded, if applicable',
        },
        'field_subjects_geographic': {
            name: 'Subjects Geographic',
            type: 'text',
            description: 'The geographic area describing the files that will be uploaded, if applicable',
        },
        'field_date': {
            name: 'Date',
            type: 'date',
            description: 'The date when the files are created. If unknown, use the date uploaded instead',
        },
        'field_digital_content_format_new': {
            name: "Digital Content Format",
            type: 'selectFormat',
            description: 'The format of the files that will be uploaded. Choose from the options below',
        },
        'field_digital_content_type_new_': {
            name: 'Digital Content Type',
            type: 'selectType',
            description: 'The content type of the files that will be uploaded. Choose from the options below',
        },
        'field_languages_new_': {
            name: 'Languages',
            type: 'selectLang',
            description: 'The language(s) used the files, if applicable. Choose from the options below',
        },
        'field_contributor_s_': {
            name: 'Contributor(s)',
            type: 'contributors',
            description: "Select an existing contributor. Selecting 'None' will remove the contributor. If the desired contributor does not exist, use Add a New Contributor",
        },
        'field_rights': {
            name: 'Rights',
            type: 'rights',
            description: "Select an existing license with detail. If the desired license does not exist, use 'Add new rights'. Newly added rights will automatically replace the currently existing/selected one",
        },
        'revision_uid': {
            //Revision user
            type: 'parse',
            name: 'Last Revised By'
        }
    },
    //FILEGROUPDEV
    {
        'nothing_1': {
            //Revision log
            type: 'parse',
            name: 'View Previous Revisions',
        },
        'nid_1': {
            type: 'url',
            name: 'File Group URI',
            prefix: 'https://cedar.arts.ubc.ca/node/'
        },
        'nid_2': {
            //Same as nid_1 just repeated
            type: 'text',
            name: 'File Group ID',
        }
    },
    //FILE
    {
        //Using this for FILE ENTITY specific info ONLY but this ALSO contains BUNDLE info
        'nid_2': {
            type: 'text',
            name: 'Bundle ID'
        },
        'view_node': {
            type: 'text',
            name: 'Bundle URI'
        },
        'sha3_512': {
            type: 'text',
            name: 'Checksum Hash'
        }
    },
    //BUNDLE
    {
        'title': {
            type: 'text',
            name: "Title",
        }, 
        'field_file_entity2': {
            type: 'file',
            name: 'Files'
        }
    }
]

export {EditFormData, PROJECT, PROJECTDEV, SUBPROJECT, SUBPROJECTDEV, FILEGROUP, FILEGROUPDEV, FILE, BUNDLE};