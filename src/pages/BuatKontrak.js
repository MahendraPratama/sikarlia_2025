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
  Steps,
  Form,
  Button,
  DatePicker,
  Select,
  Avatar,
  Title,
  message,
  Progress,
  Upload,
  Radio,
  Typography,
  Space,
  Input,
  InputNumber,
  Divider ,
} from "antd";

import { PlusCircleFilled, UserDeleteOutlined, SearchOutlined, 
  EyeFilled, EditFilled, DeleteFilled, CloseOutlined,
  CloudDownloadOutlined, EditOutlined,
} from "@ant-design/icons";
import { Children, Component } from "react";
import React from 'react';

import { deleteDataKontrak, loadDataKontrak } from "../utils/general-api";
import { iconKontrak } from "../utils/general-ico";
import { commafy, convertTanggal, convertTipeKontrak, generateViewerKontrak, kontrakPreview, fileMaster, getDayDiff } from "../utils/general-func";
import { generateDocument, generateDocument2025 } from "../utils/generator-docx";
const perusahaan = [
  "PT Maju Jaya",
  "PT Sumber Rezeki",
  "CV Karya Abadi",
  "PT Sejahtera Bersama",
  "CV Kiat Mandiri",
];
const { TextArea } = Input;
class BuatKontrak extends Component {
  formRef = React.createRef();
  // constructor(props){
  //   super(props)
  //   this.state={
  //     userid:null,
  //     data:[],
  //     dataRender:[],
  //     dataToEdit:[],
  //     search:"",
  //     toggleDrawer: false,
  //     descPreviewKontrak:[],
  //     loadingDownload: false,
  //     currentStep:0,
  //   }

  //   //this.formRef = null;
  // }

  state = {
    currentStep: 0,

  };
  componentDidMount(){
   
  }

  getPreviousBusinessDay = (date, intrvl=1) => {
    let d = date.subtract(intrvl, "day");

    // 0 = Minggu, 6 = Sabtu
    while (d.day() === 0 || d.day() === 6) {
      d = d.subtract(1, "day");
    }

    return d;
  };

  handleSPKChange = (date) => {
    if (!date) return;

    // Ambil H-1 dan mundurkan sampai hari kerja
    const tglSPPBJ = this.getPreviousBusinessDay(date,4);
    const tglDokPnw = this.getPreviousBusinessDay(tglSPPBJ,2);
    const tglUndPPBJ = this.getPreviousBusinessDay(tglDokPnw,2);
    const tglHPS = this.getPreviousBusinessDay(tglUndPPBJ);
    const tglPersiapan = this.getPreviousBusinessDay(date,1);
    this.formRef.current.setFieldsValue({
      tgl_persiapan: tglPersiapan,
      tgl_sppbj: tglSPPBJ,
      tgl_nodin_ppbj: tglSPPBJ,
      tgl_pphp: tglSPPBJ,
      tgl_bahp: tglSPPBJ,
      tgl_bakh: tglSPPBJ,
      tgl_baep: tglSPPBJ,
      tgl_bapp: tglSPPBJ,
      tgl_dok_pnw: tglDokPnw,
      tgl_und_ppbj: tglUndPPBJ,
      tgl_hps: tglHPS,
      tgl_nodin_ppk: tglHPS
    });
  }; 
  handleBAPBChange = (date) =>{
    if (!date) return;
    this.formRef.current.setFieldsValue({
      tgl_bast: date,
      tgl_bap:date
    });
    const allValues = this.formRef.current.getFieldsValue(true);
    const selisih = getDayDiff(
      allValues.tgl_spk.format("DD-MM-YYYY"),
      date.format("DD-MM-YYYY")
    );
    this.formRef.current.setFieldsValue({
      angka_pelaksanaan: selisih
    });
  }
  next = async () => {
    try {
      const val = await this.formRef.current.validateFields();
      console.log(val);
      this.setState({ currentStep: this.state.currentStep + 1 });
    } catch {
      message.error("Harap isi field yang diperlukan.");
    }
  };
  prev = () => {
    this.setState({ currentStep: this.state.currentStep - 1 });
  };
  onFinish = async () => {
    try{
      const values = await this.formRef.current.validateFields();
      console.log(values);
      const allValues = this.formRef.current.getFieldsValue(true);
      console.log("DATA FORM:", allValues);
      console.log(allValues.tgl_baep.$D);
      generateDocument2025(allValues,false);
      //console.log(this.formRef);
    }catch{
      console.log("Ada field yang belum valid.");
    }
    
  };
  
