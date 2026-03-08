import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';

describe('CandidateController', () => {
  let controller: CandidateController;

  const candidateServiceMock = {
    replaceAvatar: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateController],
      providers: [{ provide: CandidateService, useValue: candidateServiceMock }],
    }).compile();

    controller = module.get<CandidateController>(CandidateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw BadRequestException when candidate_id is missing in avatar POST upload', async () => {
    await expect(
      controller.uploadAvatarPost(
        { filename: 'avatar.png' } as Express.Multer.File,
        '',
        { headers: {} },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException when avatar file is missing in avatar POST upload', async () => {
    await expect(
      controller.uploadAvatarPost(undefined as unknown as Express.Multer.File, 'candidate-1', {
        headers: {},
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should upload avatar with POST when payload is valid', async () => {
    const uploadedAt = new Date();
    candidateServiceMock.replaceAvatar.mockResolvedValue({
      id: 'candidate-1',
      avatar_file: 'avatar.png',
      avatar_uploaded_at: uploadedAt,
    });

    const result = await controller.uploadAvatarPost(
      { filename: 'avatar.png' } as Express.Multer.File,
      'candidate-1',
      { headers: {} },
    );

    expect(candidateServiceMock.replaceAvatar).toHaveBeenCalledWith(
      'candidate-1',
      'avatar.png',
      expect.objectContaining({ actorType: 'System' }),
    );
    expect(result).toEqual({
      message: 'Upload avatar success',
      avatar_file: 'avatar.png',
      avatar_url: '/uploads/avatar/avatar.png',
      avatar_uploaded_at: uploadedAt,
    });
  });

  it('should replace avatar with PUT when payload is valid', async () => {
    const uploadedAt = new Date('2026-03-08T11:00:00.000Z');
    candidateServiceMock.replaceAvatar.mockResolvedValue({
      id: 'candidate-1',
      avatar_file: 'avatar-next.png',
      avatar_uploaded_at: uploadedAt,
    });

    const result = await controller.uploadAvatarPut(
      'candidate-1',
      { filename: 'avatar-next.png' } as Express.Multer.File,
      { headers: {} },
    );

    expect(candidateServiceMock.replaceAvatar).toHaveBeenCalledWith(
      'candidate-1',
      'avatar-next.png',
      expect.objectContaining({ actorType: 'System' }),
    );
    expect(result).toEqual({
      message: 'Replace avatar success',
      avatar_file: 'avatar-next.png',
      avatar_url: '/uploads/avatar/avatar-next.png',
      avatar_uploaded_at: uploadedAt,
    });
  });
});
