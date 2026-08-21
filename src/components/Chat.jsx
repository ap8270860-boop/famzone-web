import { useState } from 'react'
import './Chat.css'

const CHATS_DATA = {
  Chats: [
    {
      id: 'freelancers',
      name: 'Freelancers India 🇮🇳',
      avatar: 'FI',
      avatarBg: '#5b64a2',
      time: '11:57 PM',
      unread: 23,
      lastMsg: 'Adi: Hiring Alert! Need IT Sales Spe...'
    },
    {
      id: 'inovant',
      name: 'Inovant Solutions',
      subtitle: '44 members',
      avatar: 'IS',
      avatarBg: '#10b981',
      time: '7:48 PM',
      unread: 0,
      lastMsg: 'Thank you everyone for the warm wishe...',
      messages: [
        { id: 1, sender: 'Harshit Goswami', senderColor: '#10b981', avatar: 'HG', avatarBg: '#10b981', text: 'Belated Happy Birthday Abbas Wangde 🎉🎂', time: '7:11 PM', isSelf: false },
        { id: 2, sender: 'Neeraja Joshi', senderColor: '#f97316', avatar: 'NJ', avatarBg: '#f97316', text: 'Belated Happy Birthday Abbas Wangde', time: '7:11 PM', isSelf: false },
        { id: 3, sender: 'Subhajit Naskar', senderColor: '#a855f7', avatar: 'SN', avatarBg: '#a855f7', text: 'Belated Happy Birthday Abbas Wangde Bro 🎉🎂🧁🎈', time: '7:14 PM', isSelf: false },
        { id: 4, sender: 'Harsh Kumbhar', senderColor: '#ef4444', avatar: 'HK', avatarBg: '#ef4444', text: 'Happy Birthday Abbas Wangde brother 👑✨', time: '7:15 PM', isSelf: false },
        {
          id: 5,
          sender: 'MJJ',
          senderColor: '#38bdf8',
          avatar: 'MJ',
          avatarBg: '#06b6d4',
          text: 'AWS DEVOPS Hi I am open to freelance work, let me know if anyone having devops/aws related project or need support... I am having 6+ years of experience in aws, Elastic Cloud, kubernetes, docker, Jenkins, Gitlab, ansible, terraform, Linux, git',
          time: '6:48 AM',
          isSelf: false
        },
        {
          id: 6,
          sender: 'Abbas Wangde',
          text: 'Thank you everyone for the warm wishes! 😊 Really appreciate it! ❤️👑',
          time: '7:48 PM',
          isSelf: true
        },
        {
          id: 7,
          sender: 'Abbas Wangde',
          text: 'hii',
          time: '00:47',
          isSelf: true
        }
      ]
    },
    { id: 'yallaplay', name: 'Project: "Yalla Play" 🗣️', avatar: 'YP', avatarBg: '#f97316', time: '8:02 PM', unread: 32, lastMsg: 'Zeeshan Sange Raj Kotalkar updat...' },
    { id: 'editwithajay', name: 'Editwithajay', avatar: 'EA', avatarBg: '#f97316', time: 'Tue', unread: 0, online: true, lastMsg: 'Need an editor. Like this https://youtu...' },
    { id: 'programmer', name: 'Programmer 🔥', avatar: 'PG', avatarBg: '#8b5cf6', time: '5:20 PM', unread: 0, typing: true, lastMsg: 'typing ...' },
    { id: 'phpteam', name: 'PHP TEAM', avatar: 'PT', avatarBg: '#475569', time: '6:48 PM', unread: 2, lastMsg: 'worked on choice 1) Worked on the ...' },
    { id: 'neeraja', name: 'Neeraja Joshi', avatar: 'NJ', avatarBg: '#10b981', time: '5:51 PM', unread: 0, lastMsg: 'https://web.thewishlist.com/en/user/login' },
    { id: 'cater', name: 'Project: "Cater"', avatar: 'PC', avatarBg: '#eab308', time: '5:31 PM', unread: 2, lastMsg: 'share me live build please' },
    { id: 'frontend', name: 'Frontend | Full Stack We...', avatar: 'FS', avatarBg: '#059669', time: 'Jul 2, 2025', unread: 0, lastMsg: 'That terrifying moment when... • Ctrl...' },
    { id: 'rehan', name: 'Rehan Wangde', avatar: 'RW', avatarBg: '#dc2626', time: '4:36 PM', unread: 0, lastMsg: '← Okay' }
  ],
  'Task chats': [
    {
      id: 'task-1',
      name: 'Task: Grocery Panel Bugfix',
      subtitle: '8 members',
      avatar: 'GP',
      avatarBg: '#ef4444',
      time: '10:15 AM',
      unread: 4,
      lastMsg: 'All orders page filter issue fixed...',
      messages: [
        { id: 1, sender: 'Devvrat', senderColor: '#38bdf8', avatar: 'DV', avatarBg: '#6366f1', text: 'Hey team, please verify the Grocery panel order status query.', time: '10:00 AM', isSelf: true },
        { id: 2, sender: 'PHP Team', senderColor: '#10b981', avatar: 'PT', avatarBg: '#10b981', text: 'Fixed and deployed to staging server!', time: '10:15 AM', isSelf: false }
      ]
    }
  ],
  CoPilot: [],
  Collabs: [],
  Channels: []
}

