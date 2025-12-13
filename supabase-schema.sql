-- Executions table
-- Table 1: Executions
CREATE TABLE executions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration TEXT,
  dataset_name TEXT,
  dataset_rows INTEGER,
  impact_score INTEGER,
  confidence INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: AI Insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id TEXT REFERENCES executions(id),
  summary TEXT,
  insights JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Decisions
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id TEXT REFERENCES executions(id),
  impact_score INTEGER,
  confidence INTEGER,
  threshold INTEGER,
  urgent BOOLEAN,
  actions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional for now)

ALTER TABLE executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE decisions DISABLE ROW LEVEL SECURITY;
