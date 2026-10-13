import React, { useState, useRef } from 'react';
import { 
  X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, Check, DownloadCloud, FileText
} from 'lucide-react';
import { expenseService } from '../../services/expenseService';
import './ImportExpensesModal.css';

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Health', 'Education', 'Games', 'Investment', 'Other'
];

export default function ImportExpensesModal({ isOpen, onClose, onImportSuccess }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('upload'); // 'upload' | 'mapping' | 'importing' | 'summary'
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  // Column mappings
  const [dateCol, setDateCol] = useState('');
  const [descriptionCol, setDescriptionCol] = useState('');
  const [amountCol, setAmountCol] = useState('');
  const [categoryCol, setCategoryCol] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('Other');
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Import Result
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const resetState = () => {
    setStep('upload');
    setFile(null);
    setIsDragging(false);
    setIsLoadingPreview(false);
    setPreviewData(null);
    setError(null);
    setDateCol('');
    setDescriptionCol('');
    setAmountCol('');
    setCategoryCol('');
    setDefaultCategory('Other');
    setSkipDuplicates(true);
    setImportResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv') && selectedFile.type !== 'text/csv') {
      setError('Please upload a valid .csv bank statement file.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsLoadingPreview(true);

    try {
      const data = await expenseService.previewCSV(selectedFile);
      setPreviewData(data);

      // Auto-assign suggested mapping
      const suggested = data.suggested_mapping || {};
      const headers = data.headers || [];

      setDateCol(suggested.date_col || headers[0] || '');
      setDescriptionCol(suggested.description_col || (headers.length > 1 ? headers[1] : ''));
      setAmountCol(suggested.amount_col || (headers.length > 2 ? headers[2] : ''));
      setCategoryCol(suggested.category_col || '');

      setStep('mapping');
    } catch (err) {
      setError(err.message || 'Failed to read CSV. Please verify file format.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDownloadSample = () => {
    const sampleCsv = 
      "Date,Description,Amount,Category\n" +
      "2026-06-01,Zomato Online Order,450.00,Food\n" +
      "2026-06-02,Uber Premier Ride,320.50,Transport\n" +
      "2026-06-05,Electricity BESCOM Bill,1420.00,Bills\n" +
      "2026-06-08,Amazon India Retail,1299.00,Shopping\n" +
      "2026-06-12,Netflix Subscription,649.00,Entertainment\n";

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sample_bank_statement.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleStartImport = async () => {
    if (!dateCol || !descriptionCol || !amountCol) {
      setError('Please map Date, Description, and Amount columns.');
      return;
    }

    setError(null);
    setStep('importing');

    try {
      const mapping = {
        dateCol,
        descriptionCol,
        amountCol,
        categoryCol: categoryCol || null,
        defaultCategory,
        skipDuplicates
      };

      const result = await expenseService.processCSV(file, mapping);
      setImportResult(result);
      setStep('summary');
      if (onImportSuccess) {
        onImportSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Import failed. Please check your column selections.');
      setStep('mapping');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal import-modal">
        {/* Header */}
        <div className="modal__header">
          <div className="import-modal__title-group">
            <div className="import-modal__icon">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="modal__title">Import Bank Statement</h2>
              <p className="import-modal__subtitle">Upload bank statements or CSV files into your ledger</p>
            </div>
          </div>
          <button className="modal__close" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="import-error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === 'upload' && (
          <div className="import-step-upload">
            <div 
              className={`dropzone ${isDragging ? 'dropzone--dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv,text/csv" 
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              <div className="dropzone__icon-wrapper">
                {isLoadingPreview ? (
                  <Loader2 size={36} className="spin-animation" style={{ color: 'var(--accent-primary)' }} />
                ) : (
                  <UploadCloud size={36} style={{ color: 'var(--accent-primary)' }} />
                )}
              </div>
              <h3 className="dropzone__title">
                {isLoadingPreview ? 'Analyzing CSV Structure...' : 'Choose a CSV file or drag & drop it here'}
              </h3>
              <p className="dropzone__desc">
                Supports statements from HDFC, SBI, ICICI, Chase, Revolut, or standard spreadsheets.
              </p>
              <button 
                type="button" 
                className="btn btn--secondary dropzone__btn"
                disabled={isLoadingPreview}
              >
                Browse Files
              </button>
            </div>

            <div className="import-helper-box">
              <div className="import-helper-text">
                <Sparkles size={16} style={{ color: '#22D3EE' }} />
                <span>Smart Auto-Detection: Montrix automatically matches headers and categorizes common merchants (Zomato, Uber, Amazon, etc.).</span>
              </div>
              <button 
                type="button" 
                className="import-sample-btn"
                onClick={handleDownloadSample}
              >
                <DownloadCloud size={14} />
                Download Sample CSV
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Column Mapping & Preview */}
        {step === 'mapping' && previewData && (
          <div className="import-step-mapping">
            {/* File Info Bar */}
            <div className="import-file-badge">
              <div className="import-file-badge__info">
                <FileText size={16} />
                <span className="import-file-badge__name">{file?.name}</span>
                <span className="import-file-badge__count">({previewData.total_rows} records detected)</span>
              </div>
              <button 
                type="button" 
                className="btn-text-action" 
                onClick={() => setStep('upload')}
              >
                Change File
              </button>
            </div>

            {/* Column Mapping Grid */}
            <div className="mapping-grid">
              <div className="form-group">
                <label className="form-label">
                  Date Column <span className="required-star">*</span>
                </label>
                <select 
                  className="form-select" 
                  value={dateCol} 
                  onChange={(e) => setDateCol(e.target.value)}
                >
                  <option value="">-- Select Column --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description / Narration <span className="required-star">*</span>
                </label>
                <select 
                  className="form-select" 
                  value={descriptionCol} 
                  onChange={(e) => setDescriptionCol(e.target.value)}
                >
                  <option value="">-- Select Column --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Amount Column <span className="required-star">*</span>
                </label>
                <select 
                  className="form-select" 
                  value={amountCol} 
                  onChange={(e) => setAmountCol(e.target.value)}
                >
                  <option value="">-- Select Column --</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Category Column <span className="optional-tag">(Optional)</span>
                </label>
                <select 
                  className="form-select" 
                  value={categoryCol} 
                  onChange={(e) => setCategoryCol(e.target.value)}
                >
                  <option value="">Auto-Detect via Merchant Keywords</option>
                  {previewData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Options */}
            <div className="mapping-secondary-row">
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Default Category (If Unrecognized)</label>
                <select 
                  className="form-select" 
                  style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  value={defaultCategory} 
                  onChange={(e) => setDefaultCategory(e.target.value)}
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <label className="skip-dup-checkbox">
                <input 
                  type="checkbox" 
                  checked={skipDuplicates} 
                  onChange={(e) => setSkipDuplicates(e.target.checked)} 
                />
                <span>Skip existing duplicate transactions</span>
              </label>
            </div>

            {/* Sample Rows Preview */}
            <div className="preview-table-container">
              <div className="preview-table-header">
                <span>Sample Data Preview (First {previewData.sample_rows.length} rows)</span>
              </div>
              <div className="preview-table-scroll">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {previewData.headers.map((h, i) => (
                        <th 
                          key={i} 
                          className={
                            h === dateCol ? 'col-highlight--date' :
                            h === descriptionCol ? 'col-highlight--desc' :
                            h === amountCol ? 'col-highlight--amt' :
                            h === categoryCol ? 'col-highlight--cat' : ''
                          }
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.sample_rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>{cell || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions-footer">
              <button 
                type="button" 
                className="btn btn--secondary"
                onClick={() => setStep('upload')}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button 
                type="button" 
                className="btn btn--primary"
                onClick={handleStartImport}
                disabled={!dateCol || !descriptionCol || !amountCol}
              >
                Import {previewData.total_rows} Transactions
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Importing Spinner */}
        {step === 'importing' && (
          <div className="import-step-progress">
            <Loader2 size={44} className="spin-animation" style={{ color: 'var(--accent-primary)' }} />
            <h3>Importing & Categorizing Transactions...</h3>
            <p>Cleaning currency formats, resolving duplicate records, and updating your balance.</p>
          </div>
        )}

        {/* STEP 4: Summary / Complete */}
        {step === 'summary' && importResult && (
          <div className="import-step-summary">
            <div className="summary-icon-circle">
              <CheckCircle2 size={48} style={{ color: '#06D6A0' }} />
            </div>
            <h3 className="summary-title">Import Finished!</h3>
            <p className="summary-subtitle">Your ledger has been updated with the statement transactions.</p>

            <div className="summary-stats-grid">
              <div className="summary-stat-box success">
                <span className="summary-stat-value">{importResult.imported_count}</span>
                <span className="summary-stat-label">Imported Successfully</span>
              </div>
              <div className="summary-stat-box skipped">
                <span className="summary-stat-value">{importResult.skipped_count}</span>
                <span className="summary-stat-label">Duplicates Skipped</span>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="summary-warnings">
                <div className="summary-warnings-header">
                  <AlertTriangle size={15} />
                  <span>Some rows could not be parsed:</span>
                </div>
                <ul>
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button 
              type="button" 
              className="btn btn--primary" 
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
              onClick={handleClose}
            >
              <Check size={18} />
              Done & View Expenses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
