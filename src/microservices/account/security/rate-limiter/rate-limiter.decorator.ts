import {SetMetadata} from '@nestjs/common';

export const LIMIT_LOGIN_BY_IP = 'limitLoginByIp';
export const LimitLoginByIp = () => SetMetadata(LIMIT_LOGIN_BY_IP, true);

export const LIMIT_LOGIN_BY_USER = 'limitLoginByUser';
export const LimitLoginByUser = () => SetMetadata(LIMIT_LOGIN_BY_USER, true);

export const LIMIT_ACCESS_BY_IP = 'limitAccessByIp';
export const LimitAccessByIp = () => SetMetadata(LIMIT_ACCESS_BY_IP, true);
