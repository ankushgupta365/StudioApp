import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import IconCard from '../components/IconCard'
import { userRequest } from '../requestMethods'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const OuterContainer = styled.div`
    display: flex;
`
const Container = styled.div`
    width: 100%; 
`
const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const H3 = styled.h2`
  margin-top: 40px;

`
const Wrapper = styled.div`
  /* background-color: black;  */
  margin-top: 40px;
  border-radius: 4px;
  padding: 60px 40px 60px 40px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;  
`
const Studios = styled.div`
  display: flex;
`
const Span = styled.span`
  color: red;
  margin-top: 20px;
`

const StudioConfigure = () => {
  const [loading, setLoading] = useState(false)
  const [studioStatus, setStudioStatus] = useState([])
  const [changeAction,setChangeAction] = useState(false)
  const getStudioStatus = async () => {
    setLoading(true)
    const studioStatus = await userRequest.get("/slot/active")
    setLoading(false)
    return studioStatus.data
  }
  useEffect(() => {
    getStudioStatus().then(studioStatus => setStudioStatus(studioStatus))
  }, [])

  useEffect(()=>{
    getStudioStatus().then(studioStatus=>setStudioStatus(studioStatus))
  },[changeAction])

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 110,
        alignSelf: 'center',
        marginTop: '160px'
      }}
      spin
    />
  );
  return (
    <OuterContainer>
      <Sidebar />
      <Container>
        <Navbar />
        <Spin indicator={antIcon} spinning={loading} size='large'>
          <InnerContainer>
            <H3>Make Studio Active or InActive</H3>
            <Wrapper>
              <Studios>
                {
                  studioStatus.length > 0 && studioStatus.map(studio => {
                    return <IconCard studio={studio} setChangeAction={setChangeAction} setLoading={setLoading} key={studio._id}/>
                  })
                }
              </Studios>
            </Wrapper>
            {!loading && <Span>Press to change the state of the studio</Span>}
          </InnerContainer>
        </Spin>
      </Container>
    </OuterContainer>
  )
}

export default StudioConfigure