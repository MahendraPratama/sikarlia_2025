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
} from "antd";
import signinbg from "../assets/images/background/robot-icon.png";
import LogoLogin from "../assets/images/logo/logo_baru_tengah.png";
import {
  DribbbleOutlined,
  TwitterOutlined,
  InstagramOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import md5 from 'md5';
function onChange(checked) {
  console.log(`switch to ${checked}`);
}
const { Title } = Typography;
const { Header, Footer, Content } = Layout;
export default class SignIn extends Component {
  render() {
    const onFinish = (values) => {
      console.log("Success:", values);

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
              this.setState({ message: dataAPI.message });
            }else{
              localStorage.setItem("user_session", dataAPI.data.userid);
              localStorage.setItem("user_name", dataAPI.data.name);
              localStorage.setItem("user_type", dataAPI.data.user_type);
              localStorage.setItem("id", dataAPI.data.id);
              localStorage.setItem("password", dataAPI.data.password);
              localStorage.setItem("email", dataAPI.data.email);
              var newDate = new Date();
              localStorage.setItem("yearFilter", newDate.getFullYear());

              var now = newDate.getTime();
              
              localStorage.setItem('setupTime', now);
              //window.location.href = "/dashboard";
              //return <Redirect to="/dashboard" />
            }})
            .then(()=>{
              this.props.history.push('/dashboard');
            });
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
                <p >
                  Enter your username and password to sign in
                </p>
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
                    <Input 
                      type= "password" 
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
              Copyright © 2025 by <a href="#pablo">Sikarlia Tim</a>.{" "}
            </p>
          </Footer>
        </Layout>
      </>
    );
  }
}
