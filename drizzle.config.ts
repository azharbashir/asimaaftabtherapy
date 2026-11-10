import {defineConfig} from 'drizzle-kit';
export default defineConfig({out:'./migrations/mysql',schema:'./db/schema.ts',dialect:'mysql'});
