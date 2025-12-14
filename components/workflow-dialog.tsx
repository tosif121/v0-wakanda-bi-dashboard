"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/reusable/StatCard'
import { GitBranch, Copy, ExternalLink, Check, Play, Database, Brain, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface WorkflowDialogProps {
  children?: React.ReactNode
}

const WORKFLOW_CONTENT = `id: wakanda_business_intelligence_engine
namespace: assemblehack25.wakanda

description: |
  🏆 WAKANDA DATA AWARD SUBMISSION
  Multi-source business intelligence with AI-powered decisions

inputs:
  - id: data_source_url
    type: STRING
    defaults: "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"

  - id: decision_threshold
    type: INT
    defaults: 75

tasks:
  # PHASE 1: DOWNLOAD DATA
  - id: download_data
    type: io.kestra.plugin.core.http.Download
    uri: "{{ inputs.data_source_url }}"

  # PHASE 2: CLEAN DATA
  - id: clean_data
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    beforeCommands:
      - pip install pandas --quiet
    outputFiles:
      - "data_summary.json"
    script: |
      import pandas as pd
      import json

      df = pd.read_csv("{{ outputs.download_data.uri }}")
      df = df.dropna(how='all')

      summary = {
          "total_rows": len(df),
          "columns": list(df.columns),
          "sample_data": df.head(5).to_dict("records")
      }

      with open("data_summary.json", "w") as f:
          json.dump(summary, f, indent=2, default=str)

      print(f"✅ Processed {len(df)} rows")

  # PHASE 3: AI ANALYSIS
  - id: ai_analysis
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    beforeCommands:
      - pip install openai --quiet
    env:
      PERPLEXITY_API_KEY: "{{ kv('PERPLEXITY_API_KEY') }}"
    inputFiles:
      data_summary.json: "{{ outputs.clean_data.outputFiles['data_summary.json'] }}"
    outputFiles:
      - "ai_summary.txt"
    script: |
      from openai import OpenAI
      import json
      import os

      client = OpenAI(
          api_key=os.getenv("PERPLEXITY_API_KEY"),
          base_url="https://api.perplexity.ai"
      )

      with open("data_summary.json") as f:
          data = json.load(f)

      prompt = f"""You are a business analyst. Analyze this data:

      {json.dumps(data, indent=2)}

      Provide:
      ## SUMMARY
      2-3 sentences

      ## INSIGHTS
      3 bullet points

      ## RECOMMENDATIONS
      3 actions"""

      response = client.chat.completions.create(
          model="sonar",
          messages=[
              {"role": "system", "content": "You are a business analyst."},
              {"role": "user", "content": prompt}
          ]
      )

      summary = response.choices[0].message.content

      with open("ai_summary.txt", "w") as f:
          f.write(summary)

      print("=" * 60)
      print("AI ANALYSIS")
      print("=" * 60)
      print(summary)

  # PHASE 4: AI DECISIONS
  - id: ai_decisions
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    beforeCommands:
      - pip install openai --quiet
    env:
      PERPLEXITY_API_KEY: "{{ kv('PERPLEXITY_API_KEY') }}"
    inputFiles:
      ai_summary.txt: "{{ outputs.ai_analysis.outputFiles['ai_summary.txt'] }}"
    outputFiles:
      - "decisions.json"
    script: |
      from openai import OpenAI
      import json
      import os

      client = OpenAI(
          api_key=os.getenv("PERPLEXITY_API_KEY"),
          base_url="https://api.perplexity.ai"
      )

      with open("ai_summary.txt") as f:
          analysis = f.read()

      prompt = "Based on this analysis, return ONLY valid JSON: {\\"impact_score\\": 85, \\"confidence\\": 90, \\"actions\\": [\\"action1\\"], \\"urgent\\": true}. Analysis: " + analysis

      response = client.chat.completions.create(
          model="sonar",
          messages=[
              {"role": "system", "content": "Return only JSON."},
              {"role": "user", "content": prompt}
          ]
      )

      text = response.choices[0].message.content.strip()
      
      backtick = chr(96)
      if text.startswith(backtick):
          lines = text.split("\\n")
          text = "\\n".join(lines[1:-1])

      decisions = json.loads(text)

      with open("decisions.json", "w") as f:
          json.dump(decisions, f, indent=2)

      print("=" * 60)
      print("DECISIONS")
      print("=" * 60)
      print(json.dumps(decisions, indent=2))

  # PHASE 5: CHECK & TRIGGER
  - id: check_and_trigger
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    inputFiles:
      decisions.json: "{{ outputs.ai_decisions.outputFiles['decisions.json'] }}"
    outputFiles:
      - "trigger.json"
    script: |
      import json

      with open("decisions.json") as f:
          decisions = json.load(f)

      impact = decisions.get("impact_score", 0)
      threshold = {{ inputs.decision_threshold }}
      trigger = impact >= threshold

      status = {
          "trigger": trigger,
          "impact": impact,
          "threshold": threshold
      }

      with open("trigger.json", "w") as f:
          json.dump(status, f)

      print("=" * 60)
      print("THRESHOLD CHECK")
      print("=" * 60)
      print(f"Impact: {impact}/100")
      print(f"Threshold: {threshold}/100")
      print(f"Triggered: {trigger}")
      print()

      if trigger:
          print("🚀 AUTOMATED ACTIONS:")
          print("  • Marketing budget +20%")
          print("  • Hiring pipeline")
          print("  • Infrastructure optimization")

  # PHASE 6: FINAL REPORT
  - id: final_report
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    inputFiles:
      data_summary.json: "{{ outputs.clean_data.outputFiles['data_summary.json'] }}"
      ai_summary.txt: "{{ outputs.ai_analysis.outputFiles['ai_summary.txt'] }}"
      decisions.json: "{{ outputs.ai_decisions.outputFiles['decisions.json'] }}"
      trigger.json: "{{ outputs.check_and_trigger.outputFiles['trigger.json'] }}"
    script: |
      import json

      with open("data_summary.json") as f:
          data = json.load(f)
      
      with open("ai_summary.txt") as f:
          summary = f.read()
      
      with open("decisions.json") as f:
          decisions = json.load(f)
      
      with open("trigger.json") as f:
          status = json.load(f)

      print()
      print("=" * 75)
      print("🏆 WAKANDA BUSINESS INTELLIGENCE REPORT")
      print("=" * 75)
      print()
      print(f"📊 DATA: {data['total_rows']} rows")
      print(f"🤖 AI: Perplexity Sonar")
      print()
      print("─" * 75)
      print("AI ANALYSIS:")
      print("─" * 75)
      print(summary)
      print()
      print("─" * 75)
      print("AI DECISIONS:")
      print("─" * 75)
      print(json.dumps(decisions, indent=2))
      print()
      print("─" * 75)
      print("SUMMARY:")
      print("─" * 75)
      print(f"  Impact: {status['impact']}/100")
      print(f"  Confidence: {decisions.get('confidence', 0)}%")
      print(f"  Automation: {'TRIGGERED' if status['trigger'] else 'SKIPPED'}")
      print()
      if status['trigger']:
          print("ACTIONS:")
          for i, action in enumerate(decisions.get('actions', [])[:3], 1):
              print(f"  {i}. {action}")
      print()
      print("=" * 75)

  # PHASE 7: STORE IN SUPABASE
  - id: store_in_supabase
    type: io.kestra.plugin.scripts.python.Script
    containerImage: python:3.11-slim
    allowFailure: true
    beforeCommands:
      - pip install supabase --quiet
    env:
      SUPABASE_URL: "{{ kv('SUPABASE_URL') }}"
      SUPABASE_KEY: "{{ kv('SUPABASE_KEY') }}"
    inputFiles:
      data_summary.json: "{{ outputs.clean_data.outputFiles['data_summary.json'] }}"
      ai_summary.txt: "{{ outputs.ai_analysis.outputFiles['ai_summary.txt'] }}"
      decisions.json: "{{ outputs.ai_decisions.outputFiles['decisions.json'] }}"
      trigger.json: "{{ outputs.check_and_trigger.outputFiles['trigger.json'] }}"
    script: |
      from supabase import create_client
      import json
      import os

      supabase = create_client(
          os.getenv("SUPABASE_URL"),
          os.getenv("SUPABASE_KEY")
      )

      with open("data_summary.json") as f:
          data = json.load(f)
      
      with open("ai_summary.txt") as f:
          summary = f.read()
      
      with open("decisions.json") as f:
          decisions = json.load(f)
      
      with open("trigger.json") as f:
          status = json.load(f)

      execution_id = "{{ execution.id }}"
      dataset_name = "{{ inputs.data_source_url }}".split("/")[-1]
      
      supabase.table("executions").insert({
          "id": execution_id,
          "status": "success",
          "start_time": "{{ execution.startDate }}",
          "dataset_name": dataset_name,
          "dataset_rows": data["total_rows"],
          "impact_score": status["impact"],
          "confidence": decisions.get("confidence", 0)
      }).execute()

      supabase.table("ai_insights").insert({
          "execution_id": execution_id,
          "summary": summary[:1000],
          "insights": decisions.get("actions", [])
      }).execute()

      supabase.table("decisions").insert({
          "execution_id": execution_id,
          "impact_score": status["impact"],
          "confidence": decisions.get("confidence", 0),
          "threshold": status["threshold"],
          "urgent": decisions.get("urgent", False),
          "actions": decisions.get("actions", [])
      }).execute()

      print("✅ Stored in Supabase successfully!")

triggers:
  - id: daily_run
    type: io.kestra.plugin.core.trigger.Schedule
    cron: "0 9 * * *"`

export function WorkflowDialog({ children }: WorkflowDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WORKFLOW_CONTENT)
      setCopied(true)
      toast.success('Workflow copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy workflow')
    }
  }

  const handleOpenKestra = () => {
    window.open('http://localhost:8080', '_blank')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <GitBranch className="h-5 w-5 text-purple-600" />
            Wakanda BI Workflow Configuration
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete Kestra workflow definition for AI-powered business intelligence
          </p>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              bi-dashboard.yml
            </span>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
              7 Phases
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenKestra}
              className="gap-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-xs">Open Kestra</span>
            </Button>
          </div>
        </div>

        {/* Workflow Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            title="Phases"
            value="7"
            icon={<Play className="h-4 w-4 text-blue-600" />}
            borderColor="border-l-blue-500"
            description="Processing steps"
            className="text-xs"
          />
          <StatCard
            title="Data Sources"
            value="Multi"
            icon={<Database className="h-4 w-4 text-green-600" />}
            borderColor="border-l-green-500"
            description="CSV, URLs, Sheets"
            className="text-xs"
          />
          <StatCard
            title="AI Engine"
            value="Perplexity"
            icon={<Brain className="h-4 w-4 text-purple-600" />}
            borderColor="border-l-purple-500"
            description="Sonar model"
            className="text-xs"
          />
          <StatCard
            title="Automation"
            value="Smart"
            icon={<Target className="h-4 w-4 text-amber-600" />}
            borderColor="border-l-amber-500"
            description="Threshold-based"
            className="text-xs"
          />
        </div>

        <div className="overflow-auto max-h-[50vh] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800">
          <pre className="p-4 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {WORKFLOW_CONTENT}
          </pre>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-4">
          <span>🏆 AssembleHack25 Submission - Wakanda BI Engine</span>
          <span>AI-Powered Business Intelligence Workflow</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}