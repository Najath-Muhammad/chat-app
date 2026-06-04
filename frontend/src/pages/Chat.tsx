import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket/socket';

interface Message {
    _id: string;
    text: string;
    senderId: string;
    conversationId: string;
    seen: boolean;
}

interface User {
    _id: string;
    username: string;
    email: string;
}

interface Conversation {
    _id: string;
    members: User[];
}

const Chat: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUsersAndCounts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/users`);
                setUsers(res.data.filter((u: User) => u._id !== currentUser._id));
                
                const countsRes = await axios.get(`${import.meta.env.VITE_API_URL}/messages/unread`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const countsMap: Record<string, number> = {};
                countsRes.data.forEach((item: any) => {
                    countsMap[item._id] = item.count;
                });
                setUnreadCounts(countsMap);
                
            } catch (error) {
                console.error("Failed to fetch users or counts");
            }
        };

        fetchUsersAndCounts();
    }, [navigate, token, currentUser._id]);

    useEffect(() => {
        // Ensure socket is connected and user is registered, even after page refresh
        socket.emit('add-user', currentUser._id);

        socket.on('receive-message', (message: Message) => {
            if (activeConversation && message.conversationId === activeConversation._id) {
                setMessages(prev => [...prev, message]);
                socket.emit('seen-message', { messageId: message._id });
            } else {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.senderId]: (prev[message.senderId] || 0) + 1
                }));
            }
        });

        socket.on('message-seen', ({ messageId }: { messageId: string }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, seen: true } : m));
        });

        socket.on('show-typing', () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
        });

        return () => {
            socket.off('receive-message');
            socket.off('message-seen');
            socket.off('show-typing');
        };
    }, [activeConversation, currentUser._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const selectUser = async (user: User) => {
        setActiveUser(user);
        setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));
        
        try {
            // Create or get conversation
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/conversations`, 
                { receiverId: user._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActiveConversation(res.data);
            
            // Fetch messages for this conversation
            const msgRes = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${res.data._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(msgRes.data);
            
            // Mark last messages as seen ideally, but for demo frontend:
            msgRes.data.forEach((m: Message) => {
                if (m.senderId !== currentUser._id && !m.seen) {
                    socket.emit('seen-message', { messageId: m._id });
                }
            });
            
        } catch (error) {
            console.error("Error setting up chat", error);
        }
    };

    const handleSendMessage = () => {
        if (!text.trim() || !activeConversation || !activeUser) return;
        
        socket.emit('send-message', {
            senderId: currentUser._id,
            receiverId: activeUser._id,
            conversationId: activeConversation._id,
            text
        });
        
        // Optimistically add to UI (though server also broadcasts, but typically you add self message directly)
        // For this architecture, let's wait for receive or add it manually.
        // Wait, the backend only emits to receiver! We must add it manually to our UI:
        const newMessage = {
            _id: Date.now().toString(), // temporary ID until fetch
            text,
            senderId: currentUser._id,
            conversationId: activeConversation._id,
            seen: false
        };
        setMessages(prev => [...prev, newMessage]);
        
        setText('');
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (activeUser) {
            socket.emit('typing', { receiverId: activeUser._id });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2>Chats</h2>
                </div>
                <div className="user-list">
                    {users.map(user => (
                        <div 
                            key={user._id} 
                            className={`user-item ${activeUser?._id === user._id ? 'active' : ''}`}
                            onClick={() => selectUser(user)}
                        >
                            <div className="avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{user.username}</div>
                            </div>
                            {unreadCounts[user._id] > 0 && (
                                <div style={{ 
                                    marginLeft: 'auto', 
                                    background: '#ef4444', 
                                    color: 'white', 
                                    borderRadius: '50%', 
                                    padding: '2px 8px', 
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {unreadCounts[user._id]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>
            </div>

            {activeUser ? (
                <div className="chat-main">
                    <div className="chat-header">
                        <div className="avatar" style={{ width: 36, height: 36 }}>
                            {activeUser.username.charAt(0).toUpperCase()}
                        </div>
                        <h3>{activeUser.username}</h3>
                    </div>
                    
                    <div className="messages-area">
                        {messages.map(msg => {
                            const isSent = msg.senderId === currentUser._id;
                            return (
                                <div key={msg._id} className={`message ${isSent ? 'sent' : 'received'}`}>
                                    {msg.text}
                                    {isSent && <div className="message-status">{msg.seen ? 'Seen' : 'Delivered'}</div>}
                                </div>
                            );
                        })}
                        {isTyping && <div className="typing-indicator">{activeUser.username} is typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input 
                            type="text" 
                            value={text} 
                            onChange={handleTyping} 
                            placeholder="Type your message..." 
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="no-chat-selected">
                    <h2>Welcome, {currentUser.username}!</h2>
                    <p>Select a user from the sidebar to start chatting.</p>
                </div>
            )}
        </div>
    );
};

export default Chat;
