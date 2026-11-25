/**
 * RELAY — Deterministic Workflow Graph, Interpolated Layout & Execution State
 * Single source of truth for workflow topologies, progress-interpolated node
 * geometry (zero CSS-transition lag), live Scene 03 execution trace, and Scene 05
 * unified execution monitoring & recovery.
 */

import { executionNodeWeight } from './scenes.js?v=3';

export const SCENARIOS = {
  inbound: {
    id: 'inbound',
    label: 'Inbound lead',
    workflowTitle: 'Inbound lead qualification',
    statusText: 'Active',
    revision: 'v14 · 10:42 UTC',
    apps: 'HubSpot · Slack · Postgres',
    summary:
      'Reconfigure topology in place: parallel tenant provisioning, threshold approvals, or incident triage handoffs.',
    nodes: [
      {
        kind: 'Trigger',
        title: 'Receive enquiry',
        meta: 'Webhook · form.inbound',
        rule: 'event.type == "lead.submitted" && payload.email != null',
        mapping: [
          ['source_form', 'payload.utm_campaign'],
          ['submitted_at', 'event.timestamp_utc'],
          ['dedupe_key', 'sha256(payload.email)'],
        ],
        evalText: 'Webhook verified · 18 ms',
        desktop: { x: 0.02, y: 0.12 },
        mobile: { x: 0.03, y: 0.04 },
      },
      {
        kind: 'Validate',
        title: 'Validate contact',
        meta: 'Email MX · Domain check',
        rule: 'mx.reachable(email) && !disposable_domains.has(domain)',
        mapping: [
          ['work_email', 'normalize.lower(email)'],
          ['domain_age', 'whois.days >= 90'],
          ['on_invalid', 'drop_with_audit'],
        ],
        evalText: 'MX & domain valid · 64 ms',
        desktop: { x: 0.275, y: 0.12 },
        mobile: { x: 0.52, y: 0.04 },
      },
      {
        kind: 'Lookup',
        title: 'Existing customer?',
        meta: 'CRM · domain_match',
        rule: 'postgres.accounts.exists(domain) || crm.open_deal(domain)',
        mapping: [
          ['account_id', 'crm.company_lookup'],
          ['tier_status', 'billing.plan_code'],
          ['branch_if_true', 'Fast-track owner'],
        ],
        evalText: 'No open deal found · 92 ms',
        desktop: { x: 0.535, y: 0.12 },
        mobile: { x: 0.52, y: 0.36 },
      },
      {
        kind: 'Condition',
        title: 'Route qualified leads',
        meta: 'score >= 70 · seats >= 25',
        rule: 'lead.valid == true && company.seats >= 25',
        mapping: [
          ['contact_email', 'payload.work_email'],
          ['owner_region', 'geo.lookup(ip)'],
          ['retry_policy', '3x · exp backoff'],
        ],
        evalText: 'Matched EMEA Mid-Market · 28 ms',
        desktop: { x: 0.275, y: 0.62 },
        mobile: { x: 0.03, y: 0.36 },
      },
      {
        kind: 'Action',
        title: 'Create CRM record',
        meta: 'HubSpot · deals.upsert',
        rule: 'idempotency_key == event.hash && stage == "qualified"',
        mapping: [
          ['deal_name', 'company.name + " — Q4"'],
          ['pipeline_id', 'emea_enterprise_v2'],
          ['owner_id', 'route.assigned_rep'],
        ],
        evalText: 'Created deal #HS-9412 · 144 ms',
        desktop: { x: 0.535, y: 0.62 },
        mobile: { x: 0.03, y: 0.68 },
      },
      {
        kind: 'Dispatch',
        title: 'Notify assigned team',
        meta: 'Slack · #emea-pipeline',
        rule: 'channel == route.slack_channel && include_crm_link == true',
        mapping: [
          ['target', '#emea-pipeline'],
          ['mention', 'route.assigned_rep'],
          ['sla_timer', '15m response alert'],
        ],
        evalText: 'Delivered to #emea-pipeline · 66 ms',
        desktop: { x: 0.775, y: 0.37 },
        mobile: { x: 0.52, y: 0.68 },
      },
    ],
    edges: [
      { from: 0, to: 1, primary: true },
      { from: 1, to: 2, primary: true },
      { from: 2, to: 3, primary: true },
      { from: 3, to: 4, primary: true },
      { from: 4, to: 5, primary: true },
      { from: 2, to: 5, primary: false, dashed: true },
    ],
    traceDescriptions: [
      'Step 01 · Enquiry received via inbound form webhook (18 ms)',
      'Step 02 · Work email MX & domain reputation validated (64 ms)',
      'Step 03 · Checked Postgres & CRM for existing customer record (92 ms)',
      'Step 04 · Qualified lead routed to EMEA Mid-Market queue (28 ms)',
      'Step 05 · HubSpot deal record upserted with full attribution (144 ms)',
      'Step 06 · Assigned team notified in #emea-pipeline with CRM link (66 ms)',
    ],
  },

  onboarding: {
    id: 'onboarding',
    label: 'Client onboarding',
    workflowTitle: 'Client onboarding handoff',
    statusText: 'Active',
    revision: 'v09 · 09:15 UTC',
    apps: 'Stripe · Notion · Slack',
    summary:
      'A signed order fans out into parallel tenant provisioning, billing setup, and CSM assignment before converging on the kickoff brief.',
    nodes: [
      {
        kind: 'Trigger',
        title: 'Contract signed',
        meta: 'DocuSign · envelope.ok',
        rule: 'envelope.status == "completed" && order.arr > 0',
        mapping: [
          ['account', 'envelope.company_name'],
          ['contract_id', 'envelope.uuid'],
          ['plan_tier', 'order.sku'],
        ],
        evalText: 'Signed envelope verified · 24 ms',
        desktop: { x: 0.02, y: 0.37 },
        mobile: { x: 0.03, y: 0.04 },
      },
      {
        kind: 'Validate',
        title: 'Verify billing entity',
        meta: 'Tax ID · Invoice terms',
        rule: 'vat.valid(tax_id) && payment_terms in ["NET15", "NET30"]',
        mapping: [
          ['vat_id', 'order.tax_identifier'],
          ['currency', 'region.default_currency'],
          ['terms', 'order.net_days'],
        ],
        evalText: 'Billing profile validated · 71 ms',
        desktop: { x: 0.27, y: 0.37 },
        mobile: { x: 0.52, y: 0.04 },
      },
      {
        kind: 'Parallel A',
        title: 'Provision workspace',
        meta: 'Admin API · SSO setup',
        rule: 'parallel_branch == "infra" && seats == order.seat_count',
        mapping: [
          ['org_slug', 'slugify(account)'],
          ['region', 'eu-west-1'],
          ['sso_mode', 'saml_enforced'],
        ],
        evalText: 'Tenant active in eu-west-1 · 182 ms',
        desktop: { x: 0.525, y: 0.06 },
        mobile: { x: 0.03, y: 0.36 },
      },
      {
        kind: 'Parallel B',
        title: 'Issue setup invoice',
        meta: 'Stripe · invoices.send',
        rule: 'parallel_branch == "finance" && amount == order.initial_fee',
        mapping: [
          ['customer_id', 'stripe.upsert_id'],
          ['collection', 'send_invoice'],
          ['due_days', 'order.net_days'],
        ],
        evalText: 'Invoice #INV-2091 issued · 118 ms',
        desktop: { x: 0.525, y: 0.37 },
        mobile: { x: 0.52, y: 0.36 },
      },
      {
        kind: 'Parallel C',
        title: 'Assign CSM owner',
        meta: 'Roster · capacity_bal',
        rule: 'parallel_branch == "success" && csm.active_load < 14',
        mapping: [
          ['csm_owner', 'roster.lowest_load'],
          ['timezone', 'account.hq_tz'],
          ['handoff_doc', 'notion.template_v4'],
        ],
        evalText: 'Assigned Elena M. (EMEA) · 39 ms',
        desktop: { x: 0.525, y: 0.68 },
        mobile: { x: 0.03, y: 0.68 },
      },
      {
        kind: 'Converge',
        title: 'Send kickoff brief',
        meta: 'Email + Slack invite',
        rule: 'all_settled([provision, invoice, csm]) == true',
        mapping: [
          ['recipient', 'order.primary_contact'],
          ['cc', 'csm_owner.email'],
          ['portal_url', 'tenant.login_link'],
        ],
        evalText: 'Kickoff packet delivered · 54 ms',
        desktop: { x: 0.775, y: 0.37 },
        mobile: { x: 0.52, y: 0.68 },
      },
    ],
    edges: [
      { from: 0, to: 1, primary: true },
      { from: 1, to: 2, primary: true },
      { from: 1, to: 3, primary: true },
      { from: 1, to: 4, primary: true },
      { from: 2, to: 5, primary: true },
      { from: 3, to: 5, primary: true },
      { from: 4, to: 5, primary: true },
    ],
  },

  approval: {
    id: 'approval',
    label: 'Approval routing',
    workflowTitle: 'Commercial discount approval',
    statusText: 'Active',
    revision: 'v21 · 13:05 UTC',
    apps: 'Salesforce · Slack · NetSuite',
    summary:
      'Standard quotes clear automatically while margin exceptions split into sequential finance and legal sign-off before ledger lock.',
    nodes: [
      {
        kind: 'Trigger',
        title: 'Quote submitted',
        meta: 'CRM · quote.pending',
        rule: 'quote.discount_pct > 0 && quote.currency == "EUR"',
        mapping: [
          ['quote_id', 'crm.quote_uuid'],
          ['discount', 'quote.discount_pct'],
          ['annual_val', 'quote.acv_eur'],
        ],
        evalText: 'Quote #Q-718 received · 19 ms',
        desktop: { x: 0.02, y: 0.37 },
        mobile: { x: 0.03, y: 0.04 },
      },
      {
        kind: 'Policy',
        title: 'Evaluate spend tier',
        meta: 'Margin · threshold gate',
        rule: 'quote.discount_pct <= 12 ? "auto" : "escalate"',
        mapping: [
          ['floor_margin', '0.74'],
          ['threshold', '12.0% standard cap'],
          ['risk_score', 'deal.payment_risk'],
        ],
        evalText: 'Discount 18% exceeds cap · 14 ms',
        desktop: { x: 0.265, y: 0.37 },
        mobile: { x: 0.52, y: 0.04 },
      },
      {
        kind: 'Branch A',
        title: 'Auto-approve <= 12%',
        meta: 'Instant release',
        rule: 'quote.discount_pct <= 12 && terms == "standard"',
        mapping: [
          ['approver', 'policy.automated'],
          ['sla', '< 1 second'],
          ['next', 'Commit ledger'],
        ],
        evalText: 'Standby path (not triggered)',
        desktop: { x: 0.515, y: 0.10 },
        mobile: { x: 0.03, y: 0.36 },
      },
      {
        kind: 'Branch B',
        title: 'VP Finance sign-off',
        meta: 'Slack · interactive card',
        rule: 'quote.discount_pct > 12 || quote.acv_eur >= 85000',
        mapping: [
          ['approver_role', 'vp_finance'],
          ['escalation', '4h business SLA'],
          ['state', 'Awaiting confirmation'],
        ],
        evalText: 'Approved by M. Lindqvist · 42m',
        desktop: { x: 0.515, y: 0.64 },
        mobile: { x: 0.52, y: 0.36 },
      },
      {
        kind: 'Review',
        title: 'Legal redline check',
        meta: 'Clauses · MSA diff',
        rule: 'contract.custom_clauses.length > 0',
        mapping: [
          ['clauses', 'liability_cap_v3'],
          ['reviewer', 'counsel_queue'],
          ['status', 'Cleared'],
        ],
        evalText: 'Standard addendum cleared · 88 ms',
        desktop: { x: 0.77, y: 0.64 },
        mobile: { x: 0.03, y: 0.68 },
      },
      {
        kind: 'Ledger',
        title: 'Commit audit ledger',
        meta: 'NetSuite · immutable log',
        rule: 'signature_chain.verified == true',
        mapping: [
          ['ledger_ref', 'NS-2026-8841'],
          ['audit_hash', 'sha256(approvals)'],
          ['quote_lock', 'true'],
        ],
        evalText: 'Audit entry committed · 48 ms',
        desktop: { x: 0.77, y: 0.10 },
        mobile: { x: 0.52, y: 0.68 },
      },
    ],
    edges: [
      { from: 0, to: 1, primary: true },
      { from: 1, to: 2, primary: false, dashed: true },
      { from: 1, to: 3, primary: true },
      { from: 2, to: 5, primary: false, dashed: true },
      { from: 3, to: 4, primary: true },
      { from: 4, to: 5, primary: true },
    ],
  },

  operations: {
    id: 'operations',
    label: 'Operations handoff',
    workflowTitle: 'Incident triage & handoff',
    statusText: 'Active',
    revision: 'v32 · 11:50 UTC',
    apps: 'Datadog · Jira · PagerDuty',
    summary:
      'Production alerts enrich telemetry context, score severity, open engineering tickets, and page the active on-call lead.',
    nodes: [
      {
        kind: 'Trigger',
        title: 'Alert ingested',
        meta: 'Webhook · monitor.p1',
        rule: 'alert.service != null && alert.state == "triggered"',
        mapping: [
          ['service', 'checkout-worker'],
          ['region', 'eu-central-1'],
          ['metric', 'p99_latency > 1400ms'],
        ],
        evalText: 'Monitor #DD-401 ingested · 11 ms',
        desktop: { x: 0.02, y: 0.12 },
        mobile: { x: 0.03, y: 0.04 },
      },
      {
        kind: 'Enrich',
        title: 'Collect host traces',
        meta: 'Logs · last 10m diff',
        rule: 'window == "10m" && include_recent_deploys == true',
        mapping: [
          ['last_deploy', 'sha-88c1a (18m ago)'],
          ['error_rate', '4.2% HTTP 502'],
          ['hosts', '3 nodes degraded'],
        ],
        evalText: 'Correlated release sha-88c1a · 136 ms',
        desktop: { x: 0.02, y: 0.62 },
        mobile: { x: 0.03, y: 0.36 },
      },
      {
        kind: 'Classify',
        title: 'Score severity level',
        meta: 'SLO burn · Sev-2',
        rule: 'error_rate > 2.0 && deploy_delta_min < 30',
        mapping: [
          ['severity', 'SEV-2'],
          ['impact', 'EU checkout queue'],
          ['owner_team', 'platform-core'],
        ],
        evalText: 'Classified SEV-2 · 22 ms',
        desktop: { x: 0.295, y: 0.37 },
        mobile: { x: 0.52, y: 0.20 },
      },
      {
        kind: 'Ticket',
        title: 'Create Jira incident',
        meta: 'Project OPS · linked',
        rule: 'dedupe_open_incident(service) == null',
        mapping: [
          ['issue_key', 'OPS-1842'],
          ['runbook', 'runbook/checkout-502'],
          ['priority', 'High'],
        ],
        evalText: 'Opened OPS-1842 · 94 ms',
        desktop: { x: 0.54, y: 0.12 },
        mobile: { x: 0.52, y: 0.52 },
      },
      {
        kind: 'Escalate',
        title: 'Page on-call engineer',
        meta: 'PagerDuty · Primary',
        rule: 'severity in ["SEV-1", "SEV-2"]',
        mapping: [
          ['schedule', 'eu-platform-primary'],
          ['ack_timeout', '5 minutes'],
          ['responder', 'K. Tanaka'],
        ],
        evalText: 'Acknowledged in 42s · 61 ms',
        desktop: { x: 0.54, y: 0.62 },
        mobile: { x: 0.03, y: 0.68 },
      },
      {
        kind: 'Sync',
        title: 'Open incident channel',
        meta: 'Slack · #inc-1842',
        rule: 'post_timeline_summary && pin_runbook == true',
        mapping: [
          ['channel', '#inc-1842'],
          ['ticket_link', 'jira/OPS-1842'],
          ['handoff', 'Status thread synced'],
        ],
        evalText: 'Channel #inc-1842 active · 49 ms',
        desktop: { x: 0.775, y: 0.37 },
        mobile: { x: 0.52, y: 0.68 },
      },
    ],
    edges: [
      { from: 0, to: 1, primary: true },
      { from: 1, to: 2, primary: true },
      { from: 2, to: 3, primary: true },
      { from: 2, to: 4, primary: true },
      { from: 3, to: 5, primary: true },
      { from: 4, to: 5, primary: true },
    ],
  },
};

