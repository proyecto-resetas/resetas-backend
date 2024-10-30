import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TokenCardDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    number: string;

    @ApiProperty()
    @IsString()
    cvc: string;

    @ApiProperty()
    @IsString()
    expMonth: string;

    @ApiProperty()
    @IsString()
    expYear: string;

    @ApiProperty()
    @IsString()
    cardHolder: string;
}
