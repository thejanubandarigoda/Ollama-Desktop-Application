import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Button,
    Switch,
    Space,
    Divider,
    message,
    Typography,
    Alert
} from 'antd';
import { SaveOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function Settings({ onSettingsSaved }) {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        const saved = localStorage.getItem('settings');
        if (saved) {
            const settings = JSON.parse(saved);
            form.setFieldsValue(settings);
        } else {
            // Set defaults
            form.setFieldsValue({
                ollamaUrl: 'http://localhost:11434',
                defaultModel: 'llama2',
                serverPort: 3000,
                ngrokAuthToken: '',
                searchApiKey: '',
                torPort: 9150,
                torEnabled: false
            });
        }
    };

    const handleSave = async (values) => {
        setSaving(true);
        try {
            localStorage.setItem('settings', JSON.stringify(values));
            await window.electronAPI.settings.save(values);
            message.success('Settings saved successfully');

            if (onSettingsSaved) {
                onSettingsSaved();
            }
        } catch (error) {
            message.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Card>
                <Title level={3}>
                    <ApiOutlined /> Application Settings
                </Title>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    {/* Ollama Settings */}
                    <Divider orientation="left">Ollama Configuration</Divider>

                    <Form.Item
                        label="Ollama Server URL"
                        name="ollamaUrl"
                        rules={[{ required: true, message: 'Please enter Ollama URL' }]}
                    >
                        <Input placeholder="http://localhost:11434" />
                    </Form.Item>

                    <Form.Item
                        label="Default Model"
                        name="defaultModel"
                        tooltip="Model to use by default (e.g., llama2, mistral, codellama)"
                    >
                        <Input placeholder="llama2" />
                    </Form.Item>

                    {/* Server Settings */}
                    <Divider orientation="left">Public Server Configuration</Divider>

                    <Form.Item
                        label="Server Port"
                        name="serverPort"
                        rules={[{ required: true, message: 'Please enter port' }]}
                    >
                        <InputNumber min={1000} max={65535} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="ngrok Auth Token"
                        name="ngrokAuthToken"
                        tooltip="Get your auth token from ngrok.com/signup (free tier available)"
                    >
                        <Input.Password placeholder="Your ngrok auth token" />
                    </Form.Item>

                    <Alert
                        message="Get ngrok Auth Token"
                        description={
                            <div>
                                <p>1. Create a free account at <a href="https://ngrok.com/signup" target="_blank" rel="noopener noreferrer">ngrok.com</a></p>
                                <p>2. Copy your auth token from the dashboard</p>
                                <p>3. Paste it above to enable public access</p>
                            </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {/* Search Settings */}
                    <Divider orientation="left">Search Configuration</Divider>

                    <Form.Item
                        label="Search API Key"
                        name="searchApiKey"
                        tooltip="Format: For SerpAPI: 'your_key', For Google CSE: 'api_key:search_engine_id'"
                    >
                        <Input.Password placeholder="Optional: SerpAPI or Google CSE API key" />
                    </Form.Item>

                    <Alert
                        message="Search API (Optional)"
                        description="Without an API key, the app will use DuckDuckGo scraping. For better results, get an API key from SerpAPI or Google Custom Search."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {/* Tor Settings */}
                    <Divider orientation="left">Tor Configuration</Divider>

                    <Form.Item
                        label="Enable Tor"
                        name="torEnabled"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="Tor SOCKS Port"
                        name="torPort"
                        tooltip="9150 for Tor Browser, 9050 for Tor service"
                    >
                        <InputNumber min={1000} max={65535} style={{ width: '100%' }} />
                    </Form.Item>

                    <Alert
                        message="Tor Setup Instructions"
                        description={
                            <div>
                                <p><strong>Option 1 (Easiest):</strong> Download and run Tor Browser</p>
                                <p><strong>Option 2:</strong> Install Tor service on your system</p>
                                <p>Default ports: 9150 (Tor Browser) or 9050 (Tor service)</p>
                            </div>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {/* Save Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={saving}
                            size="large"
                            block
                        >
                            Save Settings
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default Settings;
