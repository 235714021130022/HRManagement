import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Candidate } from '@prisma/client';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create';
import { CandidateFilterType } from './dto/filter_type';
import { CandidatePaginType } from './dto/pagin_type';
import { UpdateCandidateDto } from './dto/update';
import { FileInterceptor } from '@nestjs/platform-express';
import { extractActorFromRequest } from 'src/common/utils/request-actor.util';
import { diskStorage } from 'multer';
import path from 'path';
import type { Response } from "express";
import * as fs from "fs";
function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}
const cvInterceptor = FileInterceptor('cv', {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(file.mimetype);

    cb(ok ? null : new Error('Invalid file type'), ok);
  },
  storage: diskStorage({
    destination: './uploads/cv',
    filename: (req, file, cb) => {
      const safe = sanitizeFilename(file.originalname);
      const ext = safe.includes('.') ? safe.split('.').pop() : '';
      const base = ext ? safe.slice(0, -(ext.length + 1)) : safe;
      const filename = `${Date.now()}-${base}.${ext || 'file'}`;
      cb(null, filename);
    },
  }),
});
@Controller('candidate')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  create(@Body() data: CreateCandidateDto, @Req() req: any): Promise<Candidate> {
    const actor = extractActorFromRequest(req);
    return this.candidateService.create(data, actor);
  }
  @Get(":id/cv")
  async getCv(@Param("id") id: string, @Res() res: Response) {
    const candidate = await this.candidateService.getByID(id);

    if (!candidate.cv_file) throw new NotFoundException("Candidate has no CV");

    const filePath = path.join(process.cwd(), "uploads", "cv", candidate.cv_file);
    if (!fs.existsSync(filePath)) throw new NotFoundException("CV file not found on server");

    // inline để preview trên browser; muốn download force thì dùng attachment
    return res.sendFile(filePath);
  }
  @Get()
  getAll(@Query() filter: CandidateFilterType): Promise<CandidatePaginType> {
    return this.candidateService.getAll(filter);
  }

  @Get(':id')
  getByID(@Param('id') id: string): Promise<Candidate> {
    return this.candidateService.getByID(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCandidateDto,
    @Req() req: any,
  ): Promise<Candidate> {
    const actor = extractActorFromRequest(req);
    return this.candidateService.update(id, body, actor);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any): Promise<Candidate> {
    const actor = extractActorFromRequest(req);
    return this.candidateService.delete(id, actor);
  }

  @Post('upload-cv')
  @UseInterceptors(cvInterceptor)
  async uploadCvPost(
    @UploadedFile() file: Express.Multer.File,
    @Body('candidate_id') candidateId: string,
    @Req() req: any,
  ) {
    if (!candidateId) throw new BadRequestException('candidate_id is required');
    if (!file) throw new BadRequestException('cv file is required');

    const actor = extractActorFromRequest(req);
    const updated = await this.candidateService.replaceCv(candidateId, file.filename, actor);

    return {
      message: 'Upload CV success',
      cv_file: updated.cv_file,
      cv_url: updated.cv_file ? `/uploads/cv/${updated.cv_file}` : null,
      cv_uploaded_at: updated.cv_uploaded_at,
    };
  }

  @Put(':id/cv')
  @UseInterceptors(cvInterceptor)
  async uploadCvPut(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('cv file is required');

    const actor = extractActorFromRequest(req);
    const updated = await this.candidateService.replaceCv(id, file.filename, actor);

    return {
      message: 'Replace CV success',
      cv_file: updated.cv_file,
      cv_url: updated.cv_file ? `/uploads/cv/${updated.cv_file}` : null,
      cv_uploaded_at: updated.cv_uploaded_at,
    };
  }
}
