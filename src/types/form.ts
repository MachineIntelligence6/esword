import * as z from 'zod'

export const signUpFormSchema = z.object({
    firstname: z.string({ required_error: "This field is required." }),
    lastname: z.string({ required_error: "This field is required." }),
    email: z.string({ required_error: "This field is required." }).email({ message: "please enter a valid email address" }),
    phone: z.string({ required_error: "This field is required." }),
    password: z.string({ required_error: "This field is required." }).min(8, { message: "Password must contain at-least 8 characterisctics" }),
    confirmPassword: z.string({ required_error: "This field is required." }),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password does not match!",
    path: ["confirmPassword"]
})

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>
export const loginFormSchema = z.object(
    {
        email: z.string({ required_error: "This field is required." }).email({ message: "please enter a valid email address" }),
        password: z.string({ required_error: "This field is required." }).min(8, { message: "Password must contain at-least 8 characterisctics" })

    }
)
export type LoginFormSchema = z.infer<typeof loginFormSchema>

export const forgotPaswordFormSchema = z.object(
    {
        email: z.string({ required_error: "This field is required." }).email({ message: "please enter a valid email address" })
    }
)
export type ForgotPaswordFormSchema = z.infer<typeof forgotPaswordFormSchema>
export const createPaswordFormSchema = z.object(
    {
        password: z.string({ required_error: "This field is required." }).min(8, { message: "Password must contain at-least 8 characterisctics" }),
        confirmPassword: z.string({ required_error: "This field is required." }),
    }
).refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password does not match!",
    path: ["confirmPassword"]
})
export type CreatePaswordFormSchema = z.infer<typeof createPaswordFormSchema>
