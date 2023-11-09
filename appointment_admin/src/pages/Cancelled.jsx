import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Radio, Result, Space, Spin, Modal, Tooltip, Input, Select } from 'antd'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import { getTimingStringFromTimingNoOfSlot, localDateStringToDDMMYYYY, todayDateStringToSendToBackend } from '../utils/dateUtil'
import { userRequest } from '../requestMethods'
import ResponsivePagination from 'react-responsive-pagination';
import { BsFlagFill } from 'react-icons/bs'
import axios from 'axios'
var fileDownload = require('js-file-download');
const { Search } = Input

const Container = styled.div`
    display: flex;
`
const InnerContainer = styled.div`
     width: 100%;
    display: flex;
    flex-direction: column;
`
const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`
const UpperContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
`
const RadioContainer = styled.div`

`
const TableContainer = styled.div`
    
`
const TableAndPage = styled.div`

`
const TableJi = styled.div`
    height: 65vh;
`
const Button = styled.button`
  border: none;
  margin-left: 5px;
  margin-right: 5px;
  padding: 2px;
`
const ButtonJi = styled.button`
  border: none;
  border-radius: 4px;
  font-size: 16px;
  margin-left: 5px;
  margin-right: 5px;
  padding: 8px;
  padding-left: 20px;
  padding-right: 20px;
  color: white;
  background-color: blue;
`
const Pagination = styled.div`
    margin-top: 10px;
`
const InputJi = styled.input`
    width: 100%;
    padding: 10px;
    font-size: 14px;
`

