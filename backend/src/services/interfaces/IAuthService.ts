export interface IAuthService {
    registerService(userData: any): Promise<any>;
    loginService(credentials: any): Promise<any>;
}
