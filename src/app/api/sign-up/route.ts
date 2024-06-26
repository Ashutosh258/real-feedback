import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcrypt";
import { send } from "process";
import { boolean, date } from "zod";

export async function POST(request:Request) {
    dbConnect();

    try {
        const {username,email,password}=await request.json()
        const existingUserVerifiedByUsername =await UserModel.findOne({
            username,
            isVerified:true
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message:"Username is already taken"
            },{status:400  })
        }
        const existingUserVerifiedByEmail=await UserModel.findOne({email})
        
        const verifyCode=Math.floor(100000+Math.random()*900000).toString()
        
        if(existingUserVerifiedByEmail){
            if(existingUserVerifiedByEmail.isVerified){
                return Response.json({
                    success:false,
                    message:"user already exits with this email"
                },{status:400})     
            }
            else{
                const hassedPassword=await bcrypt.hash(password,10)
                existingUserVerifiedByEmail.password=hassedPassword;
                existingUserVerifiedByEmail.verifyCode=verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry=new Date(Date.now()+3600000);
                await existingUserVerifiedByEmail.save()
            }
           
        }else{
            const hassedPassword=await bcrypt.hash(password,10)
            const expiryDate=new Date()
            expiryDate.setHours(expiryDate.getHours()+1)

            const newUser=new UserModel({
                username,
                email,
                password:hassedPassword,
                verifyCode:verifyCode,
                isVerified:false,
                isAcceptingMessage:true,
                messages:[]
            })

            await newUser.save()
        }
        const emailResponse = await sendVerificationEmail(email,username,verifyCode)
        
        if(!emailResponse.success){
            return Response.json({
                success:false,
                message:emailResponse.message
            },{status:500})
        }
        return Response.json({
            success:true,
            message:"user registered successfully . Please verify your email"
        },{status:201})

    } catch (error) {
        console.error('Error registering user',error)
        return Response.json(
            {
                success:false,
                message:"Error registering user"
            },
            {
                status:500
            }
        )
    }
}