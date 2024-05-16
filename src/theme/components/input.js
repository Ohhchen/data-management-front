import { inputAnatomy } from '@chakra-ui/anatomy'
import { Center, createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys)

const search = definePartsStyle({
  field: {
    borderRadius: '20px',
    border: '1px solid #D7D9D3',
    bg: 'base.white',
    display: 'flex',
    width: 'fit-content',
    padding: '5px 10px',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  element: {
    color:'#716B66'
  }
})

const editFormText = definePartsStyle({
  field: {
    borderRadius: '5px',
    border: '1px solid #D7D9D3',
    bg: 'base.white',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    padding: '5px 5px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    color:'#2B2927',
    fontSize: '16px',
    _focusVisible: {
      border: '2px solid #709157',
    },
  },
})

const deletionDialog = definePartsStyle({
  field: {
    borderRadius: '5px',
    border: '1px solid #D7D9D3',
    bg: 'base.white',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: '5px 5px',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    color:'#2B2927',
    fontSize: '16px',
    textAlign: 'start',
    _focusVisible: {
      border: '2px solid #709157',
    },
  },
})

export const inputTheme = defineMultiStyleConfig({
  variants: { search, editFormText, deletionDialog },
})
