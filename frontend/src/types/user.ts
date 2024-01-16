type UserStatus = 'ONLINE' | 'OFFLINE';

export interface User {
    id: string;
    username: string;
    email: string;
    isTwofactorsEnabled: boolean;
    avatarUrl: string;
    status: UserStatus;
  }

