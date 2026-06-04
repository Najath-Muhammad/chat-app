import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/IAuthService";
import { IAuthRepository } from "../../repositories/interfaces/IAuthRepository";

export class AuthService implements IAuthService {
    private authRepository: IAuthRepository;

    constructor(authRepository: IAuthRepository) {
        this.authRepository = authRepository;
    }

    async registerService(userData: any): Promise<any> {
        const { username, email, password } = userData;
        const existingUser = await this.authRepository.findUserByEmail(email);
        
        if (existingUser) {
            throw new Error("User already exists");
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
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return { token, user };
    }
}
