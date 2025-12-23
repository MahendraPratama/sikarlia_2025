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
  Divider, 
  Spin,
} from "antd";

import { PlusCircleFilled, UserDeleteOutlined, SearchOutlined, 
  EyeFilled, EditFilled, DeleteFilled, CloseOutlined,
  CloudDownloadOutlined, EditOutlined,
} from "@ant-design/icons";
import { Children, Component } from "react";
import React from 'react';

import { deleteDataKontrak, getDataPerusahaan, modifyDataPerusahaan } from "../utils/general-api";
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
const { Option } = Select;
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
    loading: false,
    options: [],
    dataSelectAda: false,
    isEdit:false,
  };
  async componentDidMount(){
   //var DataPerusahaan = await getDataPerusahaan();
   //this.setState({optionPerusahaan: DataPerusahaan});
  }

  UbahDataPerusahaan = () => {
    this.setState({ isEdit: true, dataSelectAda: false});
  }
  async saveData(userid, allValues){
    await modifyDataPerusahaan(userid, allValues);
  }
  simpanPerubahan = () => {
    this.setState({ isEdit: false, dataSelectAda: true});
    var isAdd = this.state.options[0].id === undefined ? true : false;
    //console.log("ini adalah tambah data Baru : "+isAdd);
    const allValues = this.formRef.current.getFieldsValue(true);
    const userid = localStorage.getItem("user_session");
    this.saveData(userid,allValues);
    
    //console.log(allValues);
  }

  searchPerusahaan = async (q) => {
    this.setState({ loading: true });

    const data = await getDataPerusahaan();
    
    const result = data.filter(item => 
      item.nama_perusahaan.toLowerCase().includes(q.toLowerCase())
    );

    console.log(result);

    setTimeout(() => {
      this.setState({
        loading: false,
        options: result.length > 0 
          ? result
          : [{ nama: "__NOT_FOUND__" }]
      });
    }, 800);
  };
  handleSelect = (value) => {
    const { options } = this.state;

    // Jika NOT FOUND → ganti jadi manual input
    if (value === "__NOT_FOUND__") {
      this.setState({ isEdit: true, dataSelectAda: false });
      this.formRef.current.setFieldsValue({
        jbt_perusahaan_pemenang: "",
        perusahaan_pemenang:"",
        npwp: "",
        alamat_perusahaan: "",
        nm_dir_perusahaan_pemenang: "",
        nik_dir: "",
        bank: "", cabang: "KC", norek: "", 
        atas_nama_bank: "", id_perusahaan_pemenang:""
      });
      
      return;
    }

    // Jika ditemukan data → AUTO FILL
    const selected = options.find(item => item.id === value);

    if (selected) {
      this.formRef.current.setFieldsValue({
        perusahaan_pemenang: selected.nama_perusahaan,
        npwp: selected.npwp,
        alamat_perusahaan: selected.alamat_perusahaan,
        nm_dir_perusahaan_pemenang: selected.nama_direktur,
        nik_dir: selected.nik_direktur,
        jbt_perusahaan_pemenang: selected.jabatan,
        norek: selected.nomor_rekening,
        atas_nama_bank: selected.nama_rekening,
        bank: selected.bank,
        cabang: selected.cabang,
        id_perusahaan_pemenang: selected.id
      });
    }

    this.setState({ isEdit: false, dataSelectAda: true });
  };

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
    const tglPersiapan = this.getPreviousBusinessDay(date,1);
    this.formRef.current.setFieldsValue({
      tgl_persiapan: tglPersiapan,
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
      angka_pelaksanaan: (selisih + 1)
    });
  }
  handleBAPPChange = (date) => {
    if (!date) return;
    this.formRef.current.setFieldsValue({
      tgl_sppbj: date,
      tgl_nodin_ppbj: date,
      tgl_pphp: date,
      tgl_bahp: date,
      tgl_bakh: date,
      tgl_baep: date
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
      //console.log(values);
      const allValues = this.formRef.current.getFieldsValue(true);
      //console.log("DATA FORM:", allValues);
      //console.log(allValues.tgl_baep.$D);
      generateDocument2025(allValues,false);
      //console.log(this.formRef);
    }catch{
      console.log("Ada field yang belum valid.");
    }
    
  };
  
  render (){
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const { currentStep, options, isEdit, loading, dataSelectAda } = this.state;
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
                  <DatePicker onChange={this.handleBAPPChange}
                  format="DD-MMMM-YYYY" style={{width:"60%"}}/>
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
              <Col span={12}>
                <Form.Item
                  label="Tanggal Persiapan"
                  name="tgl_persiapan"
                >
                  <DatePicker format="DD-MM-YYYY" style={{width:"60%"}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tanggal SPK"
                  name="tgl_spk"
                  rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
                >
                  <DatePicker onChange={this.handleSPKChange}
                  format="DD-MMMM-YYYY" style={{width:"60%"}}/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tanggal BAPB"
                  name="tgl_bapb"
                  rules={[{ required: true, message: 'Masukkan tanggal pekerjaan!' }]}
                >
                  <DatePicker onChange={this.handleBAPBChange}
                  format="DD-MMMM-YYYY" style={{width:"60%"}}/>
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
              <Col span={24}>
                <Select 
                  showSearch
                  style={{
                    width: "100%",
                  }}
                  placeholder="Ketik untuk mencari nama Perusahaan Pemenang"
                  filterOption={false}
                  notFoundContent={loading ? <Spin size="small" /> : "Tidak ada data"}
                  onSearch={this.searchPerusahaan}
                  onSelect={this.handleSelect}

                >
                  {options.map(item =>
                    item.nama === "__NOT_FOUND__" ? (
                      <Option key="manual" value="__NOT_FOUND__">
                        ➕ Tidak ditemukan, input manual
                      </Option>
                    ) : (
                      <Option key={item.id} value={item.id}>
                        {item.nama_perusahaan}
                      </Option>
                    )
                  )}
                </Select>
              </Col>
            </Row>
            <Divider plain/>
            <Row gutter={20}>
              <>
                <Col span={12}>
                  <Divider orientation="left" plain>
                    Perusahaan
                  </Divider>
                  <>
                  <Form.Item hidden
                    label="ID Perusahaan Pemenang"
                    name="id_perusahaan_pemenang"
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="Nama Perusahaan Pemenang"
                    name="perusahaan_pemenang"
                    rules={[{ required: true, message: 'Masukkan nama perusahaan!' }]}
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="NPWP Perusahaan"
                    name="npwp"
                    rules={[{ required: true, message: 'Masukkan NPWP perusahaan!' }]}
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="Alamat Perusahaan"
                    name="alamat_perusahaan"
                    rules={[{ required: true, message: 'Masukkan Alamat perusahaan!' }]}
                  >
                    <TextArea rows={4} disabled={!isEdit}/>
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
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="NIK Direktur"
                    name="nik_dir"
                    rules={[{ required: true, message: 'Masukkan NIK direktur!' }]}
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="Jabatan"
                    name="jbt_perusahaan_pemenang"
                    rules={[{ required: true, message: 'Masukkan jabatan penandatangan perusahaan!' }]}
                  >
                    <Input disabled={!isEdit}/>
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
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="Nama Rekening Perusahaan"
                    name="atas_nama_bank"
                    rules={[{ required: true, message: 'Masukkan nama rekening perusahaan!' }]}
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="Nama Bank"
                    name="bank"
                    rules={[{ required: true, message: 'Masukkan nama bank!' }]}
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  <Form.Item
                    label="Cabang Bank"
                    name="cabang"
                    rules={[{ required: true, message: 'Masukkan nama cabang bank perusahaan!' }]}
                  >
                    <Input disabled={!isEdit}/>
                  </Form.Item>
                  </>
                  <Button 
                    onClick={this.UbahDataPerusahaan}
                    color="primary" hidden={!dataSelectAda} variant="solid">
                    Ubah Data
                  </Button>
                  <Button 
                    onClick={this.simpanPerubahan}
                    color="primary" hidden={dataSelectAda} variant="solid">
                    Simpan Data
                  </Button>
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
                jbt_perusahaan_pemenang: "",
                perusahaan_pemenang:"",
                npwp: "",
                alamat_perusahaan: "",
                nm_dir_perusahaan_pemenang: "",
                nik_dir: "",
                bank: "", cabang: "KC", norek: "", 
                atas_nama_bank: ""
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
