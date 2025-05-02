"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ChatContext_1 = require("@/context/ChatContext");
var avatar_1 = require("@/components/ui/avatar");
var button_1 = require("@/components/ui/button");
var scroll_area_1 = require("@/components/ui/scroll-area");
var input_1 = require("@/components/ui/input");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var UserItem_1 = require("./UserItem");
var ChatSidebar = function () {
    var _a = (0, ChatContext_1.useChat)(), chats = _a.chats, users = _a.users, activeChat = _a.activeChat, setActiveChat = _a.setActiveChat, createChat = _a.createChat, readMessages = _a.readMessages;
    var _b = (0, react_1.useState)(''), searchTerm = _b[0], setSearchTerm = _b[1];
    var _c = (0, react_1.useState)('chats'), activeTab = _c[0], setActiveTab = _c[1];
    var _d = (0, react_1.useState)(''), newGroupName = _d[0], setNewGroupName = _d[1];
    var _e = (0, react_1.useState)([]), selectedUsers = _e[0], setSelectedUsers = _e[1];
    // Filter chats based on search term
    var filteredChats = chats.filter(function (chat) {
        var _a;
        if (chat.type === 'direct') {
            // For direct chats, search by participant name
            return chat.participants.some(function (user) {
                return user.name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        else {
            // For group chats, search by group name
            return (_a = chat.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });
    // Filter users based on search term
    var filteredUsers = users.filter(function (user) {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    var handleChatClick = function (chat) {
        setActiveChat(chat);
        readMessages(chat.id);
    };
    var handleCreateDirectChat = function (user) {
        createChat([user]);
        setActiveTab('chats');
    };
    var handleCreateGroupChat = function () {
        if (selectedUsers.length > 0 && newGroupName) {
            createChat(selectedUsers, newGroupName);
            setSelectedUsers([]);
            setNewGroupName('');
            setActiveTab('chats');
        }
    };
    var toggleUserSelection = function (user) {
        if (selectedUsers.some(function (u) { return u.id === user.id; })) {
            setSelectedUsers(selectedUsers.filter(function (u) { return u.id !== user.id; }));
        }
        else {
            setSelectedUsers(__spreadArray(__spreadArray([], selectedUsers, true), [user], false));
        }
    };
    var getChatName = function (chat) {
        if (chat.type === 'group')
            return chat.name;
        var participant = chat.participants.find(function (p) { return p.id !== 'u1'; });
        return participant === null || participant === void 0 ? void 0 : participant.name;
    };
    var getChatAvatar = function (chat) {
        if (chat.type === 'group') {
            return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c';
        }
        var participant = chat.participants.find(function (p) { return p.id !== 'u1'; });
        return participant === null || participant === void 0 ? void 0 : participant.avatar;
    };
    var formatTime = function (timestamp) {
        var date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (<div className="w-80 border-r h-full flex flex-col bg-sidebar">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold text-chat-primary">Messages</h1>
        <dialog_1.Dialog>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button variant="ghost" size="icon" className="rounded-full">
              <lucide_react_1.PlusCircle className="h-5 w-5 text-chat-primary"/>
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Create New Chat</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <div className="space-y-4 pt-4">
              <input_1.Input placeholder="Group Name" value={newGroupName} onChange={function (e) { return setNewGroupName(e.target.value); }}/>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Users</h3>
                <scroll_area_1.ScrollArea className="h-72">
                  {users.map(function (user) { return (<div key={user.id} className={"flex items-center p-2 rounded-md cursor-pointer ".concat(selectedUsers.some(function (u) { return u.id === user.id; })
                ? 'bg-chat-secondary'
                : 'hover:bg-gray-100')} onClick={function () { return toggleUserSelection(user); }}>
                      <avatar_1.Avatar className="h-8 w-8 mr-2">
                        <img src={user.avatar} alt={user.name}/>
                      </avatar_1.Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>); })}
                </scroll_area_1.ScrollArea>
              </div>
              <button_1.Button className="w-full bg-chat-primary hover:bg-chat-accent" onClick={handleCreateGroupChat} disabled={selectedUsers.length === 0 || !newGroupName}>
                Create Group Chat
              </button_1.Button>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <lucide_react_1.Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
          <input_1.Input placeholder="Search" className="pl-9" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
        </div>
      </div>

      <div className="flex border-b">
        <button className={"flex-1 py-2 flex justify-center items-center space-x-2 ".concat(activeTab === 'chats' ? 'text-chat-primary border-b-2 border-chat-primary' : 'text-gray-500')} onClick={function () { return setActiveTab('chats'); }}>
          <lucide_react_1.MessageCircle className="h-4 w-4"/>
          <span>Chats</span>
        </button>
        <button className={"flex-1 py-2 flex justify-center items-center space-x-2 ".concat(activeTab === 'users' ? 'text-chat-primary border-b-2 border-chat-primary' : 'text-gray-500')} onClick={function () { return setActiveTab('users'); }}>
          <lucide_react_1.Users className="h-4 w-4"/>
          <span>Users</span>
        </button>
      </div>

      <scroll_area_1.ScrollArea className="flex-1">
        {activeTab === 'chats' ? (<div className="p-2 space-y-1">
            {filteredChats.length > 0 ? (filteredChats.map(function (chat) { return (<div key={chat.id} className={"p-2 rounded-md flex items-center space-x-3 cursor-pointer hover:bg-gray-100 ".concat((activeChat === null || activeChat === void 0 ? void 0 : activeChat.id) === chat.id ? 'bg-chat-secondary' : '')} onClick={function () { return handleChatClick(chat); }}>
                  <avatar_1.Avatar className="h-12 w-12">
                    <img src={getChatAvatar(chat)} alt={getChatName(chat)} className="object-cover"/>
                  </avatar_1.Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{getChatName(chat)}</h3>
                      {chat.lastMessage && (<span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>)}
                    </div>
                    {chat.lastMessage && (<p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage.fileUrl ? (<span className="flex items-center">
                            {chat.lastMessage.fileType === 'image' ? '🖼️ Image' : '📁 File'}
                          </span>) : (chat.lastMessage.content)}
                      </p>)}
                    {chat.unreadCount && chat.unreadCount > 0 && (<div className="flex mt-1">
                        <span className="bg-chat-primary text-white text-xs rounded-full px-2 py-0.5">
                          {chat.unreadCount}
                        </span>
                      </div>)}
                  </div>
                </div>); })) : (<div className="text-center p-4 text-gray-500">No chats found</div>)}
          </div>) : (<div className="p-2 space-y-1">
            {filteredUsers.length > 0 ? (filteredUsers.map(function (user) { return (<UserItem_1.default key={user.id} user={user} onClick={function () { return handleCreateDirectChat(user); }}/>); })) : (<div className="text-center p-4 text-gray-500">No users found</div>)}
          </div>)}
      </scroll_area_1.ScrollArea>
    </div>);
};
exports.default = ChatSidebar;
