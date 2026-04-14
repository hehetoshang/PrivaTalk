import React, { useState } from 'react';

interface KeyGeneratorProps {
  publicKey: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onCopy: (text: string) => Promise<boolean>;
}

const KeyGenerator: React.FC<KeyGeneratorProps> = ({
  publicKey,
  isGenerating,
  onGenerate,
  onCopy,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    const success = await onCopy(publicKey);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">密钥生成</h2>
      
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mb-6"
      >
        {isGenerating ? '生成中...' : publicKey ? '重新生成密钥对' : '生成密钥对'}
      </button>

      {publicKey && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公钥（复制给对方）
            </label>
            <div className="relative">
              <textarea
                value={publicKey}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                rows={6}
              />
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-md transition-colors duration-200"
              >
                {copySuccess ? '已复制!' : '复制'}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-700">
              私钥已自动存储在您的浏览器本地存储中，请勿分享给他人。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyGenerator;