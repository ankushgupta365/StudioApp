import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { publicRequest } from "../requestMethods"
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import axios from "axios"
import {GoogleOutlined} from "@ant-design/icons"

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    background: linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url("https://images.news18.com/ibnlive/uploads/2022/01/untitled-design-1-1-164371082616x9.jpg") center;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
`
const Wrapper = styled.div`
   width: 25%;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 1px 9px -1px rgba(179,173,179,1);
    display: flex;
    flex-direction: column;
    justify-content: center;
`
const Title = styled.h1`
    font-size: 24px;
    font-weight: 300;
`
const Form = styled.form`
    display: flex;
    flex-wrap: wrap;
`
const Input = styled.input`
    flex: 1;
    min-width: 40%;
    padding: 10px;
    margin: 20px 10px 0px 0px;
`
const Agreement = styled.span`
    font-size: 12px;
    margin: 10px 0px;
`
const Button = styled.button`
    /* width: 40%;   */
    border: none;
    background-color: #1F51FF;
    color: white;
    cursor: pointer;
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    &:hover {
    background-color: #1F51FF;
    transform: scale(0.96)
  };
  display: flex;
    align-items: center;
    justify-content: center;
`
const Text = styled.p`
   font-size: 14px;
   text-decoration: underline;
   cursor: pointer;
`
const Error = styled.span`
    font-size: 12px;
    color: red;
`
const Image = styled.img`
width: 290px;
height: 100px;
align-self: center;
border-radius: 5px;
margin: 20px;
margin-bottom: 40px;
`
const Register = () => {
  // const [credentials, setCredentials] = useState({
  //   username: undefined,
  //   email: undefined,
  //   password: undefined,

  // })
  const navigate = useNavigate()
  // const handleChange = (e) => {
  //   setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  // }
  const [err,setErr] = useState(false)
  const handleRegister = async (code) => {
    try {
      await publicRequest.post("/auth/google/register", {code: code})
      navigate("/login")
    } catch (error) {
      setErr(true)
      console.log(error)
    }
  }

  const googleLogintwo = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (res) => {
      console.log(res)
      handleRegister(res.code)
    },

    onError: (err) => {
      console.log(err)
    },
    scope: 'openid profile email https://www.googleapis.com/auth/calendar'
  })
  return (
    <Container>
      <Wrapper>
      <Image src="https://www.cuchd.in/about/assets/images/cu-logo.png" />
        {/* <Title>CREATE AN ACCOUNT</Title> */}
        {/* <Form>
          <Input placeholder="name" type="name" id="name" onChange={(e) => handleChange(e)} />
          <Input placeholder="last name" type="lastname" id="lastname" onChange={(e) => handleChange(e)} />
          <Input placeholder="username" type="username" id="username" onChange={(e) => handleChange(e)} />
          <Input placeholder="email" type="email" id="email" onChange={(e) => handleChange(e)} required pattern="/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/" />
          <Input placeholder="password" type="password" id="password" onChange={(e) => handleChange(e)} />
          <Agreement>
            By creating an account, I consent to the processing of my personal data in accordance with the <b>PRIVACY POLICY</b>
          </Agreement>
          <Button onClick={handleRegister} type="submit">CREATE</Button>
        </Form> */}
       
        <Button onClick={googleLogintwo}><GoogleOutlined style={{marginRight: "5px", fontSize:"20px"}}/>Sign up Google</Button>
        <Link to="/login" style={{ textDecoration: "none" }} >
          <Text>Login</Text>
        </Link>
        {err && <Error>something went wrong, or you are already registered</Error>}
      </Wrapper>
    </Container>
  )
}

export default Register