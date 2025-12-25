import React, { Component } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Avatar,
  message,
  Spin,
  Divider
} from "antd";
import { checkUsernameAvailable, getAvatars, updateUserProfile } from "../utils/general-api";
import { updateLocalSession } from "../utils/general-func";

class EditProfile extends Component {
  formRef = React.createRef();

  state = {
    loading: false,
    checkingUsername: false,
    avatarSelected: null,
    avatarList: Array.from({ length: 12 }, (_, i) => i + 1),
  };

  async componentDidMount() {
    // ambil data user (contoh dari localStorage / API)
    const dtSession = JSON.parse(localStorage.getItem("data_session"));
    
    if (dtSession) {

      this.formRef.current.setFieldsValue({
        name: dtSession.name,
        username: dtSession.userid,
        email: dtSession.email,
      });
    }
    this.getAvt();
  }
  togleLoading(){
    let curr = this.state.loading;
    this.setState({loading: !curr});
  }
  async getAvt(){
    this.togleLoading();
    const avatars = await getAvatars();
    this.setState({avatarList:avatars});
    this.togleLoading();
  }

  // =====================
  // CEK USERNAME
  // =====================
  cekUserID = async (username) => {
    if (!username) return true;

    try {
      const res = await checkUsernameAvailable(username);
      console.log(res);
      return !res.exists; // true = available
    } catch (err) {
      console.error("Check username error", err);
      return false;
    }
  };

  // =====================
  // SUBMIT FORM
  // =====================
  submitForm = async (values) => {
    const { avatarSelected } = this.state;
    const dtSession = JSON.parse(localStorage.getItem("data_session"));
    if (!avatarSelected) {
      this.setState({avatarSelected:dtSession.id_avatar})
    }

    this.togleLoading();

    const payload = {
      id: dtSession.id,
      userid: values.username,
      name: values.name,
      email: values.email,
      id_avatar: avatarSelected,
      password: values.new_password || ""
    };

    const result = await updateUserProfile(payload);

    if (!result.success) {
      message.error(result.message);
      return;
    }

    // update localStorage
    updateLocalSession(
      result.data,
      values.new_password // optional
    );

    message.success("Profil berhasil diperbarui");


    this.togleLoading();
  };

  render() {
    const { avatarList, avatarSelected, loading, checkingUsername } = this.state;

    return (
      <Spin spinning={loading}>
        <Row justify="center">
          <Col xs={24} lg={20}>
            <Card title="Edit Profile">
              <Form
                ref={this.formRef}
                layout="vertical"
                onFinish={this.submitForm}
              >
                <Row gutter={24}>
                  {/* ================= KIRI : FORM ================= */}
                  <Col xs={24} md={11}>
                    {/* NAMA */}
                    <Form.Item
                      label="Nama"
                      name="name"
                      rules={[{ required: true, message: "Nama wajib diisi" }]}
                    >
                      <Input />
                    </Form.Item>

                    {/* USERNAME */}
                    <Form.Item
                      label="Username"
                      name="username"
                      hasFeedback
                      validateTrigger="onBlur"
                      rules={[
                        { required: true, message: "Username wajib diisi" },
                        {
                          validator: async (_, value) => {
                            if (!value) return Promise.resolve();

                            const available = await this.cekUserID(value);

                            if (!available) {
                              return Promise.reject("Username sudah digunakan");
                            }

                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: "email", message: "Format email tidak valid" }
                      ]}
                    >
                      <Input />
                    </Form.Item>


                    {/* PASSWORD */}
                    <Form.Item label="Password Baru" name="new_password">
                      <Input.Password />
                    </Form.Item>

                    <Form.Item
                      label="Konfirmasi Password"
                      name="confirm_password"
                      dependencies={["new_password"]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("new_password") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject("Password tidak sama");
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>

                  {/* ================= DIVIDER ================= */}
                  <Col
                    xs={0}
                    md={2}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Divider type="vertical" style={{ height: "100%" }} />
                  </Col>

                  {/* ================= KANAN : AVATAR ================= */}
                  <Col xs={24} md={11}>
                    {/* PREVIEW AVATAR */}
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <Avatar
                        size={100}
                        src={
                          avatarList.find(a => a.id === avatarSelected)?.avatar 
                          || localStorage.getItem("avatar")
                        }
                      />
                      <div style={{ marginTop: 8, fontWeight: 500 }}>
                        Avatar Terpilih
                      </div>
                    </div>

                    {/* LABEL + REFRESH */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Pilih Avatar</span>
                      <Button
                        size="small"
                        onClick={()=>{this.getAvt()}}
                      >
                        Refresh
                      </Button>
                    </div>

                    {/* AVATAR LIST */}
                    <Row gutter={[12, 12]}>
                      {avatarList.map((item) => (
                        <Col key={item.id}>
                          <Avatar
                            size={64}
                            src={item.avatar}
                            style={{
                              cursor: "pointer",
                              border:
                                avatarSelected === item.id
                                  ? "5px solid #359dfeff"
                                  : "1px solid #ddd",
                            }}
                            onClick={() =>
                              this.setState({ avatarSelected: item.id })
                            }
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>

                {/* ================= SUBMIT ================= */}
                <Divider />

                <Button type="primary" htmlType="submit" block>
                  Simpan Perubahan
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

      </Spin>
    );
  }
}

export default EditProfile;
