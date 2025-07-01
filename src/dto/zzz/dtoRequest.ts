import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DtoZZZMessage {
  @ApiProperty({ 
    description: 'Role of the message sender',
    enum: ['system', 'user', 'assistant'],
    example: 'user'
  })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({ 
    description: 'Content of the message',
    example: 'Hello, how are you?'
  })
  @IsString()
  content: string;
}

export class DtoZZZRequest {
  @ApiProperty({ 
    description: 'Zzz model to use',
    example: 'gpt-3.5-turbo'
  })
  @IsString()
  model: string;

  @ApiProperty({ 
    description: 'Array of messages for the conversation',
    type: [DtoZZZMessage]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DtoZZZMessage)
  messages: DtoZZZMessage[];
} 