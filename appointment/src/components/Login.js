import { useContext } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { AuthContext } from "../context/AuthContext"

const Container = styled.button`
 background-color:${props => props.disabled ? "#6C757D" : " #d90429"};
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 10px 10px;
  border-radius: 5px;
  outline: 0;
  text-transform: uppercase;
  margin: 6px;
  cursor:  ${props => props.disabled? "not-allowed": "pointer"};
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
const Login = () => {
  const { user, loading,dispatch } = useContext(AuthContext)
  const handleLogout=()=>{
    dispatch({type: "LOGOUT"})
  }
  return (
      <Container disabled={loading} onClick={user?handleLogout:null}>
        {user?"Logout":"Login"}
      </Container>
  )
}

export default Login