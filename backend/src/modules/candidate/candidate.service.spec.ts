import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { PrismaService } from 'src/prisma.service';
import { AuditLogService } from '../audit_log/audit_log.service';
import * as fs from 'fs';
import * as path from 'path';

describe('CandidateService', () => {
  let service: CandidateService;

  const prismaMock = {
    candidate: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const auditLogServiceMock = {
    logCandidateActivity: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidateService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditLogService, useValue: auditLogServiceMock },
      ],
    }).compile();

    service = module.get<CandidateService>(CandidateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when candidate does not exist while replacing avatar', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue(null);

    await expect(service.replaceAvatar('candidate-1', 'avatar.png')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prismaMock.candidate.update).not.toHaveBeenCalled();
    expect(auditLogServiceMock.logCandidateActivity).not.toHaveBeenCalled();
  });

  it('should replace avatar and write audit log', async () => {
    const uploadedAt = new Date('2026-03-08T08:00:00.000Z');
    prismaMock.candidate.findUnique.mockResolvedValue({ id: 'candidate-1', avatar_file: null });
    prismaMock.candidate.update.mockResolvedValue({
      id: 'candidate-1',
      avatar_file: 'avatar.png',
      avatar_uploaded_at: uploadedAt,
    });

    const result = await service.replaceAvatar('candidate-1', 'avatar.png', {
      actorType: 'Employee',
      actorEmployeeId: 'emp-1',
      actorRole: 'HR',
    });

    expect(prismaMock.candidate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'candidate-1' },
        data: expect.objectContaining({ avatar_file: 'avatar.png' }),
      }),
    );
    expect(auditLogServiceMock.logCandidateActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: 'candidate-1',
        action: 'CANDIDATE_AVATAR_REPLACED',
      }),
    );
    expect(result).toEqual({
      id: 'candidate-1',
      avatar_file: 'avatar.png',
      avatar_uploaded_at: uploadedAt,
    });
  });

  it('should unlink old avatar file before replacing', async () => {
    prismaMock.candidate.findUnique.mockResolvedValue({
      id: 'candidate-1',
      avatar_file: 'old-avatar.png',
    });
    prismaMock.candidate.update.mockResolvedValue({
      id: 'candidate-1',
      avatar_file: 'new-avatar.png',
      avatar_uploaded_at: new Date('2026-03-08T09:00:00.000Z'),
    });

    const unlinkSpy = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined as never);

    await service.replaceAvatar('candidate-1', 'new-avatar.png');

    expect(unlinkSpy).toHaveBeenCalledWith(
      path.join(process.cwd(), 'uploads', 'avatar', 'old-avatar.png'),
    );

    unlinkSpy.mockRestore();
  });
});
