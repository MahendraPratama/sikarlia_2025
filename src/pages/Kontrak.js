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
  notification,
} from "antd";

import { PlusCircleFilled, UserDeleteOutlined, SearchOutlined, 
  EyeFilled, EditFilled, DeleteFilled, CloseOutlined,
  CloudDownloadOutlined, EditOutlined,
} from "@ant-design/icons";
import { Children, Component } from "react";

import { deleteDataKontrak, loadDataKontrak } from "../utils/general-api";
import { iconKontrak } from "../utils/general-ico";
import { commafy, convertTanggal, convertTipeKontrak, generateViewerKontrak, kontrakPreview, fileMaster, generateViewerKontrak2025, renderLoading } from "../utils/general-func";
import { generateDocument, generateDocument2025 } from "../utils/generator-docx";

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
      dInmPkj:"namaPekerjaan",
      dInmrKt:"nmr",
      dInmPrsh:"namaPerusahaan",
      dInilai:"hrgtotal",
      dItglSpk:"penandatangananKontrak",
      dIuniqueId:"unique_id",
      yearFilter:0,
      stateLoading: false,
      id_kontrak:null,
    }
  }
  componentDidMount(){
    this.loadData();
  }
  togleLoading(){
    let curr = this.state.stateLoading;
    this.setState({stateLoading: !curr});
  }
  async loadData(){
    this.togleLoading();
    const usertype = localStorage.getItem("user_type");
    const userid = localStorage.getItem("user_session");
    const {search} = this.state;
    const yearFilter = localStorage.getItem("yearFilter");

    const yearNumber = parseInt(yearFilter);
    if (yearNumber < 2025) {
      this.setState({
        dInmPkj:"namaPekerjaan",
        dInmPrsh:"namaPerusahaan",
        dInilai:"hrgtotal",
        dItglSpk:"penandatangananKontrak",
        dIuniqueId:"unique_id",
        dInmrKt:"nmr"
      });
    }else{
      this.setState({
        dInmPkj:"nama_pekerjaan",
        dInmPrsh:"nama_perusahaan",
        dInilai:"nilai_spk",
        dItglSpk:"tanggal_spk",
        dIuniqueId:"id",
        dInmrKt:"nomor_kontrak"
      });
    }

    var dataRet = await loadDataKontrak(userid, usertype, search, yearFilter);
    //this.drawData(dataRet);
    this.setState({dataToEdit : dataRet, dataRender: dataRet, yearFilter: yearNumber});
    this.togleLoading();
  }
  
  render (){
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const { dataRender, toggleDrawer, descPreviewKontrak, dInmrKt,
      dInmPkj, dInmPrsh, dInilai, dItglSpk, dIuniqueId, stateLoading,
     } = this.state;
    const { Title } = Typography;
    const { Search } = Input;
    
    const columns = [
      // {
      //   title: "",
      //   dataIndex: dInmrKt,
      //   key: dInmrKt,
      //   render: (text, record) =>
      //       <>
      //         <p>{text}</p>
      //       </>
      // },
      {
        title: "Nama Pekerjaan",
        dataIndex: dInmPkj,
        key: dInmPkj,
        render: (text, record)=> 
          <>
            <p style={{paddingLeft:"2%", color:"#1677ff", fontSize:11}}>{record[dInmrKt]}</p>
            <Avatar.Group>
              
              <Avatar
                className="shape-avatar"
                shape="square"
                size={40}
                src={iconKontrak}
              ></Avatar>
              <div className="avatar-info">
                <Title level={5}>{text.substring(0,70)+(text.length>70 ? "..." : "")}</Title>
                <p style={{fontSize:12}}>Kontrak Barang & Jasa Lainnya | 50-200</p>
              </div>
            </Avatar.Group>
          </>
        //width: "32%",
      },
      {
        title: "Pemenang",
        dataIndex: dInmPrsh,
        key: dInmPrsh,
        render: (text, record) =>
            <>
              <div className="author-info">
                <Title level={5}>{text}</Title>
                <p style={{fontSize:12}}>Rp. {commafy(record[dInilai])}</p>
              </div>
            </>
      },
    
      {
        title: "Tanggal SPK",
        key: dItglSpk,
        dataIndex: dItglSpk,
        render: text=>
          <>
          <p style={{fontSize:12}}>{convertTanggal(text)}</p>
          </>
      },
      {
        title: "Action",
        key: dIuniqueId,
        dataIndex: dIuniqueId,
        render: text=>
          <>
            <Button title="Detail" color="" variant="solid" shape="round" icon={<EyeFilled/>} size="small" 
              onClick={()=>{this.showDrawer(text)}}
            />
            &nbsp;
            <Button title="Ubah" color="primary" variant="solid" shape="round" icon={<EditFilled/>} size="small" 
              onClick={()=>{this.editKontrak(text)}}
            />
            &nbsp;
            <Popconfirm
              title="Hapus Data"
              description="Anda yakin ingin menghapus data ini?"
              onConfirm={()=> {this.confirmDelete(text)}}
              //onCancel={cancel}
              okText="Ya"
              cancelText="Tidak"
            >
              <Button title="Hapus" color="red" variant="solid" shape="round" icon={<DeleteFilled/>} size="small"/> 
            </Popconfirm>
          </>
      },
    ];
   
    return (
      <>
      {renderLoading(stateLoading)}
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
                <Button shape="round"
                  onClick={()=>[
                    this.editKontrak(this.state.id_kontrak)
                  ]}
                >
                  <EditOutlined/>Edit
                </Button>
              </Space>
            </Col>
          </Row>
        </Drawer>
        <Row gutter={[24, 0]}>
          <Col style={{padding:20}} xs="24" xl={24}>
            <Button  size="small" type="primary" className="tag-primary" icon={<PlusCircleFilled />}
              onClick={()=>{
                this.props.history.push('/buat_kontrak');
              }}
            >
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

  async editKontrak(id){
    const { yearFilter } = this.state;
    if (yearFilter >= 2025){
      this.props.history.push(`/buat_kontrak/${id}`);  
    }else{
      notification.warning({
        message: 'Edit Tidak Diizinkan',
        description: 'Data kontrak dibawah tahun 2025 tidak dapat diedit. Silakan buat kontrak baru.',
        placement: 'topRight',
        duration: 4,
      });
    }
  }
  async confirmDelete(unique_id){
    const { yearFilter } = this.state;
    if (yearFilter < 2025){
      await deleteDataKontrak(unique_id, "Old");
    }
    else{
      await deleteDataKontrak(unique_id, "New");
    }
    this.loadData();
  }

  searchData = (searchText) => {
    this.setState({search: searchText}, ()=>{
      this.loadData();
    });
  }

  async showDrawer(unique_id){//Preiview Kontrak
    this.setState({toggleDrawer: true, id_kontrak: unique_id});
    window.scrollTo(0,0);

    const { yearFilter } = this.state;
    var objRet,dataRet;
    if (yearFilter < 2025){
      var dataSelected = this.state.dataRender.find(x => x.unique_id === unique_id);
      objRet = kontrakPreview(dataSelected, "Old");
      dataRet = await generateViewerKontrak(dataSelected);
    }else{
      var dataSelected = this.state.dataRender.find(x => x.id === unique_id);
      dataRet = await generateViewerKontrak2025(dataSelected);
      objRet = kontrakPreview(dataSelected, "New");
    }
    this.setState({descPreviewKontrak: objRet, urlIFrame: dataRet.urlIframe, dataToGenerate: dataRet.dataProcessed});
  }

  async downloadKontrak(){
    const { yearFilter } = this.state;

    this.setState({loadingDownload: true});
    setTimeout(() => {
      this.setState({loadingDownload: false});
    }, 2000);
    var dt = this.state.dataToGenerate;

    try{
      if (yearFilter < 2025){
        await generateDocument(dt,fileMaster[dt.tipeKontrak.concat("-",dt.LSorNon)]);
      }
      else
      {
        await generateDocument2025(dt);
      }
    }catch{

    }finally{
      //this.setState({loadingDownload: false});
    }
  }

  closeDrawer(){
    this.setState({toggleDrawer: false});
  }
}

export default Kontrak;
