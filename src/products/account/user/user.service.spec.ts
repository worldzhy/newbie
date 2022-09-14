/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
import {describe, expect, it} from '@jest/globals';
import {Test, TestingModule} from '@nestjs/testing';
import {UserStatus} from '@prisma/client';
import {UserService} from './user.service';

describe('UserService', () => {
  let service: UserService;

  // Mock data
  const emailUserCreateInput = {
    email: 'worldzhy@126.com',
    status: UserStatus.ACTIVE,
  };

  const emailUser = {
    id: '39704215-9653-4f76-9cf5-acaf94090599',
    email: 'worldzhy@126.com',
    phone: null,
    username: null,
    passwordHash: null,
    lastLogin: null,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2022-05-09T09:05:57.147Z'),
    updatedAt: new Date('2022-05-09T09:05:57.149Z'),
  };

  const phoneUserCreateInput = {
    phone: '569811226',
    status: UserStatus.ACTIVE,
  };

  const phoneUser = {
    id: '39704215-9653-4f76-9cf5-acaf94090599',
    email: null,
    phone: '569811226',
    username: null,
    passwordHash: null,
    lastLogin: null,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2022-05-09T09:05:57.147Z'),
    updatedAt: new Date('2022-05-09T09:05:57.149Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an email user', async () => {
      service.prisma.user.create = jest.fn().mockReturnValueOnce(emailUser);
      const user = await service.create(emailUserCreateInput);

      expect(user).toEqual(emailUser);
      expect(service.prisma.user.create).toBeCalledWith({
        data: emailUserCreateInput,
      });
      expect(service.prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should create a phone user', async () => {
      service.prisma.user.create = jest.fn().mockReturnValueOnce(phoneUser);
      const user = await service.create(phoneUserCreateInput);

      expect(user).toEqual(phoneUser);
      expect(service.prisma.user.create).toBeCalledWith({
        data: phoneUserCreateInput,
      });
      expect(service.prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUnique', () => {
    it('should return an email user', async () => {
      service.prisma.user.findUnique = jest.fn().mockReturnValueOnce(emailUser);
      const user = await service.findUnique({email: emailUser.email});

      expect(user).toEqual(emailUser);
      expect(service.prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return a phone user', async () => {
      service.prisma.user.findUnique = jest.fn().mockReturnValueOnce(phoneUser);
      const user = await service.findUnique({phone: phoneUser.phone});

      expect(user).toEqual(phoneUser);
      expect(service.prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findMany', () => {});

  describe('findByAccount', () => {});

  describe('checkAccount', () => {});

  describe('update', () => {});

  describe('delete', () => {});

  describe('changePassword', () => {});

  describe('resetPassword', () => {});
});
