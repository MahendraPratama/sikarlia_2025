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
  notification,
  Descriptions,
} from "antd";

import { PlusCircleFilled, UserDeleteOutlined, SearchOutlined, 
  EyeFilled, EditFilled, DeleteFilled, CloseOutlined,
  CloudDownloadOutlined, EditOutlined,
  ToolFilled,
  DownloadOutlined,
  FileAddOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Children, Component } from "react";
import React from 'react';
import dayjs from "dayjs";

import { deleteDataKontrak, getDataPerusahaan, getDetailKontrakBaru, modifyDataKontrak, modifyDataPerusahaan } from "../utils/general-api";
import { iconKontrak } from "../utils/general-ico";
import { commafy, convertTanggal, convertTipeKontrak, getPreviousBusinessDay, kontrakPreview, fileMaster, getDayDiff, renderLoading } from "../utils/general-func";
import { generateDocument, generateDocument2025, setupTanggal } from "../utils/generator-docx";
import angkaTerbilang from '@develoka/angka-terbilang-js';

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

  state = {
    currentStep: 0,
    loading: false,
    loadingDownload:false,
    stateLoading: false,
    options: [],
    dataSelectAda: false, //togle status Pilihan perusahaan ada atau tidak, dan button simpan perubahan is Hidden
    isEdit:false, //togle Form Edit
    allValues:[], //all values current form
  };
  togleLoading(){
    let curr = this.state.stateLoading;
    this.setState({stateLoading: !curr});
  }
  async componentDidMount(){
    const { id } = this.props.match.params;

    if(id){
      this.togleLoading();
      try {
        var data = await getDetailKontrakBaru(id);
        this.formRef.current.setFieldsValue({
          // =====================
          // DATA KONTRAK
          // =====================
          id:data.id,
          nama_pekerjaan: data.nama_pekerjaan,
          no_kontrak: data.nomor_kontrak,
          angka_pelaksanaan: Number(data.angka_pelaksanaan),

          harga_hps: data.nilai_hps,
          harga_penawaran: data.nilai_spk,
          harga_penawaran_pmb: data.nilai_pembanding,

          // =====================
          // PERUSAHAAN
          // =====================
          id_perusahaan_pemenang: data.id_perusahaan_pemenang,
          perusahaan_pemenang: data.nama_perusahaan,
          alamat_perusahaan: data.alamat_perusahaan,
          npwp: data.npwp,

          nm_dir_perusahaan_pemenang: data.nama_direktur,
          nik_dir: data.nik_direktur,
          jbt_perusahaan_pemenang: data.jabatan,

          bank: data.bank,
          cabang: data.cabang,
          atas_nama_bank: data.nama_rekening,
          norek: data.nomor_rekening,

          // =====================
          // TANGGAL (DatePicker)
          // =====================
          tgl_nodin_ppk: data.tanggal_nodin_ppk
            ? dayjs(data.tanggal_nodin_ppk)
            : null,

          tgl_hps: data.tanggal_hps
            ? dayjs(data.tanggal_hps)
            : null,

          tgl_und_ppbj: data.tanggal_undangan_ppbj
            ? dayjs(data.tanggal_undangan_ppbj)
            : null,

          tgl_dok_pnw: data.tanggal_dokumen_penawaran
            ? dayjs(data.tanggal_dokumen_penawaran)
            : null,

          tgl_bapp: data.tanggal_bapp
            ? dayjs(data.tanggal_bapp)
            : null,

          tgl_baep: data.tanggal_baep
            ? dayjs(data.tanggal_baep)
            : null,

          tgl_bakh: data.tanggal_bakh
            ? dayjs(data.tanggal_bakh)
            : null,

          tgl_bahp: data.tanggal_bahp
            ? dayjs(data.tanggal_bahp)
            : null,

          tgl_pphp: data.tanggal_pphp
            ? dayjs(data.tanggal_pphp)
            : null,

          tgl_nodin_ppbj: data.tanggal_nodin_ppbj
            ? dayjs(data.tanggal_nodin_ppbj)
            : null,

          tgl_sppbj: data.tanggal_sppbj
            ? dayjs(data.tanggal_sppbj)
            : null,

          tgl_persiapan: data.tanggal_persiapan
            ? dayjs(data.tanggal_persiapan)
            : null,

          tgl_spk: data.tanggal_spk
            ? dayjs(data.tanggal_spk)
            : null,

          tgl_bapb: data.tanggal_bapb
            ? dayjs(data.tanggal_bapb)
            : null,

          tgl_bast: data.tanggal_bast
            ? dayjs(data.tanggal_bast)
            : null,

          tgl_bap: data.tanggal_bap
            ? dayjs(data.tanggal_bap)
            : null
        });
      }catch (error) {
        console.error("Gagal ambil detail kontrak:", error);
      } finally {
        // ⬅️ INI PALING PENTING
        this.togleLoading();
        this.setState({dataSelectAda:true});
      }
    }
    
  }

  UbahDataPerusahaan = () => {
    this.setState({ isEdit: true, dataSelectAda: false});
  }
  
  simpanPerubahan = async () => {
    this.setState({ isEdit: false, dataSelectAda: true});
    try {
      const allValues = this.formRef.current.getFieldsValue(true);
      const userid = localStorage.getItem("user_session");
      const dataRet = await modifyDataPerusahaan(userid,allValues);
      
      this.formRef.current.setFieldsValue({
        id_perusahaan_pemenang:dataRet.id_perusahaan
      });
    }
    catch {

    }
    finally {
      notification.success({
        message: 'Berhasil',
        description: 'Perubahan data berhasil disimpan',
        placement: 'topRight',
        duration: 4,
      });
    }
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
        atas_nama_bank: "", id_perusahaan_pemenang:null
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

  

  handleSPKChange = (date) => {
    if (!date) return;

    // Ambil H-1 dan mundurkan sampai hari kerja
    const tglPersiapan = getPreviousBusinessDay(date,1);
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
    var allValues;
    try{
      this.togleLoading();
      await this.formRef.current.validateFields();
      allValues = this.formRef.current.getFieldsValue(true);
      await modifyDataKontrak(localStorage.getItem("user_session"), allValues);
      allValues.harga_penawaran_comma = commafy(allValues.harga_penawaran);
      allValues.tgl_spk_setup = setupTanggal(allValues.tgl_spk, "tgl_lengkap");
      allValues.tgl_bapb_setup = setupTanggal(allValues.tgl_bapb, "tgl_lengkap");
      allValues.year = (parseInt(allValues.tgl_spk.$M)+1)+"/"+allValues.tgl_spk.$y;
      //this.props.history.goBack();
    }catch{
      console.log("Ada field yang belum valid.");
    }finally{
      this.togleLoading();
      this.setState({ 
        currentStep: this.state.currentStep + 1,
        allValues:allValues,
       });
      console.log(allValues);
    }
    
  };

  async downloadKontrak(){
    this.setState({loadingDownload: true});
    setTimeout(() => {
      this.setState({loadingDownload: false});
    }, 2000);
    try{
      await generateDocument2025(this.state.allValues);
    }catch{

    }finally{
    }
  }
  
  render (){
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const { currentStep, options, isEdit, loading, dataSelectAda, stateLoading, allValues } = this.state;
    const { Title } = Typography;
    const { Search } = Input;
    
    const steps = [
      //Data Pekerjaan
      {
        title: 'Data Pekerjaan',
        content: (
          <Card
            variant={"borderless"}
            className="site-card-border-less-wrapper"
            title={"Input Data Pekerjaan"}
          >
              <Form.Item hidden
                label="ID Kontrak"
                name="id"
              >
                <InputNumber disabled={true} min={1}/>
              </Form.Item>
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
      //Jadwal Pekerjaan
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
                  <DatePicker format="DD-MMMM-YYYY" style={{width:"60%"}}/>
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
      //Perusahaan Pemenang
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
                  <Form.Item //hidden
                    label="ID Perusahaan Pemenang"
                    name="id_perusahaan_pemenang"
                    rules={[{ required: true, message: 'Simpan dulu data perusahaannya!' }]}
                  >
                    <InputNumber disabled={true} min={1}/>
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
      //Ringkasan Kontrak
      {
        title: 'Ringkasan Kontrak',
        content: (
          <Card
            variant={"borderless"}
            className="site-card-border-less-wrapper"
            title={"Ringkasan Kontrak"}
          >
              <Descriptions bordered>
                <Descriptions.Item label="Nomor Kontrak">{allValues.no_kontrak+"/SPK/BPSDM.4.PPK/KU.01.11/"+allValues.year}</Descriptions.Item>
                <Descriptions.Item label="Tanggal Kontak" span={2}>{allValues.tgl_spk_setup}</Descriptions.Item>
                <Descriptions.Item label="Nama Kontraktor/Perusahaan" span={3}>
                  {/* <Badge status="processing" text="Running" /> */}
                  {allValues.perusahaan_pemenang}
                </Descriptions.Item>
                <Descriptions.Item label="Alamat Perusahaan" span={3}>
                  {allValues.alamat_perusahaan}
                </Descriptions.Item>
                <Descriptions.Item label="Nilai SPK/Kontrak" span={3}>
                  {"Rp. " +allValues.harga_penawaran_comma + " (" 
                  + angkaTerbilang(allValues.harga_penawaran)
                  + " rupiah)"
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Uraian Pekerjaan" span={3}>
                  {allValues.nama_pekerjaan}
                </Descriptions.Item>
                <Descriptions.Item label="Jangka Waktu Pelaksanaan" span={3}>
                  {allValues.angka_pelaksanaan+" ("+angkaTerbilang(allValues.angka_pelaksanaan)+") "
                  + "hari kalender, " + allValues.tgl_spk_setup + " s/d " + allValues.tgl_bapb_setup
                  }
                </Descriptions.Item>
                <Descriptions.Item span={3}>
                  <Space>
                    <Button shape="round" 
                      loading={this.state.loadingDownload}
                      icon={<CloudDownloadOutlined/>}
                      onClick={()=>{this.downloadKontrak()}}
                      style={{backgroundColor:"#40c702", color:"white"}}
                      >
                      Download
                    </Button>
                    <Button type="primary" shape="round" 
                      icon={<FileAddOutlined />}
                      onClick={()=>{
                        this.props.history.push('/buat_kontrak');
                      }}
                      >
                      Input Lagi
                    </Button>
                    <Button shape="round"
                      onClick={()=>[
                        this.props.history.goBack()
                      ]}
                    >
                      <DatabaseOutlined />Data Kontrak
                    </Button>
                    
                  </Space>
                </Descriptions.Item>
              </Descriptions>
              

          </Card>)
          ,
      }
    ];
    const items = steps.map((item) => ({ key: item.title, title: item.title }));


    return (
      <>
        {renderLoading(stateLoading)}
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
                  <Button color="danger" onClick={()=>{this.props.history.goBack()}} variant="solid">Batal</Button> : 
                  <Button variant="solid" hidden={currentStep===3?true:false} 
                    onClick={this.prev}
                  >Sebelumnya</Button>
                }
                &nbsp;
                {currentStep===steps.length - 2?
                  <Button color="cyan" onClick={this.onFinish} variant="solid">Simpan</Button> :
                  <Button color="primary" hidden={currentStep===3?true:false} 
                    variant="solid" onClick={this.next}
                  >Selanjutnya</Button>
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
