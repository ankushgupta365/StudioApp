import React from 'react'
import { RiHomeOfficeFill } from 'react-icons/ri'
import styled from 'styled-components'
import { userRequest } from '../requestMethods'

const Container = styled.div`
    padding: 10px 20px 0px 20px;
    /* background-color: #f1f1f1f1; */
    border-radius: 8px;
    /* border: 1px solid ; */
    margin: 20px;
    text-align: center;
    transition: all 0.3s ease;
    /* box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;   */
    box-shadow: ${props=>props.activeStatus == true?'rgba(22, 130, 10, 0.2) 0px 7px 29px 0px': 'rgba(68, 71, 68, 0.2) 0px 7px 29px 0px;  '};
    cursor: pointer;
    &:hover{
        
        box-shadow: none;
        background-color: #f1f1f1f1;
    }
    &:active{
        transform: scale(0.98);
    }
`
const IconWrapper = styled.div`
  
`
const Para = styled.p`
    font-size: 22px;
    font-weight: 400;
`

const IconCard = ({studio,setChangeAction,setLoading}) => {

    const handleClick =async (studio)=>{
        // setLoading(true)
        await userRequest.post("/slot/active", {
            studioNo: studio._id,
            active: !studio.activeStatus
        })
        // setLoading(false)
        setChangeAction(prev=>!prev)
        
    }
    return (
        <Container activeStatus={studio.activeStatus} onClick={()=>handleClick(studio)}>
            <IconWrapper>
                <RiHomeOfficeFill color={studio.activeStatus === true? 'green': 'grey'} size='120px' />
            </IconWrapper>
            <Para>Studio {studio._id}</Para>
        </Container>
    )
}

export default IconCard