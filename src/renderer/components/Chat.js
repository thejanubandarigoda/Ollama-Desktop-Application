import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Input,
    Button,
    Select,
    Space,
    Alert,
    Spin,
    message,
    Typography,
    Empty
} from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

function Chat({ ollamaStatus }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (ollamaStatus.online) {
            loadModels();
        }
    }, [ollamaStatus]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadModels = async () => {
        try {
            const result = await window.electronAPI.ollama.listModels();
            if (result.success && result.models.length > 0) {
                setModels(result.models);
                setSelectedModel(result.models[0].name);
            }
        } catch (error) {
            message.error('Failed to load models');
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !selectedModel) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const conversationMessages = [...messages, userMessage];
            const result = await window.electronAPI.ollama.chat(selectedModel, conversationMessages);

            if (result.success) {
                setMessages(prev => [...prev, result.message]);
            } else {
                message.error(result.error || 'Failed to get response');
            }
        } catch (error) {
            message.error('Error communicating with Ollama');
        } finally {
            setLoading(false);
        }
    };

    if (!ollamaStatus.online) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Alert
                    message="Ollama is not running"
                    description={
                        <div>
                            <p>Please start Ollama to use the chat feature.</p>
                            <p>Run: <code style={{ background: '#f0f0f0', padding: '2px 8px' }}>ollama serve</code></p>
                        </div>
                    }
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <Card
                title={
                    <Space>
                        <RobotOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>Chat with Ollama</Title>
                    </Space>
                }
                extra={
                    <Select
                        value={selectedModel}
                        onChange={setSelectedModel}
                        style={{ width: 200 }}
                        disabled={loading}
                    >
                        {models.map(model => (
                            <Option key={model.name} value={model.name}>
                                {model.name}
                            </Option>
                        ))}
                    </Select>
                }
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                bodyStyle={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: 16,
                    padding: '16px',
                    background: '#fafafa',
                    borderRadius: '8px'
                }}>
                    {messages.length === 0 ? (
                        <Empty
                            description="Start a conversation with your AI assistant"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: 16
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '70%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        color: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Space style={{ marginBottom: 4 }}>
                                        {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                        <Text strong style={{ color: '#fff' }}>
                                            {msg.role === 'user' ? 'You' : 'AI'}
                                        </Text>
                                    </Space>
                                    <Paragraph style={{ color: '#fff', margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {msg.content}
                                    </Paragraph>
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                            <Spin tip="AI is thinking..." />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        disabled={loading}
                        style={{ flex: 1 }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        loading={loading}
                        disabled={!input.trim()}
                    >
                        Send
                    </Button>
                </Space.Compact>
            </Card>
        </div>
    );
}

export default Chat;
