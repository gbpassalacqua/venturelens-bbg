import pg from 'pg';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpamtucGJ4bm9oYWV3bW5xaW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgxNjg4NiwiZXhwIjoyMDg4MzkyODg2fQ.yv7ZToSyS4T0YuTff0gRi4YS7SuYfugQJxbiP-Ppy90';
const PROJECT_REF = 'pijknpbxnohaewmnqioq';

const SQL = `
  create table if not exists analyses (
    id uuid primary key default gen_random_uuid(),
    created_by text,
    project_name text,
    file_url text,
    file_name text,
    score integer,
    verdict text,
    recommendation text,
    mvp_features jsonb,
    v2_features jsonb,
    cut_features jsonb,
    report_json jsonb,
    created_at timestamp default now()
  );

  alter table analyses enable row level security;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE policyname = 'acesso total' AND tablename = 'analyses'
    ) THEN
      CREATE POLICY "acesso total" ON analyses FOR ALL USING (true);
    END IF;
  END
  $$;
`;

const REGIONS = ['sa-east-1', 'us-east-1', 'us-east-2', 'us-west-1', 'eu-west-1'];

async function tryPooler(region: string): Promise<boolean> {
  const connStr = `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  console.log(`Tentando pooler ${region}...`);
  const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    console.log(`Conectado via pooler ${region}!`);
    await client.query(SQL);
    console.log('Tabela analyses criada com sucesso!');
    await client.end();
    return true;
  } catch (e: any) {
    console.log(`  Falhou ${region}: ${e.message?.slice(0, 80)}`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function tryDirect(): Promise<boolean> {
  const connStr = `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
  console.log('Tentando conexão direta...');
  const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    console.log('Conectado direto!');
    await client.query(SQL);
    console.log('Tabela analyses criada com sucesso!');
    await client.end();
    return true;
  } catch (e: any) {
    console.log(`  Falhou direto: ${e.message?.slice(0, 80)}`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function setup() {
  // Tentativa 1: conexão direta
  if (await tryDirect()) return;

  // Tentativa 2: pooler por região
  for (const region of REGIONS) {
    if (await tryPooler(region)) return;
  }

  console.error('\n❌ Nenhuma conexão funcionou.');
  console.log('\n👉 Crie a tabela manualmente no SQL Editor do Supabase:');
  console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('\nSQL para colar:\n');
  console.log(SQL);
}

setup();
