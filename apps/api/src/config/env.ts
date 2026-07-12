import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid PostgreSQL connection URL' }),
  CORS_ORIGIN: z.string().min(1, { message: 'CORS_ORIGIN must be specified' }),
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET must be at least 32 characters long' }),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    result.error.issues.forEach((issue) => {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
