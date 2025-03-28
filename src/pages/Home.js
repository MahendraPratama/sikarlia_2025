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
} from "@ant-design/icons";

import { commafy, convertTipeKontrak } from "../utils/general-func";

class Home extends Component {
  constructor(props){
    super(props)
    this.state={
      //dtDash:false,
    }
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
    var dtAkt = dtDash.dataAktivitas[0];
    var tipeKontrak = convertTipeKontrak(dtAkt.tipeKontrak);
    var judulKontrak = dtAkt.namaPekerjaan;
    var perusahaan = dtAkt.namaPerusahaan;
    var nilaiKontrak = commafy(dtAkt.hrgtotal);

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
                <Card bordered={false} className="criclebox ">
                  <div className="number">
                    <Row align="middle" gutter={[24, 0]}>
                      <Col xs={18}>
                        <span>{c.today}</span>
                        <Title level={3}>
                          {c.title} <small className={c.bnb} style={{color:"black"}}>{c.persent}</small>
                          &nbsp;
                          <Button type="link" title="Lihat Detail" style={{padding:0}}><SelectOutlined/></Button>
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
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24">
              <Card bordered={false} className="criclebox card-info-2 h-full"
              >
                <Row justify="space-between" align="middle" gutter={[24, 0]}>
                    <Col span={24} md={16} className="col-info">
                    <p style={{color:"#0202c7", paddingLeft:10, fontSize:12}}>Dokumen Kontrak | {tipeKontrak}</p>
                      <Avatar.Group>
                        <Avatar size={74} shape="square" src="https://img.icons8.com/?size=100&id=119056&format=png&color=000000" />
                        <div className="avatar-info" style={{paddingLeft:20}}>
                          <h3 className="font-semibold m-0">
                            {judulKontrak}
                          </h3>
                          <Row>
                            <Avatar size={20} src="https://img.icons8.com/?size=100&id=lrrWa22VGVi6&format=png&color=000000"/>
                            &nbsp;<p style={{fontSize:12}}>{perusahaan}</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Avatar size={20} src="https://img.icons8.com/?size=100&id=KyaxbI6JuwGT&format=png&color=000000"/>
                            &nbsp;<p style={{fontSize:12}}>Rp. {nilaiKontrak}</p>
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
                        <Button shape="round" style={{backgroundColor:"#40c702", color:"white"}}>
                          <CloudDownloadOutlined/>Download
                        </Button>
                        &nbsp;
                        <Button shape="round">
                          <EditOutlined/>Edit
                        </Button>
                      </Col>
                    </Row>
              </Card>
            </Col>
          </Row> 

          <Row gutter={[24, 0]}>
            <Col xs={24}><h3 style={{padding:15}}>Informasi</h3></Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24">
              <Card bordered={false} className="criclebox card-info-2 h-full"
              >
                <Row justify="space-between" align="middle" gutter={[24, 0]}>
                    <Col span={24} md={16} className="col-info">
                    <p style={{color:"#0202c7", paddingLeft:10, fontSize:12}}>Dokumen Kontrak | Barang & Jasa Lainnya | 50-200</p>
                      <Avatar.Group>
                        <Avatar size={74} shape="square" src="https://img.icons8.com/?size=100&id=119056&format=png&color=000000" />
                        <div className="avatar-info" style={{paddingLeft:20}}>
                          <h3 className="font-semibold m-0">
                            Pembuatan Modul Literasi Digital seri Dampak Teknologi Digital terhadap Psikologi
                          </h3>
                          <Row>
                            <Avatar size={20} src="https://img.icons8.com/?size=100&id=lrrWa22VGVi6&format=png&color=000000"/>
                            &nbsp;<p style={{fontSize:12}}>PT. BINTANG BRAVO EXPLORA</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Avatar size={20} src="https://img.icons8.com/?size=100&id=KyaxbI6JuwGT&format=png&color=000000"/>
                            &nbsp;<p style={{fontSize:12}}>Rp. 197,136,000</p>
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
                        <Button shape="round" style={{backgroundColor:"#40c702", color:"white"}}>
                          <CloudDownloadOutlined/>Download
                        </Button>
                        &nbsp;
                        <Button shape="round">
                          <EditOutlined/>Edit
                        </Button>
                      </Col>
                    </Row>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} className="mb-24">
              <Card bordered={false} className="criclebox card-info-2 h-full"
              >
                <Row justify="space-between" align="middle" gutter={[24, 0]}>
                    <Col span={24} md={16} className="col-info">
                    <p style={{color:"#0202c7", paddingLeft:10, fontSize:12}}>Dokumen Kontrak | Barang & Jasa Lainnya | 50-200</p>
                      <Avatar.Group>
                        <Avatar size={74} shape="square" src="https://img.icons8.com/?size=100&id=119056&format=png&color=000000" />
                        <div className="avatar-info" style={{paddingLeft:20}}>
                          <h3 className="font-semibold m-0">
                            Pembuatan Modul Literasi Digital seri Dampak Teknologi Digital terhadap Psikologi
                          </h3>
                          <Row>
                            <Avatar size={20} src="https://img.icons8.com/?size=100&id=lrrWa22VGVi6&format=png&color=000000"/>
                            &nbsp;<p style={{fontSize:12}}>PT. BINTANG BRAVO EXPLORA</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <Avatar size={20} src="https://img.icons8.com/?size=100&id=KyaxbI6JuwGT&format=png&color=000000"/>
                            &nbsp;<p style={{fontSize:12}}>Rp. 197,136,000</p>
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
                        <Button shape="round" style={{backgroundColor:"#40c702", color:"white"}}>
                          <CloudDownloadOutlined/>Download
                        </Button>
                        &nbsp;
                        <Button shape="round">
                          <EditOutlined/>Edit
                        </Button>
                      </Col>
                    </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default Home;
