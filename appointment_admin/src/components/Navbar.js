import React, { useContext } from 'react'
import styled from 'styled-components'
import Login from './Login'
import { AuthContext } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

const Container = styled.div`
padding: 20px 50px 20px 50px;
display: flex;
justify-content: space-between;
align-items: center;
margin: 0;
background-color: #1e283c;
`
const Left = styled.div`

`
const Greeting = styled.h1`
  color: #ffffffff;
`
const Navbar = () => {
  const {user} = useContext(AuthContext)
  const location = useLocation()
  return (
    <Container>
      <Left>
        <Greeting dark={location.pathname === '/'}>
          Hi, {user?`${user.name}`:"there"}
        </Greeting>
      </Left>
      <Login />
    </Container>
  )
}

export default Navbar