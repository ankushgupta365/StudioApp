import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    background: white;
    padding: 20px;
    border-radius: 4px;
    display: inline-block;
    margin: 0 auto;
`
const InnerContainer = styled.div`
    border-radius:1600px; 
    height:160px; 
    width:160px; 
    background: #F8FAF5; 
    margin:0 auto;
`
const CheckMark = styled.i`
    color: #e61414;
    font-size: 100px;
    line-height: 200px;
    margin-left:-15px;
`
const Heading = styled.h1`
    color: #e61414;
    font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
    font-weight: 900;
    font-size: 40px;
    margin-bottom: 10px;
`
const Para = styled.p`
    color: #404F5E;
    font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
    font-size:20px;
`
const ErrorMessage = () => {
    return (
        <Container>
            <InnerContainer>
                <CheckMark>✖</CheckMark>
            </InnerContainer>
            <Heading>Failure</Heading>
            <Para>Your studio booking is failed,<br />try again later or refresh the page!</Para>
        </Container>
    )
}

export default ErrorMessage