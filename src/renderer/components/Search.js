import React, { useState } from 'react';
import {
    Card,
    Input,
    Button,
    Radio,
    Space,
    Alert,
    List,
    Tag,
    message,
    Typography,
    Modal,
    Divider
} from 'antd';
import {
    SearchOutlined,
    ExperimentOutlined,
    WarningOutlined,
    RobotOutlined,
    LinkOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function Search({ torStatus }) {
    const [searchMode, setSearchMode] = useState('clear');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        // Show warning for dark web search
        if (searchMode === 'dark' && !showWarning) {
            setShowWarning(true);
            return;
        }

        setLoading(true);
        setResults([]);

        try {
            let result;
            if (searchMode === 'clear') {
                const settings = JSON.parse(localStorage.getItem('settings') || '{}');
                result = await window.electronAPI.search.web(query, settings.searchApiKey);
            } else {
                if (!torStatus.available) {
                    message.error('Tor is not available. Please start Tor Browser first.');
                    setLoading(false);
                    return;
                }
                result = await window.electronAPI.search.darkWeb(query);
            }

            if (result.success) {
                setResults(result.results);
                if (result.note) {
                    message.info(result.note);
                }
                if (result.warning) {
                    message.warning(result.warning);
                }
            } else {
                message.error(result.error || 'Search failed');
            }
        } catch (error) {
            message.error('Search error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const analyzeWithOllama = async (item) => {
        try {
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            const model = settings.defaultModel || 'llama2';

            const prompt = `Analyze this search result and provide a summary:\n\nTitle: ${item.title}\nURL: ${item.link}\nSnippet: ${item.snippet}`;

            message.loading('Analyzing with AI...', 0);

            const result = await window.electronAPI.ollama.generate(model, prompt);

            message.destroy();

            if (result.success) {
                Modal.info({
                    title: 'AI Analysis',
                    width: 600,
                    content: (
                        <div>
                            <Paragraph><Text strong>Source:</Text> {item.title}</Paragraph>
                            <Divider />
                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{result.response}</Paragraph>
                        </div>
                    ),
                });
            } else {
                message.error('Analysis failed: ' + result.error);
            }
        } catch (error) {
            message.destroy();
            message.error('Failed to analyze');
        }
    };

    const confirmDarkWebSearch = () => {
        setShowWarning(false);
        handleSearch();
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Card>
                <Title level={3}>
                    <SearchOutlined /> Web & Dark Web Search
                </Title>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Search Mode */}
                    <div>
                        <Text strong>Search Mode:</Text>
                        <Radio.Group
                            value={searchMode}
                            onChange={e => setSearchMode(e.target.value)}
                            style={{ marginLeft: 16 }}
                        >
                            <Radio.Button value="clear">Clear Web</Radio.Button>
                            <Radio.Button value="dark" disabled={!torStatus.available}>
                                <ExperimentOutlined /> Dark Web (Tor)
                            </Radio.Button>
                        </Radio.Group>
                    </div>

                    {/* Search Input */}
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            size="large"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onPressEnter={handleSearch}
                            placeholder={searchMode === 'clear' ? 'Search the web...' : 'Search the dark web...'}
                            prefix={<SearchOutlined />}
                        />
                        <Button
                            type="primary"
                            size="large"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            loading={loading}
                        >
                            Search
                        </Button>
                    </Space.Compact>

                    {/* Warnings */}
                    {searchMode === 'dark' && (
                        <Alert
                            message="Dark Web Search Warning"
                            description="You are about to search the dark web. This feature is for legitimate research purposes only. Ensure compliance with local laws. Accessing illegal content is prohibited."
                            type="warning"
                            showIcon
                            icon={<WarningOutlined />}
                        />
                    )}

                    {searchMode === 'dark' && !torStatus.available && (
                        <Alert
                            message="Tor Not Available"
                            description={
                                <div>
                                    <p>Tor connection is required for dark web search.</p>
                                    <p>Please start Tor Browser or Tor service.</p>
                                    <p>Default ports: 9150 (Tor Browser) or 9050 (Tor Service)</p>
                                </div>
                            }
                            type="error"
                            showIcon
                        />
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div>
                            <Title level={4}>Search Results ({results.length})</Title>
                            <List
                                itemLayout="vertical"
                                dataSource={results}
                                renderItem={item => (
                                    <List.Item
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            marginBottom: '12px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                        actions={[
                                            <Button
                                                type="link"
                                                icon={<LinkOutlined />}
                                                onClick={() => window.open(item.link, '_blank')}
                                            >
                                                Visit
                                            </Button>,
                                            <Button
                                                type="primary"
                                                ghost
                                                icon={<RobotOutlined />}
                                                onClick={() => analyzeWithOllama(item)}
                                            >
                                                Analyze with AI
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <Space>
                                                    <Text strong style={{ fontSize: '16px' }}>{item.title}</Text>
                                                    <Tag color={searchMode === 'dark' ? 'red' : 'blue'}>
                                                        {item.source}
                                                    </Tag>
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {item.link}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                        <Paragraph>{item.snippet}</Paragraph>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </Space>
            </Card>

            {/* Dark Web Warning Modal */}
            <Modal
                title={<span><WarningOutlined style={{ color: '#ff4d4f' }} /> Dark Web Search Warning</span>}
                open={showWarning}
                onOk={confirmDarkWebSearch}
                onCancel={() => setShowWarning(false)}
                okText="I Understand, Proceed"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
            >
                <Space direction="vertical">
                    <Alert
                        message="Legal Disclaimer"
                        description="By proceeding, you acknowledge that:"
                        type="error"
                        showIcon
                    />
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>You will only access legal content</li>
                        <li>You are responsible for compliance with local laws</li>
                        <li>This tool is for legitimate research purposes</li>
                        <li>Accessing illegal content is strictly prohibited</li>
                        <li>Your activity may be logged for security</li>
                    </ul>
                </Space>
            </Modal>
        </div>
    );
}

export default Search;
