// app/login/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/api/api";
import Title from "antd/es/typography/Title";
import { Button, Form, Input, Spin } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    if (res.status === 200) {
      window.name = JSON.stringify({token: res.data.token});
      toast.success("Login successful");
      router.push("/dashboard");
    }
} catch (error) {
    toast.error("Invalid email or password");
}finally{
    setLoading(false);
}
  };

  return (
    <>
     <div style={{ maxWidth: 400, margin: "auto", padding: 24 }}>
    <Title level={2} style={{ textAlign: "center" }}>Login</Title>
    <Form layout="vertical" onSubmitCapture={handleLogin}>
      <Form.Item label="Email" required>
        <Input
          prefix={<MailOutlined />}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="large"
        />
      </Form.Item>

      <Form.Item label="Password" required>
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Login
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type="default" block size="large" onClick={() => router.push("/signUpLogin/signup")}>
          Don't have an account? Register
        </Button>
      </Form.Item>
    </Form>
  </div>

  {loading && (
          <div className="loaderstylingadjustmentclass">
        <Spin size="large" />
        </div>
        )}
    </>
   
  );
}
