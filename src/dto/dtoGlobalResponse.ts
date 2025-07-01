import { ApiProperty } from '@nestjs/swagger';

export class DtoGlobalResponse {
  @ApiProperty()
  status: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  data: any;
}