  render (){
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const { currentStep, toggleDrawer, descPreviewKontrak } = this.state;
    const { Title } = Typography;
    const { Search } = Input;
    
    const steps = [
      {
        title: 'Data Pekerjaan',
        content: (
          <Card
            variant={"borderless"}
            className="site-card-border-less-wrapper"
            title={"Input Data Pekerjaan"}
          >
              <Form.Item
                label="Nama Pekerjaan"
                name="nama_pekerjaan"
                rules={[{ required: true, message: 'Masukkan nama pekerjaan!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Nomor Kontrak"
                name="no_kontrak"
                rules={[{ required: true, message: 'Masukkan nomor kontrak' }]}
              >
                <InputNumber min={1}/>
              </Form.Item>

              <Form.Item
                label="Nilai HPS"
                name="harga_hps"
                rules={[{ required: true, message: 'Masukkan nilai HPS' }]}
              >
                <InputNumber
                  min={0}
                  style={{width:200}}
                  formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\Rp.\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                label="Harga Penawaran Pemenang / SPK"
                name="harga_penawaran"
                rules={[{ required: true, message: 'Masukkan Harga Penawaran Pemenang' }]}
              >
                <InputNumber
                  min={0}
                  style={{width:200}}
                  formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\Rp.\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                label="Harga Penawaran Pembanding"
                name="harga_penawaran_pmb"
                rules={[{ required: true, message: 'Masukkan Penawaran Pembanding' }]}
              >
                <InputNumber
                  min={0}
                  style={{width:200}}
                  formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\Rp.\s?|(,*)/g, '')}
                />
              </Form.Item>
          </Card>)
          ,
          
      },
      {
        title: 'Jadwal Pekerjaan',
        content: (
          <Card
            variant={"borderless"}
            className="site-card-border-less-wrapper"
            title={"Input Jadwal Pekerjaan"}
          >
            <Row gutter={16}>
              <Col span={12}>
              <Form.Item
                label="Tanggal Nodin PPK"
                name="tgl_nodin_ppk"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal HPS"
                name="tgl_hps"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal Undangan PPBJ"
                name="tgl_und_ppbj"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal Dokumen Penawaran"
                name="tgl_dok_pnw"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal BAPP"
                name="tgl_bapp"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal BAEP"
                name="tgl_baep"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal BAKH"
                name="tgl_bakh"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal BAHP"
                name="tgl_bahp"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal PPHP"
                name="tgl_pphp"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal Nodin PPBJ"
                name="tgl_nodin_ppbj"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal SPPBJ"
                name="tgl_sppbj"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12} hidden={true}>
                <Form.Item
                  label="Tanggal Persiapan"
                  name="tgl_persiapan"
                >
                  <DatePicker format="DD-MM-YYYY"/>
                </Form.Item>
              </Col>
              <Col span={12}></Col>
              <Col span={12} style={{backgroundColor:"aliceblue", border:'groove'}}>
              <Form.Item
                label="Tanggal SPK"
                name="tgl_spk"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker onChange={this.handleSPKChange}
                format="DD-MMMM-YYYY"/>
              </Form.Item>
              </Col>
              <Col span={12} style={{backgroundColor:"aliceblue", border:'groove'}}>
              <Form.Item
                label="Tanggal BAPB"
                name="tgl_bapb"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker onChange={this.handleBAPBChange}
                format="DD-MMMM-YYYY"/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal BAST"
                name="tgl_bast"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                label="Tanggal BAP"
                name="tgl_bap"
                rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
              >
                <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
              </Form.Item>
              </Col>
              <Col span={12} hidden={true}>
                <Form.Item
                  label="Waktu Pelaksanaan"
                  name="angka_pelaksanaan"
                >
                  <InputNumber/>
                </Form.Item>
              </Col>
            </Row>
          </Card>)
          ,
      },
      {
        title: 'Perusahaan Pemenang',
        content: (
          <Card
            variant={"borderless"}
            className="site-card-border-less-wrapper"
            title={"Input Data Perusahaan"}
          >
            <Row gutter={20}>
              <>
                <Col span={12}>
                  <Divider orientation="left" plain>
                    Perusahaan
                  </Divider>
                  <>
                  <Form.Item
                    label="Nama Perusahaan Pemenang"
                    name="perusahaan_pemenang"
                    rules={[{ required: true, message: 'Masukkan nama perusahaan!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="NPWP Perusahaan"
                    name="npwp"
                    rules={[{ required: true, message: 'Masukkan NPWP perusahaan!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Alamat Perusahaan"
                    name="alamat_perusahaan"
                    rules={[{ required: true, message: 'Masukkan Alamat perusahaan!' }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                  </>

                  <Divider orientation="left" plain>
                    Direktur
                  </Divider>
                  <Form.Item
                    label="Nama Direktur"
                    name="nm_dir_perusahaan_pemenang"
                    rules={[{ required: true, message: 'Masukkan nama direktur!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="NIK Direktur"
                    name="nik_dir"
                    rules={[{ required: true, message: 'Masukkan NIK direktur!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Jabatan"
                    name="jbt_perusahaan_pemenang"
                    rules={[{ required: true, message: 'Masukkan jabatan penandatangan perusahaan!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                {/* BATAS TENGAH */}
                <Col span={12}>
                  <Divider orientation="left" plain>
                    Data Rekening Koran
                  </Divider>
                  <>
                  <Form.Item
                    label="Nomor Rekening Perusahaan"
                    name="norek"
                    rules={[{ required: true, message: 'Masukkan nomor rekening perusahaan!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Nama Rekening Perusahaan"
                    name="atas_nama_bank"
                    rules={[{ required: true, message: 'Masukkan nama rekening perusahaan!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Nama Bank"
                    name="bank"
                    rules={[{ required: true, message: 'Masukkan nama bank!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Cabang Bank"
                    name="cabang"
                    rules={[{ required: true, message: 'Masukkan nama cabang bank perusahaan!' }]}
                  >
                    <Input />
                  </Form.Item>
                  </>
                </Col>
              </>
            </Row>
            
          </Card>
        ),
      },
    ];
    const items = steps.map((item) => ({ key: item.title, title: item.title }));


    return (
      <>
        <Row gutter={[24,0]}>
          <Steps size="small" current={currentStep} labelPlacement="vertical" 
          items={items} style={{paddingLeft:"10%", paddingRight:"10%"}}/>
        </Row>
        
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Form
              ref={this.formRef}
              //name="control-ref"
              wrapperCol={{ span: 20 }}
              layout={"vertical"}
              initialValues={{
                harga_hps: 0,
                harga_penawaran: 0,
                harga_penawaran_pmb: 0,
                jbt_perusahaan_pemenang: "Direktur",
                perusahaan_pemenang:"PT ABADI",
                npwp: "000",
                alamat_perusahaan: "Jalan ABD\nJakarta Pusat",
                nm_dir_perusahaan_pemenang: "Ali Akbar",
                nik_dir: "1113828199010002",
                bank: "Mandiri", cabang: "Kb Jeruk", norek: "127-128371-9992", 
                atas_nama_bank: "PT ABADI"
              }}
            >     
              {steps[currentStep].content}
              <Row justify="space-between" align="middle">
              <Col/>
              <br/><br/><br/>
              <Col>
                {currentStep===0?
                  <Button color="danger" variant="solid">Batal</Button> : 
                  <Button variant="solid" onClick={this.prev}>Sebelumnya</Button>
                }
                &nbsp;
                {currentStep===steps.length - 1?
                  <Button color="cyan" onClick={this.onFinish} variant="solid">Simpan</Button> :
                  <Button color="primary" variant="solid" onClick={this.next}>Selanjutnya</Button>
                }
              </Col>
              </Row>
              
            </Form>
          </Col>
        </Row>
        
      </>
    );

  }

  
}

export default BuatKontrak;