export const MONITOR_RUNS = {
  4822: {
    title: 'Run #4822 — Inbound lead qualification',
    showErrorBox: false,
    showRetry: false,
    steps: [
      ['14:22:08.01', '01 · Receive enquiry', '18 ms', 'Verified', 'ok'],
      ['14:22:08.04', '02 · Validate contact', '64 ms', 'Passed', 'ok'],
      ['14:22:08.13', '03 · Existing customer?', '92 ms', 'New account', 'ok'],
      ['14:22:08.18', '04 · Route qualified leads', '28 ms', 'EMEA Queue', 'ok'],
      ['14:22:08.34', '05 · Create CRM record', '144 ms', 'Deal #HS-9412', 'ok'],
      ['14:22:08.41', '06 · Notify assigned team', '66 ms', 'Delivered', 'ok'],
    ],
  },
  4821: {
    title: 'Run #4821 — Commercial discount approval',
    showErrorBox: false,
    showRetry: false,
    steps: [
      ['14:18:40.02', '01 · Quote submitted', '19 ms', 'Verified', 'ok'],
      ['14:18:40.04', '02 · Evaluate spend tier', '14 ms', '18% > 12% cap', 'ok'],
      ['14:18:40.09', '03 · VP Finance sign-off', 'Pending', 'Awaiting reply', 'warn'],
      ['—', '04 · Legal redline check', 'Queued', 'Blocked on Step 3', 'idle'],
      ['—', '05 · Commit audit ledger', 'Queued', 'Blocked on Step 3', 'idle'],
    ],
  },
  4820: {
    title: 'Run #4820 — Inbound lead qualification (Retry #1)',
    showErrorBox: true,
    showRetry: true,
    steps: [
      ['14:11:19.01', '01 · Receive enquiry', '18 ms', 'Verified', 'ok'],
      ['14:11:19.04', '02 · Validate contact', '64 ms', 'Passed', 'ok'],
      ['14:11:19.13', '03 · Existing customer?', '92 ms', 'New account', 'ok'],
      ['14:11:19.18', '04 · Route qualified leads', '28 ms', 'Matched EMEA', 'ok'],
      ['14:11:19.59', '05 · Create CRM record', '410 ms', 'HTTP 429 Quota', 'err'],
      ['—', '06 · Notify assigned team', 'Queued', 'Awaiting Step 5', 'idle'],
    ],
  },
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep01(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

export class WorkflowController {
  constructor(rootEl, connectors) {
    this.rootEl = rootEl;
    this.connectors = connectors;
    this.canvasBoard = document.getElementById('canvas-board');
    this.nodeEls = Array.from(document.querySelectorAll('.wf-node'));
    this.titleEl = document.getElementById('ws-workflow-title');
    this.statusEl = document.getElementById('ws-status-text');
    this.revisionEl = document.getElementById('ws-revision');
    this.appsEl = document.getElementById('ws-apps');
    this.stampEl = document.getElementById('ws-run-stamp');

    this.inspStepNum = document.getElementById('insp-step-num');
    this.inspTitle = document.getElementById('insp-title');
    this.inspRule = document.getElementById('insp-rule');
    this.inspMapping = document.getElementById('insp-mapping');
    this.inspEval = document.getElementById('insp-eval');

    this.traceText = document.getElementById('scene03-trace-text');
    this.traceFill = document.getElementById('scene03-trace-fill');

    this.monitorTitle = document.getElementById('monitor-detail-title');
    this.monitorTimeline = document.getElementById('monitor-timeline-steps');
    this.monitorErrorBox = document.getElementById('monitor-error-box');
    this.retryBtn = document.getElementById('btn-retry-step');
    this.errorRunBadge = document.getElementById('error-run-badge');
    this.errorRunSub = document.getElementById('error-run-sub');

    this.activeScenarioId = 'inbound';
    this.targetScenarioId = 'inbound';
    this.selectedNodeIndex = 3;
    this.activeRunId = '4820';
    this.errorRecovered = false;
    this.manualExecutionStep = -1;
    this.manualStepTimer = null;

    // Tween state strictly for manual tab clicks (so manual clicks also interpolate through shared pipeline)
    this.tweenFromId = 'inbound';
    this.tweenToId = 'inbound';
    this.tweenProgress = 1;
    this.tweenRaf = null;

    this._bindInteractions();
    this.renderGraphBlend('inbound', 'inbound', 1, -1, 1);
    this.selectNode(3);
    this.renderMonitorRun('4820');
  }

  _bindInteractions() {
    this.nodeEls.forEach((nodeEl, index) => {
      nodeEl.addEventListener('click', () => {
        this.selectNode(index);
      });
    });

    document.querySelectorAll('.ws-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setSidebarModule(btn.dataset.nav || 'workflows');
      });
    });

    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => {
        this.triggerErrorRecovery();
      });
    }

    const runSelectBtns = document.querySelectorAll('[data-run-select]');
    runSelectBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.renderMonitorRun(btn.dataset.runSelect);
      });
    });

    const filterBtns = document.querySelectorAll('[data-run-filter]');
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.runFilter || 'all';
        runSelectBtns.forEach((item) => {
          const kind = item.dataset.kind;
          const visible =
            filter === 'all' ||
            (filter === 'error' && kind === 'error') ||
            (filter === 'pending' && kind === 'pending');
          item.hidden = !visible;
        });
      });
    });

    const runBtn = document.getElementById('ws-run-btn');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.playManualTestRun());
    }
  }

  setSidebarModule(moduleName) {
    if (this.rootEl) {
      this.rootEl.dataset.moduleView = moduleName;
    }
    document.querySelectorAll('.ws-nav-btn').forEach((btn) => {
      const match = btn.dataset.nav === moduleName;
      btn.classList.toggle('is-active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  }

  /**
   * Shared deterministic geometry & connector updater.
   * Interpolates every node's exact (x, y) directly from fromId -> toId at blend t [0..1]
   * and feeds the exact same boxes synchronously to ConnectorEngine.
   */
  renderGraphBlend(fromId, toId, blendT, execStep = -1, edgeDraw = 1, focus = null) {
    if (!this.canvasBoard) return;
    const fromSc = SCENARIOS[fromId] || SCENARIOS.inbound;
    const toSc = SCENARIOS[toId] || SCENARIOS.inbound;
    const t = smoothstep01(blendT);

    // Pick display scenario metadata past midpoint so text & inspector stay coherent
    const displaySc = t >= 0.5 ? toSc : fromSc;
    const changedDisplay = this.activeScenarioId !== displaySc.id;
    this.activeScenarioId = displaySc.id;

    if (changedDisplay) {
      if (this.titleEl) this.titleEl.textContent = displaySc.workflowTitle;
      if (this.statusEl) this.statusEl.textContent = displaySc.statusText;
      if (this.revisionEl) this.revisionEl.textContent = displaySc.revision;
      if (this.appsEl) this.appsEl.textContent = displaySc.apps;
      const summaryEl = document.getElementById('scenario-summary');
      if (summaryEl) summaryEl.textContent = displaySc.summary;

      document.querySelectorAll('[data-scenario]').forEach((btn) => {
        const match = btn.dataset.scenario === displaySc.id;
        btn.classList.toggle('is-active', match);
        btn.setAttribute('aria-selected', match ? 'true' : 'false');
      });
      document.querySelectorAll('[data-sandbox-scenario]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.sandboxScenario === displaySc.id);
      });

      this.selectNode(this.selectedNodeIndex);
    }

    const isMobile = window.innerWidth < 1024;
    const boardW = this.canvasBoard.clientWidth || (isMobile ? 310 : 720);
    const boardH = this.canvasBoard.clientHeight || (isMobile ? 270 : 380);
    const activeIdx =
      this.manualExecutionStep >= 0
        ? this.manualExecutionStep
        : execStep >= 0
        ? Math.min(5, Math.floor(execStep))
        : -1;

    // Slight scale pop on emerging / morphing nodes mid-transition
    const morphDip = Math.sin(t * Math.PI) * 0.04;
    const boxes = [];

    for (let i = 0; i < this.nodeEls.length; i++) {
      const el = this.nodeEls[i];
      const aNode = fromSc.nodes[i];
      const bNode = toSc.nodes[i];
      const dNode = displaySc.nodes[i];

      const aCoords = isMobile ? aNode.mobile : aNode.desktop;
      const bCoords = isMobile ? bNode.mobile : bNode.desktop;

      const xFrac = lerp(aCoords.x, bCoords.x, t);
      const yFrac = lerp(aCoords.y, bCoords.y, t);
      const xPx = xFrac * boardW;
      const weight = executionNodeWeight(i, focus);
      const yPx = yFrac * boardH - weight * (isMobile ? 2 : 7);

      const isStepRunning = activeIdx === i;
      const isStepDone = activeIdx >= 0 && i < activeIdx;
      // During the cinematic sweep, focus moves continuously, not on status flips.
      const nodeScale = focus
        ? 1.0 - morphDip + weight * (isMobile ? 0.055 : 0.16)
        : isStepRunning ? 1.07 : 1.0 - morphDip;
      el.style.setProperty('--node-focus', weight.toFixed(4));
      el.style.setProperty('--node-context', ((focus?.amount || 0) * (1 - weight)).toFixed(4));

      el.style.transform = `translate3d(${xPx.toFixed(1)}px, ${yPx.toFixed(1)}px, 0) scale(${nodeScale.toFixed(3)})`;
      el.classList.toggle('is-done', isStepDone);
      el.classList.toggle('is-running', isStepRunning);

      if (changedDisplay) {
        const kindEl = el.querySelector('.wf-node-kind');
        const titleEl = el.querySelector('.wf-node-title');
        const metaEl = el.querySelector('.wf-node-meta');
        if (kindEl && kindEl.textContent !== dNode.kind) kindEl.textContent = dNode.kind;
        if (titleEl && titleEl.textContent !== dNode.title) titleEl.textContent = dNode.title;
        if (metaEl && metaEl.textContent !== dNode.meta) metaEl.textContent = dNode.meta;
      }

      const stEl = el.querySelector('.wf-node-state');
      if (stEl) {
        const stLabel =
          activeIdx < 0
            ? 'Ready'
            : isStepDone
            ? 'Passed'
            : isStepRunning
            ? 'Running'
            : 'Queued';
        if (stEl.textContent !== stLabel) stEl.textContent = stLabel;
      }

      const baseW = el.offsetWidth || (isMobile ? 136 : 134);
      const baseH = el.offsetHeight || (isMobile ? 56 : 68);
      // Scale center-preserving approximation for port anchor accuracy
      const scaledW = baseW * nodeScale;
      const scaledH = baseH * nodeScale;
      const dxOffset = (baseW - scaledW) * 0.5;
      const dyOffset = (baseH - scaledH) * 0.5;

      boxes.push({
        x: xPx + dxOffset,
        y: yPx + dyOffset,
        w: scaledW,
        h: scaledH,
      });
    }

    // Update execution trace caption & bar if running Scene 03
    if (execStep >= 0 || this.manualExecutionStep >= 0) {
      const idx = Math.max(0, activeIdx);
      if (this.manualExecutionStep < 0 && this.selectedNodeIndex !== idx) {
        this.selectNode(idx);
      }
      const desc =
        (displaySc.traceDescriptions && displaySc.traceDescriptions[idx]) ||
        `Step 0${idx + 1} · ${displaySc.nodes[idx].title}`;
      if (this.traceText && this.traceText.textContent !== desc) {
        this.traceText.textContent = desc;
      }
      if (this.traceFill) {
        const effective = this.manualExecutionStep >= 0 ? this.manualExecutionStep : execStep;
        const frac = Math.max(0.12, Math.min(1, (effective + 0.45) / 6));
        this.traceFill.style.transform = `scaleX(${frac.toFixed(3)})`;
      }
    } else if (this.traceFill) {
      this.traceFill.style.transform = 'scaleX(0.14)';
    }

    // Smoothly retract and extend branching edges mid-transition so restructuring feels alive
    const transitionDraw = t > 0 && t < 1 ? 1 - Math.sin(t * Math.PI) * 0.45 : 1;
    const effectiveDraw = Math.min(edgeDraw, transitionDraw);

    // Synchronize connectors with the EXACT same computed node boxes in the same frame!
    this.connectors.setEdges(displaySc.edges, false);
    this.connectors.updateFromBoxes(boxes, {
      drawProgress: effectiveDraw,
      activeNodeIdx: activeIdx,
      isMobile,
      boardW,
      boardH,
    });
  }

  /**
   * Smoothly animates between scenarios when triggered by manual clicks (tabs or sandbox)
   * using the exact same shared geometry & connector pipeline.
   */
  transitionToScenario(targetId, immediate = false) {
    const nextId = SCENARIOS[targetId] ? targetId : 'inbound';
    if (this.tweenRaf) {
      cancelAnimationFrame(this.tweenRaf);
      this.tweenRaf = null;
    }

    if (immediate) {
      this.tweenFromId = nextId;
      this.tweenToId = nextId;
      this.tweenProgress = 1;
      this.renderGraphBlend(nextId, nextId, 1, -1, 1);
      return;
    }

    this.tweenFromId = this.activeScenarioId;
    this.tweenToId = nextId;
    if (this.tweenFromId === this.tweenToId) {
      this.renderGraphBlend(nextId, nextId, 1, -1, 1);
      return;
    }

    const start = performance.now();
    const dur = 420;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      this.tweenProgress = t;
      this.renderGraphBlend(this.tweenFromId, this.tweenToId, t, -1, 1);
      if (t < 1) {
        this.tweenRaf = requestAnimationFrame(step);
      } else {
        this.tweenRaf = null;
      }
    };
    this.tweenRaf = requestAnimationFrame(step);
  }

  selectNode(index) {
    const scenario = SCENARIOS[this.activeScenarioId] || SCENARIOS.inbound;
    const clamped = Math.max(0, Math.min(scenario.nodes.length - 1, index));
    this.selectedNodeIndex = clamped;
    const node = scenario.nodes[clamped];

    this.nodeEls.forEach((el, i) => {
      el.classList.toggle('is-selected', i === clamped);
    });

    if (this.inspStepNum) {
      this.inspStepNum.textContent = `Step 0${clamped + 1} · ${node.kind}`;
    }
    if (this.inspTitle) this.inspTitle.textContent = node.title;
    if (this.inspRule) this.inspRule.textContent = node.rule;
    if (this.inspEval) this.inspEval.textContent = node.evalText;
    if (this.inspMapping) {
      this.inspMapping.replaceChildren(
        ...node.mapping.map(([key, val]) => {
          const row = document.createElement('div');
          const dt = document.createElement('dt');
          dt.textContent = key;
          const dd = document.createElement('dd');
          dd.textContent = val;
          row.append(dt, dd);
          return row;
        })
      );
    }
  }

  playManualTestRun() {
    if (this.manualStepTimer) {
      clearInterval(this.manualStepTimer);
      this.manualStepTimer = null;
    }
    this.manualExecutionStep = 0;
    this.selectNode(0);
    this.renderGraphBlend(this.activeScenarioId, this.activeScenarioId, 1, 0, 1);

    let step = 0;
    this.manualStepTimer = setInterval(() => {
      step += 1;
      if (step > 5) {
        clearInterval(this.manualStepTimer);
        this.manualStepTimer = null;
        this.manualExecutionStep = -1;
        this.renderGraphBlend(this.activeScenarioId, this.activeScenarioId, 1, 5.8, 1);
        if (this.stampEl) this.stampEl.textContent = 'Last run just now';
        return;
      }
      this.manualExecutionStep = step;
      this.selectNode(step);
      this.renderGraphBlend(this.activeScenarioId, this.activeScenarioId, 1, step, 1);
    }, 340);
  }

  renderMonitorRun(runId) {
    this.activeRunId = runId;
    const data = MONITOR_RUNS[runId] || MONITOR_RUNS['4820'];

    document.querySelectorAll('[data-run-select]').forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.runSelect === runId);
    });

    if (this.monitorTitle) this.monitorTitle.textContent = data.title;
    if (this.monitorTimeline) {
      const items = data.steps.map(([time, name, dur, status, state], idx) => {
        const li = document.createElement('li');
        let resolvedState = state;
        let resolvedStatus = status;
        let resolvedDur = dur;

        if (runId === '4820' && idx === 4 && this.errorRecovered) {
          resolvedState = 'ok';
          resolvedStatus = 'Recovered 201';
          resolvedDur = '138 ms';
        }
        if (runId === '4820' && idx === 5 && this.errorRecovered) {
          resolvedState = 'ok';
          resolvedStatus = 'Delivered';
          resolvedDur = '62 ms';
        }

        li.className = `tl-step tl-${resolvedState}`;
        const tSpan = document.createElement('span');
        tSpan.className = 'tl-time';
        tSpan.textContent = time;

        const nSpan = document.createElement('span');
        nSpan.className = 'tl-name';
        nSpan.textContent = name;

        const dSpan = document.createElement('span');
        dSpan.className = 'tl-dur';
        dSpan.textContent = resolvedDur;

        const sSpan = document.createElement('span');
        sSpan.className = 'tl-status';
        sSpan.textContent = resolvedStatus;

        li.append(tSpan, nSpan, dSpan, sSpan);
        return li;
      });
      this.monitorTimeline.replaceChildren(...items);
    }

    if (this.monitorErrorBox) {
      this.monitorErrorBox.hidden = !data.showErrorBox;
      const codeEl = document.getElementById('error-box-code');
      const noteEl = document.getElementById('error-box-note');
      if (this.errorRecovered) {
        this.monitorErrorBox.classList.add('is-recovered');
        if (codeEl) codeEl.textContent = 'STEP 5 RECOVERED · Replayed preserved payload -> Step 6 notified team';
        if (noteEl) noteEl.textContent = 'HubSpot deal record created (HTTP 201). Workflow completed end-to-end.';
      } else {
        this.monitorErrorBox.classList.remove('is-recovered');
        if (codeEl) {
          codeEl.textContent =
            'ERR_UPSTREAM_QUOTA · Payload preserved in dead-letter buffer (retry #1 queued)';
        }
        if (noteEl) {
          noteEl.textContent =
            'Upstream HubSpot batch endpoint returned 429 Retry-After: 12s. No lead data lost.';
        }
      }
    }

    if (this.retryBtn) {
      this.retryBtn.hidden = !data.showRetry;
      this.retryBtn.textContent = this.errorRecovered ? 'Reset error state' : 'Retry failed step';
    }
  }

  triggerErrorRecovery() {
    this.errorRecovered = !this.errorRecovered;
    if (this.errorRunBadge) {
      this.errorRunBadge.textContent = this.errorRecovered ? 'Recovered' : 'Recoverable error';
      this.errorRunBadge.classList.toggle('mrun-ok', this.errorRecovered);
      this.errorRunBadge.classList.toggle('mrun-err', !this.errorRecovered);
    }
    if (this.errorRunSub) {
      this.errorRunSub.textContent = this.errorRecovered
        ? 'Step 5 replayed cleanly · HTTP 201 · 14:11:32 UTC'
        : 'Step 5 failed · HTTP 429 rate limit · 14:11:19 UTC';
    }
    this.renderMonitorRun('4820');
  }
}
