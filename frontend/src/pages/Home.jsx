import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ChatContainer from '../components/layout/ChatContainer';
import PageWrapper from '../components/layout/PageWrapper';
import ProfileSettings from './ProfileSettings'; 
import Button from '../components/ui/Button'; 
import './Home.scss';

const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // --- CHAT STATE MANAGEMENT ---
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('nova_chats');
    return savedChats ? JSON.parse(savedChats) : [
      { id: '1', title: 'Campus Care Architecture', messages: [] }
    ];
  });
  
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || null);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nova_user_profile');
    return saved ? JSON.parse(saved) : { name: "Devansh", image: null };
  });

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nova_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HANDLERS ---
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(), // Backend aane par ye DB ID ban jayegi
      title: 'New Broadcast',
      messages: []
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const renameChat = (chatId, newTitle) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <PageWrapper>
      <div className={`obsidian-app-container ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>

        <Sidebar 
          isOpen={isSidebarOpen} 
          setOpen={setSidebarOpen} 
          user={user}
          chats={chats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          onNewChat={createNewChat}
          onRenameChat={renameChat}
        />

        <div 
          className={`sidebar-mobile-overlay ${isSidebarOpen ? 'active' : ''}`} 
          onClick={() => setSidebarOpen(false)} 
        />

        <main className="chat-viewport">
          <header className="viewport-header">
            
            <div className="header-left">
              <div className="menu-trigger-zone">
                <Button 
                  variant="ghost" 
                  icon={Menu} 
                  onClick={() => setSidebarOpen(true)}
                  className={`sidebar-toggle-btn ${isSidebarOpen ? 'is-hidden' : 'is-visible'}`}
                />
              </div>

              <div className="breadcrumb-box desktop-only">
                <div className="breadcrumb">
                  <span className="root">NOVA</span>
                  <span className="separator">/</span>
                  <span className="current">
                    {activeChat?.title.toUpperCase() || 'NEURAL_STREAM'}
                  </span>
                </div>
              </div>
            </div>

            <div className="header-right">
              <div className="header-actions">
                <div className="user-block">
                  <div className="user-indicator desktop-only">
                    <div className="status-dot"></div>
                    <span className="user-id">{user.name.toUpperCase()}</span>
                  </div>

                  <button
                    className="profile-trigger"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    {user.image ? (
                      <img src={user.image} alt="Profile" className="user-avatar" />
                    ) : (
                      <div className="user-initial">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </header>

          <div className="chat-content">
            {/* Key ensures ChatContainer remounts when switching chats */}
            <ChatContainer 
              key={activeChatId} 
              chatData={activeChat}
              userName={user.name} 
            />
          </div>
        </main>

        <ProfileSettings 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          user={user}
          onUpdate={(d) => {
            const u = { ...user, ...d };
            setUser(u);
            localStorage.setItem('nova_user_profile', JSON.stringify(u));
          }}
        />
      </div>
    </PageWrapper>
  );
};

export default Home;