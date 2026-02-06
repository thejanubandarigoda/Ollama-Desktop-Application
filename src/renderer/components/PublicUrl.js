import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Space,
    Alert,
    Typography,
    Divider,
    message,
    Input,
    Tag
} from 'antd';
import {
    GlobalOutlined,
    LinkOutlined,
    CopyOutlined,
    DisconnectOutlined,
    LockOutlined
} from '@ant-design/icons';
import QRCode from 'qrcode.react';

const { Title, Text, Paragraph } = Typography;

function PublicUrl({ ngrokStatus, onStatusChange }) {
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');

            if (!settings.ngrokAuthToken) {
                message.error('Please set your ngrok auth token in Settings first');
                setConnecting(false);
                return;
            }

            const result = await window.electronAPI.ngrok.connect(
                settings.ngrokAuthToken,
                settings.serverPort || 3000
            );

            if (result.success) {
                message.success('Public tunnel created successfully!');
                if (onStatusChange) {
                    onStatusChange();
                }
            } else {
                message.error(result.error || 'Failed to create tunnel');
                if (result.hint) {
                    message.info(result.hint);
                }
            }
        } catch (error) {
            message.error('Error creating tunnel: ' + error.message);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            const result = await window.electronAPI.ngrok.disconnect();

            if (result.success) {
                message.success('Tunnel closed');
                if (onStatusChange) {
                    onStatusChange();
                }
            }
        } catch (error) {
            message.error('Error disconnecting: ' + error.message);
        } finally {
            setDisconnecting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Copied to clipboard!');
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Card>
                <Title level={3}>
                    <GlobalOutlined /> Public Web Access
                </Title>

                <Paragraph>
                    Create a public URL to allow remote access to your Ollama instance.
                    The public API is read-only and protected with authentication.
                </Paragraph>

                {!ngrokStatus.connected ? (
                    <div>
                        <Alert
                            message="No Active Tunnel"
                            description="Click the button below to create a public tunnel using ngrok. Make sure you have configured your ngrok auth token in Settings."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Button
                            type="primary"
                            size="large"
                            icon={<GlobalOutlined />}
                            onClick={handleConnect}
                            loading={connecting}
                            block
                        >
                            Create Public Tunnel
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Alert
                            message="Tunnel Active"
                            description="Your Ollama instance is now publicly accessible!"
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Divider>Public URL</Divider>

                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Text strong>Public API URL:</Text>
                                <Input
                                    value={`${ngrokStatus.url}/api`}
                                    readOnly
                                    addonAfter={
                                        <Button
                                            type="text"
                                            icon={<CopyOutlined />}
                                            onClick={() => copyToClipboard(`${ngrokStatus.url}/api`)}
                                        />
                                    }
                                    size="large"
                                />
                            </div>

                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <Text type="secondary">Scan QR Code for Mobile Access</Text>
                                <div style={{ marginTop: 16, display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '8px' }}>
                                    <QRCode value={`${ngrokStatus.url}/api`} size={200} />
                                </div>
                            </div>

                            <Divider>Authentication Credentials</Divider>

                            <Alert
                                message={
                                    <div>
                                        <Space direction="vertical">
                                            <div>
                                                <LockOutlined /> <Text strong>Username:</Text> <Tag color="blue">ollama</Tag>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<CopyOutlined />}
                                                    onClick={() => copyToClipboard('ollama')}
                                                />
                                            </div>
                                            <div>
                                                <LockOutlined /> <Text strong>Password:</Text> <Tag color="blue">secure-pass-2024</Tag>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<CopyOutlined />}
                                                    onClick={() => copyToClipboard('secure-pass-2024')}
                                                />
                                            </div>
                                        </Space>
                                    </div>
                                }
                                type="warning"
                                showIcon
                            />

                            <Divider>API Endpoints</Divider>

                            <Card type="inner" size="small">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div>
                                        <Tag color="green">GET</Tag>
                                        <Text code>/api/models</Text> - List available models
                                    </div>
                                    <div>
                                        <Tag color="blue">POST</Tag>
                                        <Text code>/api/chat</Text> - Chat with model
                                    </div>
                                    <div>
                                        <Tag color="blue">POST</Tag>
                                        <Text code>/api/generate</Text> - Generate text
                                    </div>
                                    <div>
                                        <Tag color="cyan">GET</Tag>
                                        <Text code>/api/health</Text> - Health check (no auth)
                                    </div>
                                </Space>
                            </Card>

                            <Button
                                danger
                                size="large"
                                icon={<DisconnectOutlined />}
                                onClick={handleDisconnect}
                                loading={disconnecting}
                                block
                            >
                                Close Tunnel
                            </Button>
                        </Space>
                    </div>
                )}

                <Divider />

                <Alert
                    message="Security Notice"
                    description={
                        <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                            <li>The public API is read-only (no model management)</li>
                            <li>Rate limited to 100 requests per 15 minutes</li>
                            <li>Basic authentication required for all endpoints</li>
                            <li>Consider changing default credentials for production use</li>
                        </ul>
                    }
                    type="warning"
                    showIcon
                />
            </Card>
        </div>
    );
}

export default PublicUrl;
