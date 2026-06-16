import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/IAuthService";
import { IAuthRepository } from "../../repositories/interfaces/IAuthRepository";
import { MESSAGES } from "../../constants/messages";

export class AuthService implements IAuthService {
    private authRepository: IAuthRepository;

    constructor(authRepository: IAuthRepository) {
        this.authRepository = authRepository;
    }

    async registerService(userData: any): Promise<any> {
        const { username, email, password } = userData;
        const existingUser = await this.authRepository.findUserByEmail(email);
        
        if (existingUser) {
            throw new Error(MESSAGES.USER_ALREADY_EXISTS);
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.authRepository.createUser({
            username,
            email,
            password: hashedPassword
        });
        
        return user;
    }

    async loginService(credentials: any): Promise<any> {
        const { email, password } = credentials;
        const user = await this.authRepository.findUserByEmail(email);
        
        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error(MESSAGES.INVALID_CREDENTIALS);
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return { token, user };
    }

    async getAllUsersService(): Promise<any> {
        return await this.authRepository.getAllUsers();
    }

    async updateProfileService(userId: string, data: any): Promise<any> {
        return await this.authRepository.updateUser(userId, data);
    }
}
