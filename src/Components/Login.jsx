import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import Main from './Main';
import './styles/Login.css';
import { Button, Input, Stack, Heading, Box } from '@chakra-ui/react'
import { configure } from '@testing-library/react';

const AuthContext = createContext();

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [authToken, setAuthToken] = useState({});

  const getEncodedCredentials = () => {
    const encodedCredentials = btoa(`${username}:${password}`);
    return encodedCredentials;
  };

  const handleLogin = async () => {
      axios.post('https://cedar.arts.ubc.ca/user/login?_format=json', {
        "name": username, "pass": password
      }, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      }).then((csrfresponse) => {
        setAuthToken({
          credentials: getEncodedCredentials(), 
          csrftoken: csrfresponse.data.csrf_token,
        })
        setLoggedIn(true)
      })
    .catch((error) => {
      setLoginError("incorrect username or password")
      console.log(error)
    });
  }

  const getCurrentUserInfo = async () => {
      axios.get(
        `https://cedar.arts.ubc.ca/currentUser?_format=json`, {
        withCredentials: true,
        headers: {
            Authorization: `Basic ${authToken.credentials}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-Token': authToken.csrftoken,
        }
      }).then((response) => {
        setAuthToken({... authToken, 
          name: response.data[0].name, 
          status: response.data[0].status, 
          role: response.data[0].roles_target_id_1
        })
        setIsUser(true)
      })
      .catch((error) => {
        console.log(error)
      });
}

useEffect(() => {
  getCurrentUserInfo()
}, [isLoggedIn])

  // const handleLogin = async () => {
  //   // Set the encoded credentials in the context

  //   axios.post(
  //     `https://cedar.arts.ubc.ca/user/login`, {
  //       "name": username, "pass": password
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     }
  //   ).then((jwtresponse) => {
  //     setAuthToken({ jwttoken: jwtresponse.data.id_token, credentials: getEncodedCredentials()})
  //     setLoggedIn(true)
  //     console.log(jwtresponse);
  // axios.post('https://cedar.arts.ubc.ca/rest_api/login', {}, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Accept: 'application/json',
  //     'Authorization': 'Basic ' + getEncodedCredentials(),
  //     'credentials': 'included'
  //   }
  // })
  //   .then((csrfresponse) => {
  //     setAuthToken({ jwttoken: jwtresponse.data.id_token, csrftoken: csrfresponse.data.csrf_token, credentials: getEncodedCredentials() })
  //     console.log(csrfresponse);
  //     setLoggedIn(true)
  //   })
  //   }).catch((error) => {
  //     setLoginError("incorrect username or password")
  //     console.log(error)
  //   });
  // };

    if (isUser) {
      return <AuthContext.Provider value={authToken}><Main /></AuthContext.Provider>;
    }

    return (
      <div className='parent-container'>
        <div className='child-container'>
          <div className='header-container'>
            <Heading as='h2' fontSize='28px'>
              Login
            </Heading>
          </div>
          <div className='input-container'>
            <div className='input'>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                style={{
                  borderRadius: '5px 5px 0px 0px',
                  padding: '5px 15px',
                  fontSize: '16px',
                }}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                style={{
                  borderRadius: '0px 0px 5px 5px',
                  padding: '5px 15px',
                  fontSize: '16px',
                }}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button variant='login' onClick={handleLogin}>Login</Button>
        </div>
        {/* not styled */}
        <p style={{ color: "red" }}>{loginError}</p>
      </div>
    );
  };

  export default Login;
  export { AuthContext };