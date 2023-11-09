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
    border-radius:160px; 
    height:160px; 
    width:160px; 
    background: #F8FAF5; 
    margin:0 auto;
`
const CheckMark = styled.i`
    color: #9ABC66;
    font-size: 100px;
    line-height: 200px;
    margin-left:-15px;
`
const Heading = styled.h1`
    color: #88B04B;
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
const Sucess = () => {
    return (
        <Container>
            <InnerContainer>
                <CheckMark>✓</CheckMark>
            </InnerContainer>
            <Heading>Success</Heading>
            <Para>Your studio booking is confirmed,<br />check My Bookings Tab for further details!</Para>
        </Container>
    )
}

export default Sucess