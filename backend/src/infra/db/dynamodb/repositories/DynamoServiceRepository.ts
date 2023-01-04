import AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

import { IServiceRepository } from '@/protocols';
import env from '@/config/env';

export class DynamoServiceRepository implements IServiceRepository {
  private dynamo = new AWS.DynamoDB.DocumentClient();

  async add(
    params: IServiceRepository.add['Params']
  ): Promise<IServiceRepository.add['Result']> {
    const now = new Date();
    const service = {
      ...params,
      id: uuid(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    await this.dynamo
      .put({
        Item: service,
        TableName: env.ServiceTableName,
      })
      .promise();

    return service;
  }

  async listByProviderId(
    providerId: string
  ): Promise<IServiceRepository.listByProviderId['Result']> {
    const result = await this.dynamo
      .query({
        TableName: env.ServiceTableName,
        IndexName: 'providerIdIndex',
        KeyConditionExpression: 'provider_id = :provider_id',
        ExpressionAttributeValues: {
          ':provider_id': providerId,
        },
      })
      .promise();

    return <any>result.Items;
  }
}