const Cancelled = () => {
    const [studioNo, setStudioNo] = useState('all')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [bookings, setBookings] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedField, setSelectedField] = useState('email')
    const [searchText, setSearchText] = useState('')

    const onChangeRadio = (e) => {
        setStudioNo(e.target.value)
        setCurrentPage(1)
        getBookings(1, e.target.value, selectedField, searchText).then(res => {
            setBookings(res.data.bookings)
            setTotalPages(res.data.totalPages)
        })
    }
    
    async function getBookings(page, studioNumber, selectedField, searchText) {
        setLoading(true)
        try {
            const res = await userRequest.get(`/booking/cancelled/history/admin?page=${page}&limit=10&studio=${studioNumber}&${selectedField}=${searchText}`)
            setLoading(false)
            return res
        } catch (error) {
            console.log(error.message)
            setLoading(false)
            setError(true)
        }
    }
    
    const handlePageChange = (page) => {
        setCurrentPage(page)
        getBookings(page, studioNo, selectedField, searchText).then(res => {
            setBookings(res.data.bookings)
            setTotalPages(res.data.totalPages)
        })
    }

    useEffect(() => {
        getBookings(1, 'all').then(res => {
            setBookings(res.data.bookings)
            setTotalPages(res.data.totalPages)
        })
    }, [])
    console.log(bookings)
    console.log(studioNo)
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

    const handleChangeSelect = (value) => {
        console.log(value)
        setSelectedField(value)
    }

    const selectBefore = (
        <Select
            defaultValue="email"
            style={{
                width: 100,
            }}
            onChange={handleChangeSelect}
            options={[
                {
                    value: 'email',
                    label: 'Email',
                },
                {
                    value: 'program',
                    label: 'Program',
                },
                {
                    value: 'date',
                    label: 'Date',
                    disabled: true
                },
                {
                    value: 'name',
                    label: 'Name',
                },
            ]}
        />
    );
    const onSearch = (value) => {
        setSearchText(value)
        setStudioNo('all')
        setCurrentPage(1)
        getBookings(1, 'all', selectedField, value).then(res => {
            setBookings(res.data.bookings)
            setTotalPages(res.data.totalPages)
        })
    }
    const handleSlotDataCSVDownload = async () => {
        try {
            const res = await userRequest.get(`/booking/cancelled/history/admin?typeOfRequest=downloadCsv`,{ responseType: 'blob' })
            fileDownload(res.data, "StudioSlotCancelledReport.xlsx")
        } catch (error) {
            console.log(error.message)
        }

    }
  return (
    <Container>
    <Sidebar />
    <InnerContainer>
        <Navbar />
        <Spin indicator={antIcon} spinning={loading} size='large'><ContentContainer>
            <UpperContainer>
                <RadioContainer>
                    <Radio.Group onChange={onChangeRadio} value={studioNo} size='large' style={{ backgroundColor: "#f1f1f1", padding: '10px', borderRadius: '10px', boxShadow: '0px 1px 9px -1px rgba(179,173,179,1)' }}>
                        <Space direction='horizontal' style={{ margin: '8px', padding: '8px' }}>
                            <Radio value='1'>Studio 1</Radio>
                            <Radio value='2'>Studio 2</Radio>
                            <Radio value='3'>Studio 3</Radio>
                            <Radio value='4'>Studio 4</Radio>
                            <Radio value='all'>All</Radio>
                        </Space>
                    </Radio.Group>
                </RadioContainer>
                <Search size='large' addonBefore={selectBefore} placeholder="search text" enterButton="Search" style={{ width: '350px' }} onSearch={onSearch} allowClear />
                <ButtonJi onClick={handleSlotDataCSVDownload}>Download CSV</ButtonJi>
            </UpperContainer>
            <TableContainer>
                
                    {bookings && bookings.length > 0 && !loading ?
                        <TableAndPage>
                            <TableJi className='table-responsive'>
                                <table className='table text-center table-hover table-bordered'>
                                    <tbody>
                                        <tr className='table-dark'>
                                            <th>S.No</th>
                                            <th>Timing</th>
                                            <th>Studio No</th>
                                            <th>Slot No</th>
                                            <th>Date</th>
                                            <th>Course</th>
                                            <th>Program</th>
                                            <th>Sem</th>
                                            <th>Full Name</th>
                                            <th>Role</th>
                                            <th>Email</th>
                                            <th>Reason</th>
                                        </tr>
                                        {
                                            bookings.length > 0 &&
                                            bookings?.map((booking,index) => {
                                                return (                                              
                                                        <tr key={booking?.bookings?._id} className={new Date(booking?.bookings?.date).getTime() == new Date(todayDateStringToSendToBackend()).getTime()? "table-danger": ""}>
                                                            <td>{index+1 + (10*(currentPage-1))}</td>
                                                            <td>{getTimingStringFromTimingNoOfSlot(booking?.timingNo)}</td>
                                                            <td>{booking?.studioNo}</td>
                                                            <td>{Math.trunc(booking?.slotNo % 10)}</td>
                                                            <td>{localDateStringToDDMMYYYY(booking?.bookings?.date)}</td>
                                                            <Tooltip title={booking?.bookings?.program} key={booking?.bookings?._id} color='grey' placement="left">
                                                                <td><span className='d-inline-block text-truncate' style={{width: '200px'}}>{booking?.bookings?.program}</span></td>
                                                            </Tooltip>
                                                            <td>{booking?.bookings?.degree}</td>
                                                            <td>{booking?.bookings?.semester}</td>
                                                            <td>{`${booking?.user_doc?.name} ${booking?.user_doc?.lastname}`}</td>
                                                            <td>{booking?.user_doc?.role}</td>
                                                            <td>{booking?.user_doc?.email}</td>
                                                            <Tooltip title={booking?.bookings?.reasonForCancel} key={booking?.bookings?._id}>
                                                            <td><span className='d-inline-block text-truncate' style={{width: '100px'}}>{booking?.bookings?.reasonForCancel}</span></td>
                                                            </Tooltip>
                                                        </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </TableJi>
                            <Pagination>
                                <ResponsivePagination
                                    current={currentPage}
                                    total={totalPages}
                                    onPageChange={page => handlePageChange(page)}
                                />
                            </Pagination>
                        </TableAndPage> : (!loading && error ?
                            <Result
                                status="404"
                                title={`There is some error`}
                                subTitle="Oops! try again later or try to reload the page"
                            /> : !loading && <Result
                                status="404"
                                title={`There are no bookings to manage`}
                                subTitle="You are free, feel free to read some News"
                            />)
                    }
                
            </TableContainer>
        </ContentContainer>
        </Spin>
    </InnerContainer>
</Container>
  )
}

export default Cancelled