import { accordionAnatomy } from '@chakra-ui/anatomy'
import { Collapse, createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
    createMultiStyleConfigHelpers(accordionAnatomy.keys)

const custom = definePartsStyle({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '0px',
        // border: '1px solid blue'
    },
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '10px',
        border: '1px solid #D7D9D3',
        borderRadius: '5px',
        textAlign: 'flex-start',
        _hover: {
            bg: 'green.100.5'
        }
    },
    button: {
        width: '100%',
        padding: '0px',
    },
    panel: {
        width: '100%',
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        border: '1px solid #D7D9D3',
        borderRadius: '5px',
        bg: 'base.white',
        padding: '15px'
    },
})
const customDevInfo = definePartsStyle({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '0px',
        // border: '1px solid blue'
    },
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderColor: 'transparent',
        border: '0px'
        // border: '1px solid blue'
    },
    button: {
        width: '100%',
        padding: '0px',
        borderBottom: '1px solid',
        borderColor: 'grey.150',
        // border: '1px solid blue'
    },
    panel: {
        width: '100%',
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        // border: '1px solid blue'
    },
})
const uploadWizardBundle = definePartsStyle({
    root: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '0px',
        // border: '1px solid blue'
    },
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '10px',
        border: '1px solid #D7D9D3',
        borderRadius: '5px',
        // border: '1px solid green',
        textAlign: 'flex-start',
        _hover: {
            bg: 'green.100.5'
        }
    },
    button: {
        width: '100%',
        padding: '0px',
        // border: '1px solid pink',
    },
    panel: {
        width: '100%',
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderRadius: '5px',
        bg: 'grey.50',
        padding: '15px'
    },
})

export const accordionTheme = defineMultiStyleConfig({
    variants: { custom, customDevInfo, uploadWizardBundle },
})
