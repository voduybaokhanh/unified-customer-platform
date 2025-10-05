// backend/src/modules/tickets/dto/create-comment.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Nội dung comment không được để trống' })
  @MinLength(1, { message: 'Comment phải có ít nhất 1 ký tự' })
  comment: string;

  @IsString()
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}