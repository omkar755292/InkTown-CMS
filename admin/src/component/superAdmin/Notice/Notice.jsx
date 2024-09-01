import React, { useState } from 'react'
import PageHeader from '../../../layout/layoutsection/pageHeader/pageHeader'
import NoticeListTable from './NoticeListTable'
import axios from 'axios'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../GlobalKey/GlobalKey';

const Notice = () => {

    const [text, setText] = useState("");
    const [myToken, setMyToken] = useState(localStorage.getItem('token')); // Get token from localStorage
    const navigate = useNavigate();

    const submitNotice = () => {

        axios
            .post(api + `/notice/post`,
                {
                    text: text
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + myToken,
                    }
                })
            .then(async response => {
                console.log(response)
                alert('Submited');
            })
            .catch(error => {
                console.log(error)
                if (error.response.status == 403 || error.response.status == 401) {
                    localStorage.setItem("token", null);
                    localStorage.removeItem('token');
                    localStorage.clear();
                    navigate('/');
                } else {
                    alert(error)
                }
            });

        setText('');
    };


    return (
        <div>
            <PageHeader currentpage='Notice' activepage='Dashboard' mainpage='Notice' />

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <div className="box">
                        <div className="box-header">
                            <h5 className="box-title">Notice Editor</h5>
                        </div>
                        <div className="box-body">
                            <ReactQuill theme="snow" value={text} onChange={setText} />
                            <div>
                                <button
                                    className='ti-btn ti-btn-primary'
                                    onClick={submitNotice}
                                >
                                    Submit</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <div className="box xl:overflow-auto">
                        <div className="box-header">
                            <h5 className="box-title">Notice</h5>
                        </div>
                        <div className="box-body">
                            <div className="overflow-auto table-bordered">
                                <NoticeListTable />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notice