function Chat() {
  const [activeSideTab, setActiveSideTab] = useState('Messenger')
  const [activeTopTab, setActiveTopTab] = useState('Chats')
  const [activeChatId, setActiveChatId] = useState('inovant')
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const currentChatList = CHATS_DATA[activeTopTab] || CHATS_DATA['Chats']
  const activeChat = CHATS_DATA['Chats'].find(c => c.id === activeChatId) || CHATS_DATA['Chats'][1]

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    const newMsg = {
      id: Date.now(),
      sender: 'Abbas Wangde',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    }
    if (!activeChat.messages) activeChat.messages = []
    activeChat.messages.push(newMsg)
    setInputText('')
  }

  const filteredChats = currentChatList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="bitrix-app flex">
      {/* 1. FAR-LEFT VERTICAL ICON BAR */}
      <aside className="bitrix-icon-bar">
        <div className="icon-bar__top">
          <div className="brand-logo-btn" title="Famzon">
            <img src="/famzon-logo.jpg" alt="Famzon Logo" className="brand-logo-img" />
          </div>
        </div>

        <nav className="icon-bar__nav">
          <button 
            className={`icon-bar__item ${activeSideTab === 'Messenger' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('Messenger'); setActiveTopTab('Chats'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="icon-bar__badge">33</span>
            </div>
            <span>Messenger</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'CoPilot' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('CoPilot'); setActiveTopTab('CoPilot'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <span>CoPilot</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Calendar' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Calendar')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span>Calendar</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Feed' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Feed')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
              <span className="icon-bar__badge icon-bar__badge--pink">7</span>
            </div>
            <span>Feed</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Collabs' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('Collabs'); setActiveTopTab('Collabs'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span>Collabs</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Docs' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Docs')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <span>Docs</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Boards' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Boards')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </div>
            <span>Boards</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Drive' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Drive')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span>Drive</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Webmail' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Webmail')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <span>Webmail</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Groups' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Groups')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <span>Groups</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Tasks' ? 'active' : ''}`}
            onClick={() => { setActiveSideTab('Tasks'); setActiveTopTab('Task chats'); }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span className="icon-bar__badge icon-bar__badge--purple">99</span>
            </div>
            <span>Tasks</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'Booking' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('Booking')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            </div>
            <span>Booking</span>
          </button>

          <button 
            className={`icon-bar__item ${activeSideTab === 'BI' ? 'active' : ''}`}
            onClick={() => setActiveSideTab('BI')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <span>BI</span>
          </button>
        </nav>

        <div className="icon-bar__bottom">
          <div className="user-avatar-initials">AW</div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="bitrix-main-content">
        
        {/* MATCHED HEADER ROW: tabs and active conversation header share one baseline */}
        <div className="bitrix-header-row">
        <header className="bitrix-top-nav">
          <div className="top-nav__tabs">
            {['Chats', 'Task chats', 'CoPilot', 'Collabs', 'Channels', 'Open Channels', 'Notifications', 'More⌄'].map((tab) => (
              <button
                key={tab}
                className={`top-nav__tab ${activeTopTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTopTab(tab)
                  const list = CHATS_DATA[tab]
                  if (list && list[0]) {
                    setActiveChatId(list[0].id)
                  }
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="feed-header">
          <div className="feed-header__left">
            <div className="feed-avatar" style={{ backgroundColor: activeChat.avatarBg }}>{activeChat.avatar}</div>
            <div className="feed-title-info">
              <h3>{activeChat.name}</h3>
              <span>{activeChat.subtitle || '44 members'}</span>
            </div>
          </div>
          <div className="feed-header__right">
            <button className="voice-call-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0  .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              Voice call
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button className="icon-btn" title="Add users"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></button>
            <button className="icon-btn" title="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
            <button className="icon-btn" title="More options"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
          </div>
        </div>
        </div>

        {/* 2-COLUMN CHAT CONTAINER */}
        <div className="bitrix-chat-workspace">
          
          {/* CHAT LIST SIDEBAR */}
          <div className="chat-list-panel">
            <div className="search-bar-wrapper">
              <div className="search-input-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Find employee or chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="edit-btn" title="New Message">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
            </div>

            <div className="chat-cards-list">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-card ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <div className="chat-card__avatar-container">
                    <div className="chat-card__avatar" style={{ backgroundColor: chat.avatarBg }}>
                      {chat.avatar}
                    </div>
                    {chat.online && <span className="online-indicator"></span>}
                  </div>

                  <div className="chat-card__content">
                    <div className="chat-card__header">
                      <span className="chat-card__title">{chat.name}</span>
                      <span className="chat-card__time">{chat.time}</span>
                    </div>

                    <div className="chat-card__footer">
                      {chat.typing ? (
                        <span className="typing-indicator">
                          typing{' '}
                          <span className="typing-dots">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </span>
                        </span>
                      ) : (
                        <span className="chat-card__snippet">{chat.lastMsg}</span>
                      )}
                      {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE CHAT FEED PANE */}
          <div className="chat-feed-panel">
            
            {/* MESSAGES SCROLL AREA */}
            <div className="feed-messages">
              {activeChat.messages && activeChat.messages.map((msg) => (
                <div key={msg.id} className={`msg-group ${msg.isSelf ? 'msg-group--self' : ''}`}>
                  {!msg.isSelf && (
                    <div className="msg-avatar" style={{ backgroundColor: msg.avatarBg || '#0284c7' }}>
                      {msg.avatar}
                    </div>
                  )}

                  <div className="msg-card">
                    {!msg.isSelf && msg.sender && (
                      <div className="msg-sender" style={{ color: msg.senderColor || '#38bdf8' }}>
                        {msg.sender}
                      </div>
                    )}
                    <p className="msg-text">{msg.text}</p>
                    <div className="msg-time">{msg.time} {msg.isSelf && <span className="check-icon">✓✓</span>}</div>
                  </div>
                </div>
              ))}

              {activeChat.messages && activeChat.messages.find(m => m.seen) && (
                <div className="seen-by-status">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {activeChat.messages.find(m => m.seen).seen}
                </div>
              )}
            </div>

            {/* COMPOSER BAR */}
            <div className="feed-composer-wrapper">
              <form className="feed-composer" onSubmit={handleSendMessage}>
                <button type="button" className="composer-icon-btn" title="Attach file">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>

                <input
                  type="text"
                  placeholder="Type @ or + to mention a person, a chat or AI"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <button type="button" className="composer-icon-btn" title="Emoji">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </button>

                <button type="button" className="composer-round-btn" title="Voice note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Help Badge Bottom-Right */}
      <div className="floating-help-badge">?</div>
    </div>
  )
}

export default Chat
