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
  Form,
  Input,
  Divider,
} from "antd";

import { QRCode } from 'react-qrcode-logo';
import { PlusOutlined, ExclamationOutlined } from "@ant-design/icons";
import mastercard from "../assets/images/mastercard-logo.png";
import paypal from "../assets/images/paypal-logo-2.png";
import visa from "../assets/images/visa-logo.png";
import qr_logo from "../assets/images/logo/logo_lidig_2.png";
import React, { Component } from "react";
import { PDFDocument } from "pdf-lib";
const download = require('downloadjs');

class Billing extends Component {
  formRef = React.createRef();
  state = {
    link:"",
  }
  generateQR = (e) => {
    const val = e.target.value;
    this.setState({ link: val });
  }
  async downloadPDF(){
    //try{
        const allValues = await this.formRef.current.getFieldsValue(true);
        console.log(allValues);
        //var pathTemplate = window.location.origin + '/dod_character.pdf';
        const pathTemplate = window.location.origin + '/template_link.pdf';
        //console.log(pathTemplate);
        const formPdfBytes = await fetch(pathTemplate).then(res => res.arrayBuffer());
        // Load a PDF with form fields
        const pdfDoc = await PDFDocument.load(formPdfBytes)
        console.log(pdfDoc);
        // Get the form containing all the fields
        const form = pdfDoc.getForm();
    
        // Fill the form's fields

        form.getTextField('nama_kegiatan').setText(allValues.nama_kegiatan);
        form.getTextField('tema_kegiatan').setText(allValues.tema_kegiatan);
        form.getTextField('waktu_kegiatan').setText(allValues.waktu_kegiatan);
        form.getTextField('tempat_kegiatan').setText(allValues.tempat_kegiatan);
        form.getTextField('link').setText(allValues.link.replace("https://",""));

        const canvas = document.getElementById("qrCode");
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const qrBytes = await fetch(pngUrl).then(res => res.arrayBuffer())
        const qrImage = await pdfDoc.embedPng(qrBytes)

        const qrCodeForm = form.getButton('qr_code')
        qrCodeForm.setImage(qrImage)
        // Flatten the form's fields
        form.flatten();
    
        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();
    
        // Trigger the browser to download the PDF document
        download(pdfBytes, "your file.pdf", "application/pdf");
    // }catch(err){
    //     alert("Generate gagal, code : " + err);
    // }finally{
    //     //this.setState({downloading:false})
    // }
  }
  render() {
    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={16}>
            <Form
              ref={this.formRef} 
              name="control-ref" 
              layout={"vertical"} 
              
              initialValues={{
                link:"https://s.komdigi.go.id/"
              }}
            >
              <Button type="primary" onClick={this.downloadPDF}>Download</Button>
              <Divider />
              <Form.Item
                label="Nama Kegiatan"
                name="nama_kegiatan"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tema Kegiatan"
                name="tema_kegiatan"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Waktu Kegiatan"
                name="waktu_kegiatan"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tempat Kegiatan"
                name="tempat_kegiatan"
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Shortlink Kegiatan"
                name="link"
              >
                <Input onChange={this.generateQR}/>
              </Form.Item>
            </Form>
            <QRCode 
              size={450}
              logoWidth={100}
              ecLevel={"H"}
              //qrStyle={'dots'}
              id={'qrCode'}
              logoImage={qr_logo}
              removeQrCodeBehindLogo={true}
              quietZone={20}
              eyeRadius={[
                  [20, 20, 0, 20], // top/left eye
                  [20, 20, 20, 0], // top/right eye
                  [20, 0, 20, 20], // bottom/left
              ]}
              value={this.state.link} />
          </Col>
        </Row>
      </>
    );
  };
}

export default Billing;
