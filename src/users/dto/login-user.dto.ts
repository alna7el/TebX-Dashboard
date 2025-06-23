import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDTO {

  @IsNotEmpty()
  @IsEmail()
  readonly email;

  @IsNotEmpty()
  @IsString()
  readonly password;
}