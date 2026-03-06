import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PositionPostService } from './position_post.service';
import { CreatePositionPostDTO } from './dto/create_post';
import { Setting_Position_Posts } from '@prisma/client';
import { PostFilterType } from './dto/filter_type';
import { PostPaginType } from './dto/pagin_type';
import { UpdatePostDTO } from './dto/update_post';

@Controller('position-post')
export class PositionPostController {
    constructor(private positPost: PositionPostService){}
    @Post()
    create(@Body() body: CreatePositionPostDTO): Promise<Setting_Position_Posts>{
        return this.positPost.create(body);
    }

    @Get()
    getAll(@Query() params: PostFilterType): Promise<PostPaginType>{
        return this.positPost.getAll(params);
    }

    @Get(':id')
    getByID(@Param('id') id: string): Promise<Setting_Position_Posts | null>{
        return this.positPost.getByID(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: UpdatePostDTO): Promise<Setting_Position_Posts | null>{
        return this.positPost.update(id, body)
    }
    @Delete(':id')
    delete (@Param('id') id: string): Promise<Setting_Position_Posts>{
        return this.positPost.delete(id);
    }
}
