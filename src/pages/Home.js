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
import React, { useState, Component } from "react";

import {
  Card,
  Col,
  Row,
  Typography,
  Tooltip,
  Progress,
  Upload,
  message,
  Button,
  Timeline,
  Radio,
  Avatar,
} from "antd";
import {
  ToTopOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  EditOutlined,
  BookOutlined,
  FileTextOutlined,
  SelectOutlined,
  CloudDownloadOutlined,
  EditFilled,
  SyncOutlined,
} from "@ant-design/icons";

import { commafy, convertTipeKontrak, convertTanggal, generateViewerKontrak, fileMaster } from "../utils/general-func";
import IconSikarlia from "../assets/images/logo/ico.png";
import { iconKontrak, iconPerusahaan, iconTanggalKontrak, iconNilaiKontrak } from "../utils/general-ico";
import { generateDocument } from "../utils/generator-docx";


class Home extends Component {
  constructor(props){
    super(props)
    this.state={
      //dtDash:false,
      loadingDownload: false
    }
  }
  async downloadRecentAct(){
    this.setState({loadingDownload: true});
    setTimeout(() => {
      this.setState({loadingDownload: false});
    }, 3000);
    var dtDash = JSON.parse(localStorage.getItem("dataDashboard"));
    var dtAkt = dtDash.dataAktivitas[0];

    var dataRet = await generateViewerKontrak(dtAkt);
    var dt = dataRet.dataProcessed;
    generateDocument(dt,fileMaster[dt.tipeKontrak.concat("-",dt.LSorNon)]);
  }
  render () {
    const { Title, Text } = Typography;

    const onChange = (e) => console.log(`radio checked:${e.target.value}`);


    var dtDash = JSON.parse(localStorage.getItem("dataDashboard"));
    var count = [
      {
        today: "Dokumen Kontrak",
        title: dtDash.countKontrak[0].ctr || 0,
        persent: "Dokumen",
        icon: <BookOutlined/>,
        bnb: "bnb2",
      },
      {
        today: "Dokumen Kuitansi",
        title: dtDash.countKuitansi[0].ctr,
        persent: "Dokumen",
        icon: <FileTextOutlined/>,
        bnb: "bnb2",
      }
    ];
    if(dtDash.dataAktivitas[0]!=undefined){
      var dtAkt = dtDash.dataAktivitas[0];
      var tipeKontrak = convertTipeKontrak(dtAkt.tipeKontrak).name;
      var judulKontrak = dtAkt.namaPekerjaan;
      var perusahaan = dtAkt.namaPerusahaan;
      var nilaiKontrak = commafy(dtAkt.hrgtotal);
      var tglKontrak = convertTanggal(dtAkt.date_created);
    }

    const dataInfo = [
      {
        title:"Update Sikarlia 2025",
        desc:"SiKarlia 2025 hadir dengan tampilan baru dan fitur tambahan untuk meningkatkan efisiensi! Sistem automasi dokumen pertanggungjawaban kontrak kini lebih intuitif, cepat, dan akurat, membantu Anda mengelola dokumen dengan mudah dan aman."
      },
      {
        title:"Update Nomor SK PPBJ dan DIPA 2025",
        desc:"SiKarlia 2025 kini mendukung update otomatis Nomor SK PPBJ dan DIPA 2025 pada template dokumen kontrak! Proses administrasi lebih cepat, akurat, dan efisien tanpa perlu input manual. Pastikan dokumen Anda selalu sesuai regulasi terbaru"
      }
    ]
    

    return (
      <>
        <div className="layout-content">
          <Row className="rowgap-vbox" gutter={[24, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24">
              <Card
                bodyStyle={{ display: "none" }}
                title={
                  <Row justify="space-between" align="middle" gutter={[24, 0]}>
                    <Col span={24} md={12} className="col-info">
                      <Avatar.Group>
                        <Avatar size={74} shape="square" src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_25.png" />
                        <div className="avatar-info" style={{padding:10}}>
                          <p>Selamat Datang</p>
                          <h2 className="font-semibold m-0">
                            {localStorage.getItem("user_name")}</h2>
                          
                        </div>
                      </Avatar.Group>
                    </Col>
                    <Col
                      span={24}
                      md={12}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button><EditOutlined/> Edit Profile</Button>
                    </Col>
                  </Row>
                }
              ></Card>
            </Col>
          </Row>
          
          <Row className="rowgap-vbox" gutter={[24, 0]}>
            {count.map((c, index) => (
              <Col
                key={index}
                xs={24}
                sm={24}
                md={12}
                lg={12}
                xl={12}
                className="mb-24"
              >
                <Card variant={"borderless"} className="criclebox ">
                  <div className="number">
                    <Row align="middle" gutter={[24, 0]}>
                      <Col xs={18}>
                        <span>{c.today}</span>
                        <Title level={3}>
                          {c.title} <small className={c.bnb} style={{color:"black"}}>{c.persent}</small>
                          &nbsp;
                          <Button type="link" title="Lihat Detail" style={{padding:0}}
                            onClick={()=>{
                              this.props.history.push('/kontrak');
                            }}
                          ><SelectOutlined/></Button>
                        </Title>
                      </Col>
                      <Col xs={6}>
                        <div className="icon-box">{c.icon}</div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24}><h3 style={{padding:15}}>Aktivitas</h3></Col>
            {
              
              
              dtAkt==null?
              
              <Col xs={24}><p style={{padding:20}}>- Belum ada aktivitas</p></Col>
              
              :

              <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24">
              <Card variant={"borderless"} className="criclebox card-info-2 h-full"
              >
                <Row justify="space-between" align="middle" gutter={[24, 0]}>
                    <Col span={24} md={16} className="col-info">
                      <p style={{color:"#0202c7", paddingLeft:10, fontSize:12}}>Dokumen Kontrak | {tipeKontrak}</p>
                      <Avatar.Group>
                        <Avatar size={74} shape="square" src={iconKontrak} />
                        <div className="avatar-info" style={{paddingLeft:20}}>
                          <h3 className="font-semibold m-0">
                            {judulKontrak}
                          </h3>
                          <Row>
                            <Avatar size={20} src={iconPerusahaan}/>
                            &nbsp;<p style={{fontSize:12}}>{perusahaan}</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Avatar size={20} src={iconNilaiKontrak}/>
                            &nbsp;<p style={{fontSize:12}}>Rp. {nilaiKontrak}</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Avatar size={20} src={iconTanggalKontrak}/>
                            &nbsp;<p style={{fontSize:12}}>{tglKontrak}</p>
                          </Row>
                          
                        </div>
                      </Avatar.Group>
                    </Col>
                  </Row>
                  <Row justify="space-between" align="middle">
                      <Col xs={6} className="col-info">
                      </Col>
                      <Col xs={12}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button shape="round" 
                          loading={this.state.loadingDownload}
                          icon={<CloudDownloadOutlined/>}
                          onClick={()=>{this.downloadRecentAct()}}
                          style={{backgroundColor:"#40c702", color:"white"}}
                          >
                          Download
                        </Button>
                        &nbsp;
                        <Button shape="round">
                          <EditOutlined/>Edit
                        </Button>
                      </Col>
                    </Row>
              </Card>
            </Col>
            }
          </Row> 

          <Row gutter={[24, 0]}>
            <Col xs={24}><h3 style={{padding:15}}>Informasi</h3></Col>
            {dataInfo.map((c, index)=>(
              <Col key={index} xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24">
                <Card variant={"borderless"} className="criclebox card-info-2 h-full"
                >
                  <Row justify="space-between" align="middle" gutter={[24, 0]}>
                    <Col span={24} md={24} className="col-info">
                      <Avatar.Group>
                        <Avatar size={74} shape="square" src={IconSikarlia} />
                        <div className="avatar-info" style={{paddingLeft:20}}>
                          <h3 className="font-semibold m-0">
                            {c.title}
                          </h3>
                          <p style={{fontSize:12}}>{c.desc}</p>                          
                        </div>
                      </Avatar.Group>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </>
    );
  }
}

export default Home;
