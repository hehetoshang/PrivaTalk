import type { Friend } from '../types/friend';

const FRIENDS_STORAGE_KEY = 'encryption_friends';

// 从localStorage获取好友列表
export function getFriends(): Friend[] {
  try {
    const friendsJson = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!friendsJson) {
      return [];
    }
    return JSON.parse(friendsJson);
  } catch (error) {
    console.error('Error loading friends:', error);
    return [];
  }
}

// 保存好友列表到localStorage
export function saveFriends(friends: Friend[]): void {
  try {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  } catch (error) {
    console.error('Error saving friends:', error);
  }
}

// 添加好友
export function addFriend(friend: Friend): void {
  const friends = getFriends();
  friends.push(friend);
  saveFriends(friends);
}

// 更新好友
export function updateFriend(updatedFriend: Friend): void {
  const friends = getFriends();
  const index = friends.findIndex(f => f.id === updatedFriend.id);
  if (index !== -1) {
    friends[index] = updatedFriend;
    saveFriends(friends);
  }
}

// 删除好友
export function deleteFriend(friendId: string): void {
  const friends = getFriends();
  const filteredFriends = friends.filter(f => f.id !== friendId);
  saveFriends(filteredFriends);
}