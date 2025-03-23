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
import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
  Alert,
  Progress,
} from "antd";
import signinbg from "../assets/images/background/robot-maskot-bg.png";
import LogoLogin from "../assets/images/logo/logo_baru_tengah.png";
import {
  DribbbleOutlined,
  TwitterOutlined,
  InstagramOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import md5 from 'md5';
import { setSession } from "../utils/general-func";

function onChange(checked) {
  console.log(`switch to ${checked}`);
}
const { Title } = Typography;
const { Header, Footer, Content } = Layout;
export default class SignIn extends Component {
  constructor(props){
    super(props)
    this.state={
      togleAlert:false,
    }
  }
  render() {
    const onFinish = (values) => {
      const userid = values.username;
      const password = values.password;

      var IsLogin = false;
      const requestOptions = {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin':'*',
        // 'access-control-allow-headers':'Authorization, Content-Type' },
        body: JSON.stringify({ userid: userid, password: md5(password) })
      };
      fetch(process.env.REACT_APP_URL_API+'/rest/login.php', requestOptions)
          .then(response => response.json())
          .then(respon => {
            var dataAPI = respon;
            if(dataAPI.response_code != 200){
              this.setState({ login_message: dataAPI.message, togleAlert: true });
            }else{
              this.setState({ togleAlert: false });
              setSession(dataAPI.data);
              this.props.history.push('/dashboard');
            }});
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    const handleInputChange = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const key = target.name;
    
      this.setState({
        [target.name]: value
      });
    }
    return (
      <>
        <Layout className="layout-default layout-signin">
          <Content className="signin">
            <Row gutter={[24, 0]} justify="space-around">
              <Col
                xs={{ span: 24, offset: 0 }}
                lg={{ span: 6, offset: 2 }}
                md={{ span: 12 }}
              >
                
                <img
                  src={LogoLogin}
                  className="rounded"
                  style={{ cursor: 'pointer' }}
                  alt="logo"
                />
                {/* <Title className="mb-15">Sign In</Title> */}
                <br/><br/><br/>
                <p>
                  Enter your username and password to sign in
                </p>
                {this.state.togleAlert ? <><Alert message={this.state.login_message} type="error" /><br/></> : null}
                <Form
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  layout="vertical"
                  className="row-col"
                >
                  <Form.Item
                    className="username"
                    label="Username"
                    name="username"
                    onChange={handleInputChange}
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input placeholder="Username" />
                  </Form.Item>

                  <Form.Item
                    className="username"
                    label="Password"
                    name="password"
                    onChange={handleInputChange}
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password 
                      placeholder="Password" />
                  </Form.Item>

                  <Form.Item
                    name="remember"
                    className="aligin-center"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked onChange={onChange} />
                    Remember me
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                    >
                      SIGN IN
                    </Button>
                    
                  </Form.Item>
                  
                </Form>
              </Col>
              <Col
                className="sign-img"
                style={{ padding: 12 }}
                xs={{ span: 24 }}
                lg={{ span: 12 }}
                md={{ span: 12 }}
              >
                <img src={signinbg} alt="" />
              </Col>
            </Row>
          </Content>
          <Footer>
            <p className="copyright">
              {" "}
              Copyright © 2025 by<a href="#pablo">Sikarlia Tim</a>.{" "}
            </p>
          </Footer>
        </Layout>
      </>
    );
  }
}
