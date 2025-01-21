import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from 'src/response-dto';
import { stringToBytes } from 'uuid/dist/cjs/v35';

export interface GenericApiResponseOption<TModel extends Type<any>> {
  model: TModel;
  status?: number;
  description?: string;
  isArray?: boolean;
}

export const GenericApiResponse = (option: GenericApiResponseOption<Type>) => {
  const isArrray = option.isArray || false;

  if (isArrray) {
    return applyDecorators(
      ApiExtraModels(ResponseDto, option.model),
      ApiResponse({
        status: option.status || 777,
        description: option.description || '설명 없음',
        schema: {
          allOf: [
            { $ref: getSchemaPath(ResponseDto) },
            {
              properties: {
                message: {
                  type: 'string',
                  example: option.description,
                },
                statusCode: {
                  type: 'number',
                  example: option.status,
                },
                data: {
                  type: 'array',
                  items: {
                    $ref: getSchemaPath(option.model),
                  },
                },
              },
            },
          ],
        },
      }),
    );
  } else {
    return applyDecorators(
      ApiExtraModels(ResponseDto, option.model),
      ApiResponse({
        status: option.status || 777,
        description: option.description || '설명 없음',
        schema: {
          allOf: [
            { $ref: getSchemaPath(ResponseDto) },
            {
              properties: {
                message: {
                  type: 'string',
                  example: option.description,
                },
                statusCode: {
                  type: 'number',
                  example: option.status,
                },
                data: {
                  $ref: getSchemaPath(option.model),
                },
              },
            },
          ],
        },
      }),
    );
  }
};
