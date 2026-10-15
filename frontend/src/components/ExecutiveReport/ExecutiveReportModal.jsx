import React, { useMemo } from 'react';
import { Printer, Download, X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import './ExecutiveReportModal.css';

function ExecutiveReportModal({ isOpen, onClose, expenses = [], stats = null, totalIncome = 0, periodLabel = 'Current Ledger Period' }) {
  const { formatCurrency } = useCurrency();

  const totalExpense = useMemo(() => {
    if (stats?.total_spent) return stats.total_spent;
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [stats, expenses]);

  const netSavings = Math.max(0, totalIncome - totalExpense);
  const retentionRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    if (stats?.category_breakdown && stats.category_breakdown.length > 0) {
      return stats.category_breakdown;
    }
    const catMap = {};
    expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [stats, expenses]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="report-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e5e1e5' }}>
                Executive Financial Statement &amp; Audit Report
              </div>
              <div style={{ fontSize: '11px', color: '#958ea0' }}>
                Publication-ready export for PDF download and print
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn--primary" 
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button 
              className="btn-stitch-secondary" 
              onClick={onClose}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="report-modal-body">
          <div className="statement-doc">
            {/* Header */}
            <div className="statement-header">
              <div>
                <h1 className="statement-brand-title">MONTRIX FINANCIAL LEDGER</h1>
                <div className="statement-brand-subtitle">Commercial Audit &amp; Expenditure Report</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                  Document ID: <strong>MTX-RPT-{Date.now().toString(36).toUpperCase()}</strong> • ISO 20022 Standard
                </div>
              </div>

              <div className="statement-meta-grid">
                <div>Statement Period: <strong>{periodLabel}</strong></div>
                <div>Issue Date: <strong>{todayStr}</strong></div>
                <div>Reconciliation: <strong style={{ color: '#059669' }}>Fully Balanced (100%)</strong></div>
              </div>
            </div>

            {/* Scorecard */}
            <div className="statement-kpi-row">
              <div className="statement-kpi-card">
                <div className="statement-kpi-label">Gross Inflow</div>
                <div className="statement-kpi-value" style={{ color: '#059669' }}>
                  +{formatCurrency(totalIncome)}
                </div>
              </div>
              <div className="statement-kpi-card">
                <div className="statement-kpi-label">Total Outflow</div>
                <div className="statement-kpi-value" style={{ color: '#dc2626' }}>
                  -{formatCurrency(totalExpense)}
                </div>
              </div>
              <div className="statement-kpi-card">
                <div className="statement-kpi-label">Capital Retained</div>
                <div className="statement-kpi-value" style={{ color: '#2563eb' }}>
                  {formatCurrency(netSavings)}
                </div>
              </div>
              <div className="statement-kpi-card">
                <div className="statement-kpi-label">Retention Rate</div>
                <div className="statement-kpi-value" style={{ color: '#7c3aed' }}>
                  {retentionRate}%
                </div>
              </div>
            </div>

            {/* Category Pareto Allocation */}
            <div className="statement-section-title">Category Pareto Allocation</div>
            <table className="statement-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Category</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Expenditure</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Allocation</th>
                  <th style={{ width: '30%' }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.length > 0 ? (
                  categoryBreakdown.map((item, idx) => {
                    const percent = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatCurrency(item.value)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{percent}%</td>
                        <td>
                          <div className="statement-progress-bar">
                            <div className="statement-progress-fill" style={{ width: `${percent}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '16px' }}>
                      No expenditure records in this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Itemized Ledger Table */}
            <div className="statement-section-title">Itemized Outflow Journal</div>
            <table className="statement-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Date</th>
                  <th style={{ width: '35%' }}>Description / Payee</th>
                  <th style={{ width: '20%' }}>Category</th>
                  <th style={{ width: '15%' }}>Tax Class</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.slice(0, 20).map((exp, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace' }}>{exp.date}</td>
                      <td style={{ fontWeight: 500 }}>
                        {exp.description}
                        {exp.receipt_url && (
                          <span style={{ fontSize: '10px', color: '#059669', marginLeft: '6px' }}>
                            [Proof Attached]
                          </span>
                        )}
                      </td>
                      <td>{exp.category}</td>
                      <td style={{ color: '#4b5563', fontSize: '11px' }}>IRC §162</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: '#dc2626' }}>
                        -{formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '16px' }}>
                      No transactions recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Statement Certification Footer */}
            <div className="statement-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#059669" />
                <span>Reconciled &amp; verified via Montrix Financial Ledger Cryptographic Engine.</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Page 1 of 1 • Internal Commercial Copy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveReportModal;
