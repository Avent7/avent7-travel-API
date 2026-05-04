import { SetMetadata } from '@nestjs/common';

export const LOG_OPERATION_KEY = 'logOperation';
export const LogOperation = (operation: string) => SetMetadata(LOG_OPERATION_KEY, operation);
