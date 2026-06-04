export interface IAuthRepository {
    findUserByEmail(email: string): Promise<any>;
    createUser(userData: any): Promise<any>;
    getAllUsers(): Promise<any>;
}
