import { IsEmail, IsString, Length, Matches, IsEnum, IsOptional } from 'class-validator';

export class SignupDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/, {
    message: 'Password must contain at least 1 uppercase letter and 1 special character'
  })
  password: string;

  @IsOptional()
  @IsString()
  @Length(0, 400, { message: 'Address must not exceed 400 characters' })
  address?: string;

  @IsEnum(['user', 'owner', 'admin'], { message: 'Role must be user, owner, or admin' })
  role: 'user' | 'owner' | 'admin';
}
