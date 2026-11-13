import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should refresh token without requiring jwt guard', async () => {
    const tokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    };
    mockAuthService.refreshToken.mockResolvedValue(tokens);

    const result = await controller.refreshToken({
      refresh_token: 'valid-refresh-token',
    });

    expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
      'valid-refresh-token',
    );
    expect(result).toEqual(tokens);
  });
});
