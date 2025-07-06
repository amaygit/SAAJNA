import User from '../models/user.js';
import bcrypt from 'bcrypt';
const registerUser = async (req, res) => {

    try {
        // Extract user data from request body
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({email})

        if(existingUser) {
            return res.status(400).json({
                message: "Email address already in use"
            });
        }
        const salt= await bcrypt.genSalt(10);
        const hashPassword= await bcrypt.hash(password, salt);
        const newUser=await User.create({
            name,
            email,
            password: hashPassword
        });
        //TODO: send verification email
        res.status(201).json({
            message: "Verifcation email sent to your eamil. Please check and verify your account",
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }

};

const loginUser = async (req, res) => {
    try {
        
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
        
    }
};

export {
    registerUser,
    loginUser
}