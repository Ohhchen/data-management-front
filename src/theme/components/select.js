import { selectAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(selectAnatomy.keys)

const editFormSelect = definePartsStyle({
 field: {
    background: "base.white",
    border: "1px solid",
    borderColor: "grey.150",
    borderRadius: "5px",
    color: 'brown.350',
    padding: '5px 5px',
  },
  icon: {
    color: "brown.350"
  }
})

export const selectTheme = defineMultiStyleConfig({
  variants: { editFormSelect },
})