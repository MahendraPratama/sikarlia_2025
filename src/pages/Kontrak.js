/*!
  =========================================================
  * Muse Ant Design Dashboard - v1.0.0
  =========================================================
  * Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
  * Copyright 2021 Creative Tim (https://www.creative-tim.com)
  * Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
  * Coded by Creative Tim
  =========================================================
  * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import {
  Row,
  Col,
  Card,
  Statistic,
  Button,
  List,
  Descriptions,
  Avatar,
  Title,
  message,
  Progress,
  Upload,
  Radio,
  Typography,
  Table,
  Input,
  Popconfirm,
} from "antd";

import { PlusCircleFilled, UserDeleteOutlined, SearchOutlined, EyeFilled, EditFilled, DeleteFilled  } from "@ant-design/icons";
import { Component } from "react";

import { deleteDataKontrak, loadDataKontrak } from "../utils/general-api";
import { iconKontrak } from "../utils/general-ico";
import { commafy, convertTanggal, convertTipeKontrak } from "../utils/general-func";

const fileMaster = {
  '50200PL-NonLS':'/kontrak50_200PL.docx',
  '50200NonPL-NonLS':'/kontrak50_200.docx',
  '200up-NonLS':'/kontrak200up.docx',
  '100PL-NonLS':'/kontrak50_200PL.docx',
  '100NonPL-NonLS':'/kontrak50_200.docx',
  '100up-NonLS':'/kontrak200up.docx',

  '50200PL-LS':'/kontrak50_200PL_LS.docx',
  '50200NonPL-LS':'/kontrak50_200_LS.docx',
  '200up-LS':'/kontrak200up_LS.docx',
  '100PL-LS':'/kontrak50_200PL_LS.docx',
  '100NonPL-LS':'/kontrak50_200_LS.docx',
  '100up-LS':'/kontrak200up_LS.docx',
}

class Kontrak extends Component {
  constructor(props){
    super(props)
    this.state={
      userid:null,
      data:[],
      dataRender:[],
      dataToEdit:[],
      search:"",

    }
  }
  componentDidMount(){
    this.loadData();
  }
  async loadData(){
    const usertype = localStorage.getItem("user_type");
    const userid = localStorage.getItem("user_session");
    const {search} = this.state;
    const yearFilter = localStorage.getItem("yearFilter");

    var dataRet = await loadDataKontrak(userid, usertype, search, yearFilter);
    //this.drawData(dataRet);
    this.setState({dataToEdit : dataRet, dataRender: dataRet});
    //console.log(dataRet);
  }
  
  render (){
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const { dataRender } = this.state;
    const { Title } = Typography;
    const formProps = {
      name: "file",
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      headers: {
        authorization: "authorization-text",
      },
      onChange(info) {
        if (info.file.status !== "uploading") {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === "done") {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === "error") {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
    // table code start
    const columns = [
      {
        title: "Nama Pekerjaan",
        dataIndex: "namaPekerjaan",
        key: "namaPekerjaan",
        render: (text, record)=> 
          <>
            <Avatar.Group>
              <Avatar
                className="shape-avatar"
                shape="square"
                size={40}
                src={iconKontrak}
              ></Avatar>
              <div className="avatar-info">
                <Title level={5}>{text.substring(0,70)+(text.length>70 ? "..." : "")}</Title>
                <p style={{fontSize:12}}>Kontrak {convertTipeKontrak(record.tipeKontrak).name}</p>
              </div>
            </Avatar.Group>
          </>
        //width: "32%",
      },
      {
        title: "Pemenang",
        dataIndex: "namaPerusahaan",
        key: "namaPerusahaan",
        render: (text, record) =>
            <>
              <div className="author-info">
                <Title level={5}>{text}</Title>
                <p style={{fontSize:12}}>Rp. {commafy(record.hrgtotal)}</p>
              </div>
            </>
      },
    
      {
        title: "Tanggal SPK",
        key: "penandatangananKontrak",
        dataIndex: "penandatangananKontrak",
        render: text=>
          <>
          <p style={{fontSize:12}}>{convertTanggal(text)}</p>
          </>
      },
      {
        title: "Action",
        key: "unique_id",
        dataIndex: "unique_id",
        render: text=>
          <>
            <Button title="Detail" color="cyan" variant="solid" shape="round" icon={<EyeFilled/>} size="small" 
            
            />
            &nbsp;
            <Button title="Ubah" color="primary" variant="solid" shape="round" icon={<EditFilled/>} size="small" />
            &nbsp;
            <Popconfirm
              title="Hapus Data"
              description="Anda yakin ingin menghapus data ini?"
              onConfirm={()=> {this.confirmDelete(text)}}
              //onCancel={cancel}
              okText="Ya"
              cancelText="Tidak"
            >
              <Button title="Hapus" color="danger" variant="solid" shape="round" icon={<DeleteFilled/>} size="small"/> 
            </Popconfirm>
          </>
      },
    ];
   
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              variant={"borderless"}
              className="criclebox tablespace mb-24"
              title={
                <Button type="primary" className="tag-primary" icon={<PlusCircleFilled />}>
                  Kontrak Baru
                </Button>
              }
              extra={
                  <Input
                    //className="header-search"
                    placeholder="Type here..."
                    prefix={<SearchOutlined />}
                  />
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={dataRender}
                  pagination={{ position: ["none", "bottomCenter"] }}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );

  }

  async confirmDelete(unique_id){
    await deleteDataKontrak(unique_id);
    this.loadData();
  }
}

export default Kontrak;
