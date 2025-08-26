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

class BuatKontrak extends Component {
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
      currentStep:0,
    }
  }
  componentDidMount(){
    
  }

  navStep(val){
    const { currentStep } = this.state;
    const newCurrStep = currentStep + val;
    this.setState({
      currentStep: newCurrStep
    })
  }
    
  render (){
    const onChange = (e) => console.log(`radio checked:${e.target.value}`);
    const { currentStep, toggleDrawer, descPreviewKontrak } = this.state;
    const { Title } = Typography;
    const { Search } = Input;
    
    const steps = [
      {
        title: 'Nama Pekerjaan',
        content: 
          <Card
            
            variant={"borderless"}
            className="criclebox tablespace mb-24"
            title={"Input Data Pekerjaan"}
          >
            
            
          </Card>,
      },
      {
        title: 'Jadwal Pekerjaan',
        content: 'Second-content',
      },
      {
        title: 'Perusahaan Pemenang',
        content: 'Last-content',
      },
      {
        title: 'BAEKN',
        content: 'Last-content',
      },
    ];
    const items = steps.map((item) => ({ key: item.title, title: item.title }));


    return (
      <>
        <Row gutter={[24,0]}>
          <Steps current={currentStep} labelPlacement="vertical" items={items} style={{paddingLeft:"10%", paddingRight:"10%"}}/>
        </Row>
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card>       
              {steps[currentStep].content}
              <Row justify="space-between" align="middle">
              <Col/>
              <Col>
                {currentStep===0?
                  <Button color="danger" variant="solid">Batal</Button> : 
                  <Button variant="solid" onClick={()=>{this.navStep(-1)}}>Sebelumnya</Button>
                }
                &nbsp;
                {currentStep===3?
                  <Button color="cyan" variant="solid">Simpan</Button> :
                  <Button color="primary" variant="solid" onClick={()=>{this.navStep(1)}}>Selanjutnya</Button>
                }
              </Col>
              </Row>
              
            </Card>
          </Col>
        </Row>
        
      </>
    );

  }

  
}

export default BuatKontrak;
