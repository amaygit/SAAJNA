import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Verification from '../models/verification.js';
import { sendEmail } from '../libs/send-email.js';
const registerUser = async (req, res) => {

    try {
        // Extract user data from request body
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                message: "Email address already in use"
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            name,
            email,
            password: hashPassword
        });
        //TODO: send verification email
        const verificationToken = jwt.sign(
            { userId: newUser._id, property: "email-verification" },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await Verification.create({
            userId: newUser._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
        })

        //send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`;

        const emailSubject = "Verify your email address";
        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
            return res.status(500).json({
                message: "Failed to send verification email. Please try again later."
            });
        }

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