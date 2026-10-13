import { Controller, Get, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "src/guards/api-key.guard";
import { ProductEAVService } from "./product-eav.service";
import { ApiSecurity } from "@nestjs/swagger";

@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller("api/eav")
export class ProductEavController{
    constructor(private productEavService: ProductEAVService){}

    @Get("get-product-by-id/:id")
    async getProductById(@Param('id') id: number){
        const result = await this.productEavService.getProductById(id)
        if (!result) {
            throw new NotFoundException(`Product with ID "${id}" not found.`);
        }
        return result
    }
}

