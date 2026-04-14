import React, { useState, useEffect } from 'react';
import type { Friend } from '../types/friend';

interface FriendModalProps {
  isOpen: boolean;
  friend?: Friend;
  onClose: () => void;
  onSave: (friend: Friend) => void;
}

const FriendModal: React.FC<FriendModalProps> = ({
  isOpen,
  friend,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (friend) {
      setName(friend.name);
      setPublicKey(friend.publicKey);
      setDescription(friend.description || '');
    } else {
      setName('');
      setPublicKey('');
      setDescription('');
    }
  }, [friend]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !publicKey) return;

    const newFriend: Friend = {
      id: friend?.id || '',
      name,
      publicKey,
      description: description || undefined,
    };

    onSave(newFriend);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {friend ? '编辑好友信息' : '加入好友'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              placeholder="输入好友名称..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公钥 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono"
              rows={4}
              placeholder="粘贴好友的公钥..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              rows={2}
              placeholder="添加好友描述（可选）..."
            />
          </div>

          <button
            type="submit"
            disabled={!name || !publicKey}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            确定
          </button>
        </form>
      </div>
    </div>
  );
};

export default FriendModal;