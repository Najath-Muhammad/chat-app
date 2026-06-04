import React, { useEffect, useState } from 'react';
import socket from '../socket/socket';

interface Message {
    _id: string;
    text: string;
    senderId: string;
    conversationId: string;
    seen: boolean;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Hardcoded for demo - these should come from your conversation selection
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const senderId = user._id;
    const receiverId = 'sample-receiver-id'; 
    const conversationId = 'sample-conversation-id';

    // Step 32 - Receive Message & Step 34 - Backend Listen equivalent (Frontend receive typing)
    useEffect(() => {
        socket.on('receive-message', (message: Message) => {
            setMessages(prev => [...prev, message]);
            
            // Step 35 - Emit Seen (auto-mark seen when received)
            socket.emit('seen-message', { messageId: message._id });
        });

        socket.on('show-typing', () => {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000); // hide after 2 seconds
        });

        return () => {
            socket.off('receive-message');
            socket.off('show-typing');
        };
    }, []);

    const handleSendMessage = () => {
        if (!text.trim()) return;
        
        // Step 31 - Send Message
        socket.emit('send-message', {
            senderId,
            receiverId,
            conversationId,
            text
        });
        
        setText('');
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        
        // Step 33 - Frontend Emit
        socket.emit('typing', { receiverId });
    };

    return (
        <div>
            <h2>Chat</h2>
            <div className="messages">
                {messages.map(msg => (
                    <div key={msg._id}>
                        {msg.text} {msg.seen && <span>(Seen)</span>}
                    </div>
                ))}
                {isTyping && <div>User is typing...</div>}
            </div>
            
            <div>
                <input 
                    type="text" 
                    value={text} 
                    onChange={handleTyping} 
                    placeholder="Type a message..." 
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
