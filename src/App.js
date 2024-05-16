import logo from './logo.svg';
import './App.css';
import Login from './Components/Login'
import colors from './theme/globalStyles/colors'
import fontSizes from './theme/globalStyles/fontSizes'
import buttonTheme from './theme/components/button'
import { listTheme } from './theme/components/list'
import { tabsTheme } from './theme/components/tabs';
import { inputTheme } from './theme/components/input';
import { accordionTheme } from './theme/components/accordion';
import { selectTheme } from './theme/components/select';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

function App() {

  const theme = extendTheme({ 
    colors,
    fontSizes,
    components: { 
      Button: buttonTheme,
      Tabs: tabsTheme,
      List: listTheme,
      Input: inputTheme,
      Accordion: accordionTheme,
      Select: selectTheme,
    },
  })

  return (
    <ChakraProvider theme={theme}>
      <div className="App">
        <Login></Login>
      </div>
    </ChakraProvider>
  );
}

export default App;
