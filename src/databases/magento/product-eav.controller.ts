import { Controller, Get, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "src/guards/api-key.guard";
import { ProductEAVService } from "./product-eav.service";
import { ApiSecurity } from "@nestjs/swagger";

// @ApiSecurity('x-api-key')
// @UseGuards(ApiKeyGuard)
@Controller("api/eav")
export class ProductEavController{
    constructor(private productEavService: ProductEAVService){}

    @Get("get-product-by-id/:entityId")
    async getProductById(@Param('entityId') entityId: number){
        const result = await this.productEavService.getProductById(entityId)
        if (!result) {
            throw new NotFoundException(`Product with ID "${entityId}" not found.`);
        }
        return result
    }

    @Get("get-product-by-url-key/:urlKey")
    async getProductByUrlKey(@Param('urlKey') urlKey: string){
        const result = await this.productEavService.getProductByUrlKey(urlKey)
        if (!result) {
            throw new NotFoundException(`Product with ID "${urlKey}" not found.`);
        }
        return result
    }
}

