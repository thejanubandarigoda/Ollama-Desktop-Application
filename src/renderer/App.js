import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Badge, Switch, Space, Typography } from 'antd';
import {
    MessageOutlined,
    SearchOutlined,
    SettingOutlined,
    GlobalOutlined,
    ApiOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import Chat from './components/Chat';
import Search from './components/Search';
import Settings from './components/Settings';
import PublicUrl from './components/PublicUrl';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function App() {
    const [currentView, setCurrentView] = useState('chat');
    const [darkMode, setDarkMode] = useState(true);
    const [ollamaStatus, setOllamaStatus] = useState({ online: false });
    const [torStatus, setTorStatus] = useState({ available: false });
    const [ngrokStatus, setNgrokStatus] = useState({ connected: false });

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    // Check service statuses on mount
    useEffect(() => {
        checkServices();
        const interval = setInterval(checkServices, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const checkServices = async () => {
        // Check Ollama
        try {
            const ollama = await window.electronAPI.ollama.checkStatus();
            setOllamaStatus(ollama);
        } catch (error) {
            console.error('Failed to check Ollama:', error);
        }

        // Check Tor
        try {
            const tor = await window.electronAPI.tor.checkStatus();
            setTorStatus(tor);
        } catch (error) {
            console.error('Failed to check Tor:', error);
        }

        // Check ngrok
        try {
            const ngrok = await window.electronAPI.ngrok.getStatus();
            setNgrokStatus(ngrok);
        } catch (error) {
            console.error('Failed to check ngrok:', error);
        }
    };

    const menuItems = [
        {
            key: 'chat',
            icon: <MessageOutlined />,
            label: 'Chat',
        },
        {
            key: 'search',
            icon: <SearchOutlined />,
            label: 'Search',
        },
        {
            key: 'public',
            icon: <GlobalOutlined />,
            label: 'Public URL',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'chat':
                return <Chat ollamaStatus={ollamaStatus} />;
            case 'search':
                return <Search torStatus={torStatus} />;
            case 'public':
                return <PublicUrl ngrokStatus={ngrokStatus} onStatusChange={checkServices} />;
            case 'settings':
                return <Settings onSettingsSaved={checkServices} />;
            default:
                return <Chat ollamaStatus={ollamaStatus} />;
        }
    };

    const appStyle = {
        height: '100vh',
        backgroundColor: darkMode ? '#141414' : '#f0f2f5',
    };

    const siderStyle = {
        background: darkMode ? '#1f1f1f' : colorBgContainer,
    };

    const headerStyle = {
        background: darkMode ? '#1f1f1f' : colorBgContainer,
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
    };

    return (
        <Layout style={appStyle}>
            <Sider width={200} style={siderStyle}>
                <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`
                }}>
                    <ApiOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    <div style={{
                        marginTop: '8px',
                        fontWeight: 'bold',
                        color: darkMode ? '#fff' : '#000'
                    }}>
                        Ollama Desktop
                    </div>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[currentView]}
                    onClick={({ key }) => setCurrentView(key)}
                    style={{
                        height: 'calc(100% - 80px)',
                        borderRight: 0,
                        background: darkMode ? '#1f1f1f' : colorBgContainer
                    }}
                    theme={darkMode ? 'dark' : 'light'}
                    items={menuItems}
                />
            </Sider>

            <Layout>
                <Header style={headerStyle}>
                    <Space size="large">
                        <Space size="small">
                            <Text style={{ color: darkMode ? '#fff' : '#000' }}>Ollama:</Text>
                            {ollamaStatus.online ? (
                                <Badge status="success" text={<Text type="success">Online</Text>} />
                            ) : (
                                <Badge status="error" text={<Text type="danger">Offline</Text>} />
                            )}
                        </Space>

                        <Space size="small">
                            <Text style={{ color: darkMode ? '#fff' : '#000' }}>Tor:</Text>
                            {torStatus.available ? (
                                <Badge status="success" text={<Text type="success">Connected</Text>} />
                            ) : (
                                <Badge status="default" text={<Text type="secondary">Disconnected</Text>} />
                            )}
                        </Space>

                        <Space size="small">
                            <Text style={{ color: darkMode ? '#fff' : '#000' }}>Public:</Text>
                            {ngrokStatus.connected ? (
                                <Badge status="processing" text={<Text style={{ color: '#1890ff' }}>Active</Text>} />
                            ) : (
                                <Badge status="default" text={<Text type="secondary">Inactive</Text>} />
                            )}
                        </Space>
                    </Space>

                    <Space>
                        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Dark Mode</Text>
                        <Switch
                            checked={darkMode}
                            onChange={setDarkMode}
                            checkedChildren="🌙"
                            unCheckedChildren="☀️"
                        />
                    </Space>
                </Header>

                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                        background: darkMode ? '#141414' : colorBgContainer,
                        overflow: 'auto',
                    }}
                >
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}

export default App;
