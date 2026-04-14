import { useState, useEffect } from 'react';
import { generateKeyPair, encryptText, decryptText, encryptWithPassword, decryptWithPassword } from '../utils/crypto';
import { saveKeys, getKeys } from '../utils/storage';
import { getFriends, addFriend, updateFriend, deleteFriend } from '../utils/friendStorage';
import type { Friend } from '../types/friend';
import { generateFriendId } from '../types/friend';

export type EncryptionMode = 'password' | 'asymmetric';

export function useCrypto() {
  const [mode, setMode] = useState<EncryptionMode>('password');
  const [publicKey, setPublicKey] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptionResult, setEncryptionResult] = useState<string>('');
  const [decryptionResult, setDecryptionResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 初始化时检查cookie中的密钥和好友
  useEffect(() => {
    const savedKeys = getKeys();
    if (savedKeys) {
      setPublicKey(savedKeys.publicKey);
      setPrivateKey(savedKeys.privateKey);
    }
    
    // 加载好友列表
    const savedFriends = getFriends();
    setFriends(savedFriends);
  }, []);

  // 获取选中的好友
  const selectedFriend = friends.find(f => f.id === selectedFriendId) || null;

  // 处理添加好友
  const handleAddFriend = (newFriend: Friend) => {
    const friendWithId: Friend = {
      ...newFriend,
      id: generateFriendId(),
    };
    addFriend(friendWithId);
    setFriends([...friends, friendWithId]);
  };

  // 处理编辑好友
  const handleEditFriend = (updatedFriend: Friend) => {
    updateFriend(updatedFriend);
    setFriends(friends.map(f => f.id === updatedFriend.id ? updatedFriend : f));
  };

  // 处理删除好友
  const handleDeleteFriend = (friendId: string) => {
    deleteFriend(friendId);
    setFriends(friends.filter(f => f.id !== friendId));
    if (selectedFriendId === friendId) {
      setSelectedFriendId(null);
    }
  };

  // 处理选择好友
  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriendId(friend.id);
    setError('');
  };

  // 生成密钥对
  const handleGenerateKeyPair = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const keyPair = await generateKeyPair();
      setPublicKey(keyPair.publicKey);
      setPrivateKey(keyPair.privateKey);
      saveKeys(keyPair.publicKey, keyPair.privateKey);
    } catch (err) {
      setError('生成密钥对失败');
      console.error('Error generating key pair:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 加密文本
  const handleEncrypt = async (publicKeyPem: string, plaintext: string) => {
    if (!publicKeyPem || !plaintext) {
      setError('请输入公钥和明文');
      return;
    }
    
    setIsEncrypting(true);
    setError('');
    try {
      const result = await encryptText(publicKeyPem, plaintext);
      setEncryptionResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('加密失败，请检查公钥格式');
      }
      console.error('Error encrypting text:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  // 使用密码加密文本
  const handlePasswordEncrypt = async (password: string, plaintext: string) => {
    if (!password || !plaintext) {
      setError('请输入密码和明文');
      return;
    }
    
    setIsEncrypting(true);
    setError('');
    try {
      const result = await encryptWithPassword(password, plaintext);
      setEncryptionResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('密码加密失败');
      }
      console.error('Error encrypting with password:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  // 使用密码解密文本
  const handlePasswordDecrypt = async (password: string, ciphertext: string) => {
    if (!password || !ciphertext) {
      setError('请输入密码和密文');
      return;
    }
    
    setIsDecrypting(true);
    setError('');
    try {
      const result = await decryptWithPassword(password, ciphertext);
      setDecryptionResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('密码解密失败，请检查密码或密文');
      }
      console.error('Error decrypting with password:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  // 端对端解密文本
  const handleAsymmetricDecrypt = async (ciphertext: string) => {
    if (!privateKey) {
      setError('请先生成密钥对');
      return;
    }
    if (!ciphertext) {
      setError('请输入密文');
      return;
    }
    
    setIsDecrypting(true);
    setError('');
    try {
      const result = await decryptText(privateKey, ciphertext);
      setDecryptionResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('解密失败，请检查密文格式或私钥');
      }
      console.error('Error decrypting text:', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  // 统一的解密函数（根据模式选择）
  const handleDecrypt = handleAsymmetricDecrypt;

  // 复制到剪贴板
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // 检查是否在iframe中
    if (window.self !== window.top) {
      console.warn('当前在 iframe 中，需要父页面设置 allow="clipboard-write"');
    }
    
    // 优先使用现代 API
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 降级方案：使用 textarea + execCommand
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999); // 移动端兼容
        
        try {
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          return success;
        } catch (fallbackErr) {
          document.body.removeChild(textarea);
          console.error('降级方案也失败:', fallbackErr);
          return false;
        }
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.warn('用户未授权或调用时机不对，尝试降级');
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999); // 移动端兼容
        
        try {
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          return success;
        } catch (fallbackErr) {
          document.body.removeChild(textarea);
          console.error('降级方案也失败:', fallbackErr);
          return false;
        }
      }
      console.error('复制失败:', err);
      return false;
    }
  };

  // 切换模式时清除状态
  const switchMode = (newMode: EncryptionMode) => {
    setMode(newMode);
    setError('');
    setEncryptionResult('');
    setDecryptionResult('');
  };

  return {
    mode,
    setMode: switchMode,
    publicKey,
    privateKey,
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
    handleDecrypt: handleAsymmetricDecrypt,
    handlePasswordEncrypt,
    handlePasswordDecrypt,
    handleAddFriend,
    handleEditFriend,
    handleDeleteFriend,
    handleSelectFriend,
    copyToClipboard,
  };
}