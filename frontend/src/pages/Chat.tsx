import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from '../socket/socket';
import AvatarEditor from 'react-avatar-editor';
import Webcam from 'react-webcam';

interface Message {
    _id: string;
    text: string;
    senderId: string;
    conversationId: string;
    seen: boolean;
    image?: string;
}

interface User {
    _id: string;
    username: string;
    email: string;
    profilePic?: string;
    bio?: string;
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
    
    // Profile Edit State
    const [currentUserObj, setCurrentUserObj] = useState<User>(JSON.parse(localStorage.getItem('user') || '{}'));
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editPic, setEditPic] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [scale, setScale] = useState(1.2);
    const editorRef = useRef<any>(null);
    
    // Message Attachment State
    const [attachment, setAttachment] = useState<string>('');
    const [isEphemeral, setIsEphemeral] = useState(false);
    
    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const webcamRef = useRef<Webcam>(null);

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
                setUsers(res.data.filter((u: User) => u._id !== currentUserObj._id));
                
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
    }, [navigate, token, currentUserObj._id]);

    useEffect(() => {
        // Ensure socket is connected and user is registered, even after page refresh
        socket.emit('add-user', currentUserObj._id);

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
    }, [activeConversation, currentUserObj._id]);

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
                if (m.senderId !== currentUserObj._id && !m.seen) {
                    socket.emit('seen-message', { messageId: m._id });
                }
            });
            
        } catch (error) {
            console.error("Error setting up chat", error);
        }
    };

    const handleSendMessage = () => {
        if ((!text.trim() && !attachment) || !activeConversation || !activeUser) return;
        
        socket.emit('send-message', {
            senderId: currentUserObj._id,
            receiverId: activeUser._id,
            conversationId: activeConversation._id,
            text,
            image: attachment,
            isEphemeral
        });
        
        const newMessage = {
            _id: Date.now().toString(), // temporary ID until fetch
            text,
            image: attachment,
            senderId: currentUserObj._id,
            conversationId: activeConversation._id,
            seen: false
        };
        setMessages(prev => [...prev, newMessage as Message]);
        
        setText('');
        setAttachment('');
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAttachment(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const capturePhoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setAttachment(imageSrc);
            setShowCamera(false);
        }
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            let finalProfilePic = editPic;
            
            if (selectedFile && editorRef.current) {
                const canvas = editorRef.current.getImageScaledToCanvas();
                finalProfilePic = canvas.toDataURL();
            }

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                bio: editBio,
                profilePic: finalProfilePic
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.setItem('user', JSON.stringify(res.data));
            setCurrentUserObj(res.data);
            setShowProfileModal(false);
            setSelectedFile(null);
            setScale(1.2);
        } catch (error) {
            console.error('Failed to update profile');
        }
    };

    const openProfileModal = () => {
        setEditBio(currentUserObj.bio || '');
        setEditPic(currentUserObj.profilePic || '');
        setSelectedFile(null);
        setScale(1.2);
        setShowProfileModal(true);
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
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="avatar" className="avatar" />
                            ) : (
                                <div className="avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div style={{ fontWeight: 600 }}>{user.username}</div>
                                {user.bio && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.bio}</div>}
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
                <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                    <button onClick={openProfileModal} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', flex: 1 }}>
                        Profile
                    </button>
                    <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', flex: 1 }}>
                        Logout
                    </button>
                </div>
            </div>

            {activeUser ? (
                <div className="chat-main">
                    <div className="chat-header">
                        {activeUser.profilePic ? (
                            <img src={activeUser.profilePic} alt="avatar" className="avatar" style={{ width: 36, height: 36 }} />
                        ) : (
                            <div className="avatar" style={{ width: 36, height: 36 }}>
                                {activeUser.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3>{activeUser.username}</h3>
                            {activeUser.bio && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeUser.bio}</div>}
                        </div>
                    </div>
                    
                    <div className="messages-area">
                        {messages.map(msg => {
                            const isSent = msg.senderId === currentUserObj._id;
                            return (
                                <div key={msg._id} className={`message ${isSent ? 'sent' : 'received'}`}>
                                    {msg.image && (
                                        <img src={msg.image} style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: msg.text ? '8px' : '0' }} alt="attachment" />
                                    )}
                                    {msg.text}
                                    {isSent && <div className="message-status">{msg.seen ? 'Seen' : 'Delivered'}</div>}
                                </div>
                            );
                        })}
                        {isTyping && <div className="typing-indicator">{activeUser.username} is typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {attachment && (
                            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={attachment} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} alt="attachment preview" />
                                <span style={{ fontSize: '13px', color: 'var(--text-main)', flex: 1 }}>Image attached</span>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <input type="checkbox" checked={isEphemeral} onChange={(e) => setIsEphemeral(e.target.checked)} />
                                    ⏱️ 1hr Delete
                                </label>
                                <button onClick={() => setAttachment('')} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '16px' }}>✕</button>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '4px 12px', gap: '8px', border: '1px solid var(--border)', width: '100%' }}>
                            <input 
                                type="text" 
                                value={text} 
                                onChange={handleTyping} 
                                placeholder="Type a message..." 
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '12px 8px', outline: 'none', fontSize: '15px' }}
                            />
                            
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '8px', margin: 0, transition: 'color 0.2s' }} title="Attach Image" className="icon-btn">
                                <input type="file" accept="image/*" onChange={handleAttachmentChange} style={{ display: 'none' }} />
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                            </label>
                            
                            <button onClick={() => setShowCamera(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', margin: 0, transition: 'color 0.2s' }} title="Camera" className="icon-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                    <circle cx="12" cy="13" r="4"></circle>
                                </svg>
                            </button>
                            
                            <button onClick={handleSendMessage} style={{ background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px', transition: 'all 0.2s' }} className="send-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-chat-selected">
                    {currentUserObj.profilePic ? (
                        <img src={currentUserObj.profilePic} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div className="avatar" style={{ width: 80, height: 80, fontSize: 32 }}>
                            {currentUserObj.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h2>Welcome, {currentUserObj.username}!</h2>
                    <p>{currentUserObj.bio || "Select a user from the sidebar to start chatting."}</p>
                </div>
            )}

            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Profile</h3>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            {selectedFile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <AvatarEditor
                                        ref={editorRef}
                                        image={selectedFile}
                                        width={120}
                                        height={120}
                                        border={20}
                                        borderRadius={60}
                                        color={[0, 0, 0, 0.6]}
                                        scale={scale}
                                        rotate={0}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zoom:</span>
                                        <input 
                                            type="range" 
                                            value={scale} 
                                            min="1" 
                                            max="3" 
                                            step="0.01" 
                                            onChange={(e) => setScale(parseFloat(e.target.value))} 
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                editPic ? (
                                    <img src={editPic} alt="Preview" className="profile-pic-preview" />
                                ) : (
                                    <div className="profile-pic-preview" style={{ background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                                        {currentUserObj.username.charAt(0).toUpperCase()}
                                    </div>
                                )
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '14px', marginTop: '16px' }} />
                        </div>
                        <textarea 
                            className="input-field" 
                            placeholder="A little about yourself..." 
                            value={editBio} 
                            onChange={e => setEditBio(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveProfile} style={{ flex: 1, margin: 0 }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showCamera && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3>Take a Photo</h3>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width="100%"
                            videoConstraints={{ facingMode: "user" }}
                            style={{ borderRadius: '12px', marginBottom: '16px' }}
                        />
                        <div className="modal-actions" style={{ width: '100%' }}>
                            <button className="btn-secondary" onClick={() => setShowCamera(false)}>Cancel</button>
                            <button className="btn-primary" onClick={capturePhoto} style={{ flex: 1, margin: 0 }}>Capture</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
