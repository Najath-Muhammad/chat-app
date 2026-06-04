export interface IAuthService {
    registerService(userData: any): Promise<any>;
    loginService(credentials: any): Promise<any>;
    getAllUsersService(): Promise<any>;
    updateProfileService(userId: string, data: any): Promise<any>;
}
