import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export interface ErrorApiResponseOption {
  description: string;
  status: number;
  message_val?: string[];
  message_def?: string;
  error?: string;
}

export const ErrorApiResponse = (option: ErrorApiResponseOption) => {
  if (option.error) {
    return applyDecorators(
      ApiResponse({
        status: option.status || 777,
        description: option.description || '설명 없음',
        schema: {
          properties: {
            message: {
              type: 'array',
              items: {
                type: 'string',
                example: option.message_val,
              },
            },
            error: {
              type: 'string',
              example: option.error,
            },
            statusCode: {
              type: 'number',
              example: option.status,
            },
          },
        },
      }),
    );
  } else {
    return applyDecorators(
      ApiResponse({
        status: option.status || 777,
        description: option.description || '설명 없음',
        schema: {
          properties: {
            statusCode: {
              type: 'number',
              example: option.status,
            },
            message: {
              type: 'string',
              example: option.message_def,
            },
          },
        },
      }),
    );
  }
};
