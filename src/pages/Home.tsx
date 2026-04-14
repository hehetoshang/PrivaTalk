import React, { useState } from 'react';
import KeyGenerator from '../components/KeyGenerator';
import EncryptSection from '../components/EncryptSection';
import DecryptSection from '../components/DecryptSection';
import PasswordEncrypt from '../components/PasswordEncrypt';
import PasswordDecrypt from '../components/PasswordDecrypt';
import FriendList from '../components/FriendList';
import FriendModal from '../components/FriendModal';
import { useCrypto, type EncryptionMode } from '../hooks/useCrypto';
import type { Friend } from '../types/friend';

export default function Home() {
  const {
    mode,
    setMode,
    publicKey,
    friends,
    selectedFriendId,
    selectedFriend,
    isGenerating,
    isEncrypting,
    isDecrypting,
    encryptionResult,
    decryptionResult,
    error,
    handleGenerateKeyPair,
    handleEncrypt,
    handleDecrypt,
    handlePasswordEncrypt,
    handlePasswordDecrypt,
    handleAddFriend,
    handleEditFriend,
    handleDeleteFriend,
    handleSelectFriend,
    copyToClipboard,
  } = useCrypto();

  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | undefined>();

  const handleOpenAddFriendModal = () => {
    setEditingFriend(undefined);
    setIsFriendModalOpen(true);
  };

  const handleOpenEditFriendModal = (friend: Friend) => {
    setEditingFriend(friend);
    setIsFriendModalOpen(true);
  };

  const handleSaveFriend = (friend: Friend) => {
    if (editingFriend) {
      handleEditFriend(friend);
    } else {
      handleAddFriend(friend);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            文本加密解密工具
          </h1>
          <p className="text-gray-600">
            使用密码加密或公钥/私钥模式保护您的敏感信息
          </p>
        </header>

        {/* 模式切换按钮 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <button
              onClick={() => setMode('password')}
              className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                mode === 'password'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              密码加密
            </button>
            <button
              onClick={() => setMode('asymmetric')}
              className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                mode === 'asymmetric'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              端对端加密
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 根据模式显示不同的内容 */}
        {mode === 'password' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PasswordEncrypt
              isEncrypting={isEncrypting}
              encryptionResult={encryptionResult}
              onEncrypt={handlePasswordEncrypt}
              onCopy={copyToClipboard}
            />

            <PasswordDecrypt
              isDecrypting={isDecrypting}
              decryptionResult={decryptionResult}
              onDecrypt={handlePasswordDecrypt}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 小屏幕设备：密钥生成 -> 好友列表 -> 加解密 */}
            {/* 大屏幕设备：好友列表(左) + 密钥生成和加解密(右) */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 密钥生成 - 在小屏幕时放在最上面，大屏幕时放在右边 */}
              <div className="lg:hidden order-1">
                <KeyGenerator
                  publicKey={publicKey}
                  isGenerating={isGenerating}
                  onGenerate={handleGenerateKeyPair}
                  onCopy={copyToClipboard}
                />
              </div>

              {/* 好友列表 - 在小屏幕时在密钥生成下方，大屏幕时在左边 */}
              <div className="lg:w-1/3 order-2">
                <FriendList
                  friends={friends}
                  selectedFriendId={selectedFriendId}
                  onSelectFriend={handleSelectFriend}
                  onEditFriend={handleOpenEditFriendModal}
                  onDeleteFriend={handleDeleteFriend}
                  onAddFriend={handleOpenAddFriendModal}
                />
              </div>

              {/* 大屏幕：密钥生成和加解密区域 */}
              <div className="lg:w-2/3 space-y-6 order-3">
                {/* 大屏幕时的密钥生成 */}
                <div className="hidden lg:block">
                  <KeyGenerator
                    publicKey={publicKey}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerateKeyPair}
                    onCopy={copyToClipboard}
                  />
                </div>

                {/* 加解密区域 */}
                <div className="space-y-6">
                  <EncryptSection
                    isEncrypting={isEncrypting}
                    encryptionResult={encryptionResult}
                    selectedFriend={selectedFriend}
                    onEncrypt={handleEncrypt}
                    onCopy={copyToClipboard}
                  />

                  <DecryptSection
                    isDecrypting={isDecrypting}
                    decryptionResult={decryptionResult}
                    onDecrypt={handleDecrypt}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2026 文本加密解密工具</p>
        </footer>
      </div>

      {/* 好友管理弹窗 */}
      <FriendModal
        isOpen={isFriendModalOpen}
        friend={editingFriend}
        onClose={() => setIsFriendModalOpen(false)}
        onSave={handleSaveFriend}
      />
    </div>
  );
}