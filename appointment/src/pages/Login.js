import styled from "styled-components"
import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import axios from "axios"
import { useGoogleLogin } from "@react-oauth/google"
import { GoogleOutlined } from "@ant-design/icons"
import { publicRequest } from "../requestMethods"

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
    flex-direction: column;
`
const Input = styled.input`
    flex: 1;
    min-width: 40%;
    padding: 10px;
    margin: 10px 0;
`
const Button = styled.button`
    /* width: 40%; */
    border: none;
    background-color: ${props => props.disabled ? "#6C757D" : "#1F51FF"};
    color: white;
    cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
    &:hover {
    background-color: #1F51FF;
    transform: scale(0.96);
  };
    display: flex;
    align-items: center;
    justify-content: center;
`
const Text = styled.p`
   font-size: 12px;
   text-decoration: underline;
   cursor: pointer;
   margin: 5px 0; 
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
const Login = () => {
    // const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("")
    const { loading, error, dispatch } = useContext(AuthContext);
    const navigate = useNavigate()

    const handleLogin = async (code) => {
        dispatch({ type: "LOGIN_START" });
        try {
            const res = await publicRequest.post("/auth/google/login", { code: code });
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            navigate("/")
        } catch (err) {
            dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
        }
    }
    const googleLogintwo = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: (res) => {
            console.log(res)
            handleLogin(res.code)
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
                {/* <Form>
                    <Input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
                    <Input placeholder="password" type="password" onChange={(e) => setPassword(e.target.value)} />
                    <Button onClick={handleLogin} disabled={loading}>Login</Button>
                    <Link>Forgot your password?</Link>
                    
                    
                </Form> */}
                <Button onClick={() => googleLogintwo()} disabled={loading}><GoogleOutlined style={{marginRight: "5px", fontSize:"20px"}}/>Sign in with Google</Button>
                {error && <Error>please create an account if not already done or wait for approval from admin</Error>}
                <Link to="/register" style={{ textDecoration: "none" }} >
                    <Text>Create an Account</Text>
                </Link>
            </Wrapper>
        </Container>
    )
}

export default Login