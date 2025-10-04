// backend/src/modules/crm/dto/create-customer.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên không được quá 100 ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @MaxLength(20, { message: 'Số điện thoại không được quá 20 ký tự' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Tên công ty phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Tên công ty không được quá 200 ký tự' })
  company?: string;
}