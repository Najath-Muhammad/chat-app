import User from "../../models/User";
import { IAuthRepository } from "../interfaces/IAuthRepository";

export class AuthRepository implements IAuthRepository {
    async findUserByEmail(email: string): Promise<any> {
        return await User.findOne({ email });
    }

    async createUser(userData: any): Promise<any> {
        return await User.create(userData);
    }
}
