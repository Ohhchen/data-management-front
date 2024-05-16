import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const reg = defineStyle({
  fontSize: 'buttonReg',
  width: 'fit-content',
  height: 'fit-content',
  bg: 'green.350',
  color: 'base.white',
  padding: '5px 15px',
  borderRadius: '20px',
  _hover: {
    border: '#C7DB94 solid 1px',
  }
})

const secondary = defineStyle({
  fontSize: 'buttonReg',
  width: 'fit-content',
  height: 'fit-content',
  padding: '5px 15px',
  borderRadius: '20px',
  bg: 'green.50',
  color: 'green.300',
  _hover: {
    border: '#ABBC7F solid 1px',
  },
})

const lg = defineStyle({
  fontSize: 'buttonLg',
  width: '50%',
  height: 'auto',
  padding: '5px 20px',
  bg: 'green.350',
  color: 'base.white',
  borderRadius: '20px',
  display: 'inline-flex',
  alignItems: 'center',
  _hover: {
    bg: 'green.50',
    color: 'green.300',
  },
})

const login = defineStyle({
  fontSize: 'buttonLg',
  display: 'flex',
  padding: '10px 20px',
  justifyContent: 'center',
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  borderRadius: '5px',
  bg: 'green.350',
  color: 'base.white',
  _hover: {
    bg: 'green.50',
    color: 'green.300',
  },
})

const anchor = defineStyle({
  bg: 'base.transparent',
  color: 'green.350',
  fontSize: 'anchorLinkReg',
  fontWeight: '400',
  height: 'fit-content',
  padding: '0px',
  _hover: {
    color: 'green.250',
    fontWeight: '500',
  },
})

export const buttonTheme = defineStyleConfig({
  variants: { reg, secondary, lg, login, anchor},
})

export default buttonTheme