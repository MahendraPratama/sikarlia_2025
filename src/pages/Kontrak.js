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
  Drawer,
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
  Space,
} from "antd";

import { PlusCircleFilled, UserDeleteOutlined, SearchOutlined, 
  EyeFilled, EditFilled, DeleteFilled, CloseOutlined,
  CloudDownloadOutlined, EditOutlined,
} from "@ant-design/icons";
import { Children, Component } from "react";

import { deleteDataKontrak, loadDataKontrak } from "../utils/general-api";
import { iconKontrak } from "../utils/general-ico";
import { commafy, convertTanggal, convertTipeKontrak, generateViewerKontrak, kontrakPreview, fileMaster } from "../utils/general-func";
import { generateDocument } from "../utils/generator-docx";

class Kontrak extends Component {
  constructor(props){
    super(props)
    this.state={
      userid:null,
      data:[],
      dataRender:[],
      dataToEdit:[],
      search:"",
      toggleDrawer: false,
      descPreviewKontrak:[],
      loadingDownload: false,
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
    const { dataRender, toggleDrawer, descPreviewKontrak } = this.state;
    const { Title } = Typography;
    const { Search } = Input;
    
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
              onClick={()=>{this.showDrawer(text)}}
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
        <Drawer
          title="Preview"
          placement="top"
          closable={false}
          height={500}
          onClose={()=>{this.closeDrawer()}}
          open={toggleDrawer}
          getContainer={false}
          extra={
            <Space>
              <Button color="danger" size="small" variant="solid" 
                onClick={()=>{this.closeDrawer()}} icon={<CloseOutlined/>}>
                Close
              </Button>
            </Space>
          }
        >
          <Row gutter={[24, 0]}>
            <Col xs={6.5} xl={6.5}>
              <iframe id="viewer" 
                height="350px"
                key={this.state.keyIframe}
                src={
                  this.state.urlIFrame
                }
              >
              </iframe>
            </Col>
            <Col xs={17} xl={17}>
              <Descriptions title="Info Kontrak" bordered items={descPreviewKontrak} size="small"/>
              <br/>
              <Space>
                  <Button shape="round" 
                    loading={this.state.loadingDownload}
                    icon={<CloudDownloadOutlined/>}
                    onClick={()=>{this.downloadKontrak()}}
                    style={{backgroundColor:"#40c702", color:"white"}}
                    >
                    Download
                  </Button>
                  <Button shape="round">
                  <EditOutlined/>Edit
                </Button>
              </Space>
            </Col>
          </Row>
        </Drawer>
        <Row gutter={[24, 0]}>
          <Col style={{padding:20}} xs="24" xl={24}>
            <Button  size="small" type="primary" className="tag-primary" icon={<PlusCircleFilled />}>
              Kontrak Baru
            </Button>
          </Col>
        </Row>
        
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              variant={"borderless"}
              className="criclebox tablespace mb-24"
              title={"Data Kontrak"}
              extra={
                <Space>
                  <Search size="large" placeholder="cari kontrak..." onSearch={this.searchData} style={{ width: 300 }} />
                </Space>
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

  searchData = (searchText) => {
    this.setState({search: searchText}, ()=>{
      this.loadData();
    });
  }

  async showDrawer(unique_id){//Preiview Kontrak
    this.setState({toggleDrawer: true});
    window.scrollTo(0,0);
    var dataSelected = this.state.dataRender.find(x => x.unique_id === unique_id);
    var objRet = kontrakPreview(dataSelected);
    var dataRet = await generateViewerKontrak(dataSelected);
    this.setState({descPreviewKontrak: objRet, urlIFrame: dataRet.urlIframe, dataToGenerate: dataRet.dataProcessed});
  }

  downloadKontrak(){
    this.setState({loadingDownload: true});
    setTimeout(() => {
      this.setState({loadingDownload: false});
    }, 3000);
    var dt = this.state.dataToGenerate;
    generateDocument(dt,fileMaster[dt.tipeKontrak.concat("-",dt.LSorNon)]);
  }

  closeDrawer(){
    this.setState({toggleDrawer: false});
  }
}

export default Kontrak;
