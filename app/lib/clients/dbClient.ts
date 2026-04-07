'use server';
import {
  HTTPTransactionOptions,
  neon,
  NeonQueryPromise,
} from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const db = neon(databaseUrl);

export const dbQuery = async <T, R>(
  query: string,
  params: R[] | undefined
): Promise<T[]> => {
  try {
    const result = await db.query(query, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const dbMutateSingle = async <T>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> => {
  try {
    const result = await db(strings, ...values);
    return result as T[];
  } catch (error) {
    console.error('Database mutation error:', error);
    throw error;
  }
};

export const dbMutation = async <T>(
  sql: NeonQueryPromise<false, false, Record<string, T>[]>,
  params?: HTTPTransactionOptions<false, false>
): Promise<Record<string, T>[][]> => {
  try {
    const result = await db.transaction([sql], params);
    return result[0] as Record<string, T>[][];
  } catch (error) {
    console.error('Database mutation error:', error);
    throw error;
  }
};
