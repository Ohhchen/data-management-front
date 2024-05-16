import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const customVariant = definePartsStyle(() => {
  
    return {
        root: {
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            height: '100%',
        },
        tab: {
            width: 'max-content',
            fontSize: 'buttonLg',
            fontWeight: '500',
            color: '#716B66',
            bg: 'transparent',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            _hover: {
                bg: 'green.50',
                color: 'green.300', 
            },
            _selected: {
                bg: 'green.50',
                color: 'green.300', 
            },
        },
        tablist: {
            width: '100%',
            marginBottom: '10px',
        },
        tabpanels: {
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
            flex: '1 0 0',
            alignSelf: 'stretch',
            overflowY: 'scroll',
            height: 'fit-content'
        },
        tabpanel: {
            padding: '0'
        },
    }
  })
  
const variants = {
    custom: customVariant,
}

export const tabsTheme = defineMultiStyleConfig({ variants })