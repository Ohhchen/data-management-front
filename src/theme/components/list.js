import { defineStyle, createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'
import { listAnatomy as parts } from '@chakra-ui/anatomy'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const variants = {
  custom: definePartsStyle(() => ({
    container: {
        textAlign: 'left',
        fontSize: '16px',
        height: '100%',
        padding: '0px',
        // border: '1px red solid',
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        flex: '1 0 0',
        padding: '10px 10px',
        bg: 'base.transparent',
        color:'base.dark',
        cursor: 'pointer',
        // border: '1px red solid',
        _hover: {
            color: 'green.300',
            bg: 'green.100.5',
            borderRadius: '5px',
        },
        _selected: {
          color: 'green.300',
          bg: 'green.100.5',
          borderRadius: '5px',
      },
    },
  })),
  metadata: definePartsStyle(() => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px',
        alignSelf: 'stretch',
        textAlign: 'left',
        height: '100%',
        padding: '0px',
        width: '100%',
        // border: '1px red solid',
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        flex: '1 0 0',
        color:'base.dark',
        borderBottom: '1px solid',
        borderColor: 'grey.150',
    },
  })),
  metadataDev: definePartsStyle(() => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '10px',
        alignSelf: 'stretch',
        textAlign: 'left',
        height: '100%',
        padding: '0px',
        // border: '1px red solid',
    },
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        flex: '1 0 0',
        color:'brown.200',
        borderBottom: '1px solid',
        borderColor: 'grey.150',
    },
  })),
}

export const listTheme = defineMultiStyleConfig({ variants })