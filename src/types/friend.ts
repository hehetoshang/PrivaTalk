export interface Friend {
  id: string;
  name: string;
  publicKey: string;
  description?: string;
}

// 生成唯一ID
export function generateFriendId(): string {
  return `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}