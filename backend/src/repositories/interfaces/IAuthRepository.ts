export interface IAuthRepository {
    findUserByEmail(email: string): Promise<any>;
    createUser(userData: any): Promise<any>;
    getAllUsers(): Promise<any>;
    updateUser(userId: string, data: any): Promise<any>;
}
