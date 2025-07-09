import {z} from 'zod';
export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6,"Password is required"),
});

export const signUpSchema = z.object({
    email: z.string().email("Invalid email address"),
  password: z.string().min(8,"Password must be 8 characters"),
  name: z.string().min(2, "Name must be atleast 3 characters"),
  confirmPassword:z.string().min(8,"Confirm Password must be 8 characters"),

}).refine((data) => data.password ===data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  export const resetPasswordSchema= z.object({
    newPassword: z.string().min(8,"Password must be 8 characters"),
    confirmPassword:z.string().min(8,"Confirm Password must be 8 characters"),
  }).refine((data) => data.newPassword ===data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
  });

  export const workspaceschema = z.object({
    name: z.string().min(3, "Name must be atleast 3 characters"),
    color: z.string().min(3, "Color must be atleast 3 characters"),
    description: z.string().optional(),
  })