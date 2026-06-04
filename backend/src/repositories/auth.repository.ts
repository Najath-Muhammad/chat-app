import User from "../models/User";

export class AuthRepository {
    async findUserByEmail(email: string) {
        return await User.findOne({ email });
    }

    async createUser(userData: any) {
        return await User.create(userData);
    }
}
