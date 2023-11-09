import React, { useContext } from 'react'
import styled from 'styled-components'
import Login from './Login'
import { AuthContext } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

const Container = styled.div`
padding: 20px 50px 20px 50px;
display: flex;
justify-content: space-between;
align-items: center;
margin: 0;
background-color: #1e283c;
`
const Left = styled.div`
  color: #fff;
`
const Greeting = styled.h1`
color: '#ffffffff'
`
const Right = styled.div`

`
const Button = styled.button`
  background-color:${props => props.disabled ? "#6C757D" : " #d90429"};
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 10px 10px;
  border-radius: 5px;
  outline: 0;
  text-transform: uppercase;
  margin: 6px;
  cursor:  ${props => props.disabled ? "not-allowed" : "pointer"};
  transition: ease background-color 250ms;
  border: none;
  &:hover {
    background-color: #ef233c;
    transform: scale(0.96)
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`
const Navbar = () => {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()

  return (
    <Container>
      <Left>
        <Greeting>
          Hi, {user ? `${user?.name}` : "there"}
        </Greeting>
      </Left>
      <Right>
        <Link to={location.pathname == "/" ? "/bookings" : "/"} style={{ textDecoration: "none"}}>
          <Button disabled={loading}>
            {location.pathname == "/" ? "My Bookings" : "Home"}
          </Button>
        </Link>
        <Login />
      </Right>
    </Container>
  )
}

export default Navbar