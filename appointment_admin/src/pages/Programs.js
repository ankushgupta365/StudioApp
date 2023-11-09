import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import styled from 'styled-components'
import Navbar from '../components/Navbar'
import { Button, Modal, Spin, Result, Tooltip, Select, Space } from 'antd'
import { DeleteOutlined, LoadingOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { publicRequest } from '../requestMethods'
import ResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';


const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const PROGRAMNAMES = ["BAJMC", "BBA", "BCA", "M.Com", "MAJMC", "MBA", "MCA"]

const OuterContainer = styled.div`
    display: flex;
`
const Container = styled.div`
    width: 100%; 
`
const InnerContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: 10px;    
   align-items: center;
`
const TableContainer = styled.div`
    width: 100%;
    height: 100%;
`
const Card = styled.div`
    width: 30vw;
    height: 60vh;
    /* background-color: black; */
    border-radius: 8px;
    /* border: 1px solid grey; */
    border-width: 1px;
    box-shadow: 0px 1px 9px -1px rgba(179,173,179,1);
    padding: 20px;
    margin: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
`
const Div = styled.div`
    /* padding: 10px; */
    margin-bottom: 20px;
    display: flex;
    /* gap: 10px; */
    display: flex;
    align-items: center;
`
const OuterDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const Input = styled.input`
     padding: 5px 10px;
     border-radius: 4px;
     border: 1px solid grey;
`
const DataList = styled.datalist`

`
const Label = styled.label`
    display: inline-block;
    width: 150px;
`
const ButtonJi = styled.button`
    border: none; 
    padding: 8px 32px;
    border-radius: 8px;
    background-color: red;
    color: white;
    font-weight: 600;
`
const H4 = styled.h4`
    margin-bottom: 30px;
    font-weight: 500;   
`
const Pagination = styled.div`
  
`
const RecorderChipWrapper = styled.div`
    max-width: 400px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
`
const RecorderChip = styled.div`
  display: inline-block;
  padding: 5px;
  font-size: 10px;
  border-radius: 5px;
  color: white;
  background-color: black;
  width: 70px;
`
const RecorderChipWrapperModal = styled.div`
    max-width: 400px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`
const RecorderChipModal = styled.div`
  /* display: inline-block; */
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 10px;
  border-radius: 5px;
  color: white;
  background-color: black;
  max-width: 110px;
`
const CroseIconTag = styled.span`
 padding-left: 10px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 20px;
  cursor: pointer;
  &:hover {
    color: #888;
  }
`

const Programs = () => {
    // const [semester,setSemester] = useState("")
    // const [programName,setProgramName] = useState("")
    // const [courseName,setCourseName] = useState("")
    const [programs, setPrograms] = useState([])
    const [loadingContent, setLoadingContent] = useState(true)
    const [values, setValues] = useState({
        semester: undefined,
        programName: undefined,
        courseName: undefined,
    })

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1)

    const handlePageChange = (page) => {
        setCurrentPage(page)
        getProgramList(page, 10)
    }

    const handleChange = (e) => {
        setValues((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    }
    console.log(values)

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const showModal = () => {
        setOpen(true);
    };
    const handleOk = async () => {
        setLoading(true);
        console.log(values)
        await publicRequest.post("/program", values)
        getProgramList(1, 10)
        setCurrentPage(1)
        setLoading(false)
        setOpen(false)
    };
    const handleCancel = () => {
        setOpen(false);
    };
    const [openRecorderManager, setopenRecorderManager] = useState(false);
    const [selectedProgramForRecorder, setSelectedProgramForRecorder] = useState({})
    const [selecterProgramForRecorderAvailableRecorders, setSelecterProgramForRecorderAvailableRecorders] = useState([])
    const [selectedRecordersToAddIds,setSelectedRecordersToAddIds] = useState([])
    const showModalRecorderManager = async (program) => {
        setSelectedProgramForRecorder(program)
        const recorders = await publicRequest.post("/user/role/list/recorder", {recordersIDs: program.recorders.map(recorder=> recorder._id)})
        // console.log(recorders.data.users)
        setSelecterProgramForRecorderAvailableRecorders(recorders.data.users)
        setopenRecorderManager(true);
    };
    const handleOkRecorderManager = async () => {
        setLoading(true);
        const res = await publicRequest.post("/program/recorder", {recorderIds: selectedRecordersToAddIds, programId: selectedProgramForRecorder?._id})
        setSelectedProgramForRecorder({})
        setSelecterProgramForRecorderAvailableRecorders([])
        setSelectedRecordersToAddIds([])
        handleSelectChangeRecorderAdd()
        setopenRecorderManager(false)
        getProgramList(1, 10)
        setCurrentPage(1)
        setLoading(false)
    };
    const handleCancelRecorderManager = () => {
        setSelectedProgramForRecorder({})
        setSelecterProgramForRecorderAvailableRecorders([])
        setSelectedRecordersToAddIds([])
        handleSelectChangeRecorderAdd()
        setopenRecorderManager(false);
    };


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
    const handleDelete = async (id) => {
        await publicRequest.delete(`/program/${id}`)
        getProgramList(1, 10)
        setCurrentPage(1)
    }
    const getProgramList = async (page, limit) => {
        setLoadingContent(true)
        setPrograms([])
        try {
            const res = await publicRequest.get(`/program?page=${page}&limit=${limit}`)
            setPrograms(res.data.programs)
            setTotalPages(res.data.count)
            setLoadingContent(false)
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getProgramList(1, 10)
    }, [])
    const handleSelectChangeRecorderAdd = (selectedRecordersToAddIdsParam=[])=>{
        setSelectedRecordersToAddIds(selectedRecordersToAddIdsParam)
    }
    const handleRemoveRecorderIcon = async(recorder)=>{
        console.log(recorder)
        console.log(selectedProgramForRecorder)
        const res = await publicRequest.put(`/program/recorder/${selectedProgramForRecorder?._id}/${recorder?._id}`)
        alert("recorder removed")
        handleCancelRecorderManager()
        getProgramList(1, 10)
        setCurrentPage(1)
    }
    return (
        <OuterContainer>
            <Sidebar />
            <Container>
                <Navbar />
                <InnerContainer>
                    <Button type="primary" onClick={showModal} danger size='large' style={{ width: '250px', marginTop: '8px' }}>
                        Create New Program
                    </Button>
                    <Spin indicator={antIcon} spinning={loadingContent} size='large'>
                        {programs.length > 0 ? <TableContainer> <div className='table-responsive'><table className='table text-center table-striped table-hover table-bordered'>
                            <tbody>
                                <tr className='table-dark'>
                                    <th>
                                        S.No
                                    </th>
                                    <th>Semester</th>
                                    <th>Program Name</th>
                                    <th>Course Name</th>
                                    <th>Actions</th>
                                    <th>Recorders</th>
                                </tr>
                                {
                                    programs?.map((program, index) => {
                                        return (
                                            <tr key={program._id}>
                                                <td>{index + 1 + (10 * (currentPage - 1))}</td>
                                                <td>{program.semester}</td>
                                                <td>{program.programName}</td>
                                                <td>{program.courseName}</td>
                                                <td>
                                                    {<Tooltip title="Delete Program"><Button onClick={() => handleDelete(program._id)} style={{ marginRight: '4px' }}><DeleteOutlined style={{ color: "red", fontSize: "18px", margin: "2px" }} /></Button></Tooltip>}
                                                    {<Tooltip title="Manage recorders"><Button onClick={() => showModalRecorderManager(program)}><VideoCameraOutlined style={{ color: "black", fontSize: "18px", margin: "2px" }} /></Button></Tooltip>}
                                                </td>
                                                <td>
                                                    <RecorderChipWrapper>
                                                        {program?.recorders?.map(recorder => <RecorderChip className='text-truncate'>{`${recorder?.name} ${recorder?.lastname}`}</RecorderChip>)}
                                                    </RecorderChipWrapper>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>

                        </table>
                        </div>
                            <Pagination>
                                <ResponsivePagination
                                    current={currentPage}
                                    total={totalPages}
                                    onPageChange={page => handlePageChange(page)}
                                />
                            </Pagination>
                        </TableContainer> : !loadingContent &&
                        <Result
                            status="404"
                            title="There are no programs created yet"
                            subTitle="click create new program to create new programs"
                            style={{ margin: '60px' }}
                        />
                        }
                    </Spin>
                    <Modal
                        open={open}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="back" onClick={handleCancel}>
                                Return
                            </Button>,
                            <Button key="submit" type="primary" loading={loading} onClick={handleOk} danger>
                                Create
                            </Button>
                        ]}
                    >
                        <OuterDiv>
                            <H4>Create New Program</H4>
                            <Div>
                                <Label>Semester:</Label>
                                <Input type='number' list='semesters' name='semester' id='semester' onChange={(e) => handleChange(e)} placeholder='1' />
                                <DataList id='semesters'>
                                    {SEMESTERS && SEMESTERS.map((sem) => {
                                        return <option key={sem} value={sem} />
                                    })}
                                </DataList>
                            </Div>
                            <Div>
                                <Label>Program Name:</Label>
                                <Input type='text' list='programs' name='programName' id='programName' onChange={(e) => handleChange(e)} placeholder='MBA' />
                                <DataList id='programs'>
                                    {PROGRAMNAMES && PROGRAMNAMES.map((program) => {
                                        return <option key={program} value={program} />
                                    })}
                                </DataList>
                            </Div>
                            <Div>
                                <Label>Course Name:</Label>
                                <Input type='text' placeholder='eg: Design Thinking' autoCorrect='false' name='courseName' id='courseName' onChange={(e) => handleChange(e)} />
                            </Div>
                        </OuterDiv>
                    </Modal>
                    <Modal
                        open={openRecorderManager}
                        onOk={handleOkRecorderManager}
                        onCancel={handleCancelRecorderManager}
                        footer={[
                            <Button key="back" onClick={handleCancelRecorderManager}>
                                Return
                            </Button>,
                            <Button key="submit" type="primary" loading={loading} onClick={handleOkRecorderManager} danger disabled={selectedRecordersToAddIds?.length > 0 ?false:true}>
                                Add
                            </Button>
                        ]}
                    >
                        <OuterDiv>
                            <H4>Manage recorders</H4>
                            <Div>
                                <Select
                                    style={{
                                        width: 250,
                                    }}
                                    mode='multiple'
                                    allowClear
                                    placeholder="Add recorders to this program"
                                    onChange={handleSelectChangeRecorderAdd}
                                    value={selectedRecordersToAddIds}
                                    options={selecterProgramForRecorderAvailableRecorders?.map(recorder=>{
                                        return {value: recorder._id, label: `${recorder?.name} (${recorder?.email})`}
                                    })}
                                />
                            </Div>
                            <Div>
                            <RecorderChipWrapperModal>
                                {selectedProgramForRecorder?.recorders?.map(recorder => <RecorderChipModal className='text-truncate'>{`${recorder?.name} ${recorder?.lastname}`}<CroseIconTag onClick={()=>handleRemoveRecorderIcon(recorder)}>&times;</CroseIconTag></RecorderChipModal>)}
                            </RecorderChipWrapperModal>
                            </Div>
                        </OuterDiv>
                    </Modal>
                </InnerContainer>
            </Container>
        </OuterContainer>
    )
}

export default Programs