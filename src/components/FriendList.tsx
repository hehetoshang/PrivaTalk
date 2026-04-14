import React, { useState } from 'react';
import type { Friend } from '../types/friend';

interface FriendListProps {
  friends: Friend[];
  selectedFriendId: string | null;
  onSelectFriend: (friend: Friend) => void;
  onEditFriend: (friend: Friend) => void;
  onDeleteFriend: (friendId: string) => void;
  onAddFriend: () => void;
}

const FriendList: React.FC<FriendListProps> = ({
  friends,
  selectedFriendId,
  onSelectFriend,
  onEditFriend,
  onDeleteFriend,
  onAddFriend,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const toggleMenu = (friendId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === friendId ? null : friendId);
  };

  const handleEdit = (friend: Friend, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    onEditFriend(friend);
  };

  const handleDelete = (friendId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    onDeleteFriend(friendId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">好友</h2>
        <button
          onClick={onAddFriend}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold transition-colors duration-200"
        >
          <span className="transform -translate-y-0.5 text-lg">+</span>
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {friends.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            暂无好友，点击上方 + 添加
          </p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onSelectFriend(friend)}
              className={`relative p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                selectedFriendId === friend.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {friend.name}
                  </h3>
                  {friend.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {friend.description}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => toggleMenu(friend.id, e)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>

                  {menuOpenId === friend.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border min-w-32 z-10">
                      <button
                        onClick={(e) => handleEdit(friend, e)}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-t-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        编辑
                      </button>
                      <button
                        onClick={(e) => handleDelete(friend.id, e)}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendList;