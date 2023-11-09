import React from 'react'
import styled from 'styled-components'
import happyDefault from '../assets/happyDefault.jpg'

const Container = styled.div`
    margin: 0;
    padding: 0px 20px 0px 20px;
`
const Image = styled.img`
    width: 400px;
    height: 300px;
    mix-blend-mode: multiply;
`

const TakeAction = () => {
    return (
        <Container>
            <Image src={happyDefault} />
        </Container>
    )
}

export default TakeAction