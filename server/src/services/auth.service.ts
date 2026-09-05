// Auth Service Layer
export class AuthService {
  public async login(email: string, pass: string) {
    return {
      token: 'jwt_mock_token_2026',
      user: {
        id: 'usr-101',
        email,
        fullName: 'Alex Morgan',
        role: 'STORE_MANAGER',
        storeId: 'store-101'
      }
    };
  }

  public async getProfile(userId: string) {
    return {
      id: userId,
      email: 'alex.morgan@apexretail.com',
      fullName: 'Alex Morgan',
      role: 'STORE_MANAGER',
      storeId: 'store-101'
    };
  }
}

export const authService = new AuthService();
