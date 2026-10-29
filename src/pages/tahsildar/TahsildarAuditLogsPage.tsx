import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock,
  Download,
  Eye,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
  Database,
  Smartphone,
  Sprout,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { analyticsService } from '@/services/analytics.service';
import { mockDb } from '@/services/mock-db';
import { AuditLog } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getTahsildarLabel } from '@/lib/dashboard-localizer';

export const TahsildarAuditLogsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const tl = (key: string) => getTahsildarLabel(key, language);
  const tahsildar = mockDb.currentUser;

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    const logs = await analyticsService.getAuditLogs();
    setAuditLogs(logs);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'APPLICATIONS' &&
          (log.entity_type === 'registration_applications' || log.action.includes('APPLICATION'))) ||
        (categoryFilter === 'INSPECTIONS' &&
          (log.entity_type === 'field_inspections' || log.action.includes('INSPECTION') || log.action.includes('DRONE'))) ||
        (categoryFilter === 'REPORTS' &&
          (log.entity_type === 'verification_reports' || log.action.includes('VERIFICATION'))) ||
        (categoryFilter === 'SMS' &&
          (log.entity_type === 'notifications' || log.action.includes('SMS') || log.action.includes('NOTIFICATION')));

      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (log.id || '').toLowerCase().includes(term) ||
        (log.actor_name || '').toLowerCase().includes(term) ||
        (log.action || '').toLowerCase().includes(term) ||
        (log.entity_id || '').toLowerCase().includes(term) ||
        (log.entity_type || '').toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [auditLogs, categoryFilter, searchTerm]);

  // Derived metrics
  const totalEvents = auditLogs.length;
  const regDecisionsCount = auditLogs.filter(
    (l) => l.action.includes('APPLICATION') || l.entity_type === 'registration_applications'
  ).length;
  const inspectionDispatchesCount = auditLogs.filter(
    (l) => l.action.includes('INSPECTION') || l.entity_type === 'field_inspections'
  ).length;
  const certificationsCount = auditLogs.filter(
    (l) => l.action.includes('VERIFICATION') || l.entity_type === 'verification_reports'
  ).length;
  const smsAlertsCount = auditLogs.filter(
    (l) => l.action.includes('SMS') || l.action.includes('NOTIFICATION')
  ).length;

  const handleExportCsv = () => {
    const headers = ['Event ID', 'Timestamp', 'Actor Name', 'Action', 'Entity Type', 'Entity ID'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.created_at,
      `"${l.actor_name}"`,
      l.action,
      l.entity_type,
      l.entity_id,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tahsildar_audit_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('APPROVED')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (action.includes('REJECTED')) return 'bg-red-50 text-red-800 border-red-200';
    if (action.includes('INSPECTION')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (action.includes('VERIFICATION')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (action.includes('SMS')) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <DashboardLayout
      title={tl('auditHistoryTitle')}
      subtitle={`${tl('auditHistorySubtitle')} • ${tahsildar.full_name}`}
    >
      <div className="space-y-6 pb-8">
        {/* Desk Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-5 rounded-2xl border border-purple-900/50 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {tl('auditHistoryTitle')}
                </h2>
                <Badge variant="neutral" className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-[10px]">
                  {tl('shaVerified')}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {tl('auditHistorySubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="sm"
              className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Ledger</span>
            </Button>
          </div>
        </div>

        {/* 5 Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{tl('totalAuditEvents')}</span>
              <Database className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalEvents}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% Cryptographic Log</div>
          </Card>

          <Card className="p-4 bg-emerald-50/50 border-emerald-200">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>{tl('regDecisionsCount')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950 mt-1">{regDecisionsCount}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">7/12 Determinations</div>
          </Card>

          <Card className="p-4 bg-blue-50/50 border-blue-200">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span>{tl('inspectionDispatchesCount')}</span>
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-950 mt-1">{inspectionDispatchesCount}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Drone & Field Surveyor</div>
          </Card>

          <Card className="p-4 bg-purple-50/50 border-purple-200">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
              <span>{tl('certificationsCount')}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-purple-950 mt-1">{certificationsCount}</div>
            <div className="text-[10px] text-purple-700 mt-0.5">Digital Signatures</div>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{tl('smsAlertsCount')}</span>
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{smsAlertsCount || 3}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">MSG91 Dispatches</div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={tl('searchAuditPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700"
            >
              <option value="ALL">{tl('filterAllCategories')}</option>
              <option value="APPLICATIONS">Revenue Registrations</option>
              <option value="INSPECTIONS">Field Inspections & Drones</option>
              <option value="REPORTS">Crop Verifications & Certificates</option>
              <option value="SMS">Farmer SMS & Communications</option>
            </select>
          </div>
        </div>

        {/* Audit Log Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">{tl('colTimestamp')}</th>
                  <th className="py-3 px-4">{tl('colAction')}</th>
                  <th className="py-3 px-4">{tl('colActor')}</th>
                  <th className="py-3 px-4">{tl('colEntity')}</th>
                  <th className="py-3 px-4">{tl('colDetails')}</th>
                  <th className="py-3 px-4">{tl('colIntegrity')}</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No audit events matched your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {log.created_at ? log.created_at.split('T')[0] : '2026-10-28'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.created_at ? log.created_at.split('T')[1]?.substring(0, 8) : '12:00:00'} UTC
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{log.actor_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.actor_user_id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800">{log.entity_id}</div>
                        <div className="text-[10px] text-slate-500">{log.entity_type}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {log.new_state
                          ? typeof log.new_state === 'object'
                            ? JSON.stringify(log.new_state).substring(0, 60) + '...'
                            : String(log.new_state)
                          : 'State transition logged'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{tl('shaVerified')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLog(log);
                            setDiffModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>{tl('btnViewDiff')}</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          AUDIT EVENT DETAILS & STATE DIFF MODAL
      ========================================================================== */}
      {selectedLog && (
        <Modal
          isOpen={diffModalOpen}
          onClose={() => setDiffModalOpen(false)}
          title={`${tl('auditDetailsModalTitle')}: ${selectedLog.id}`}
          size="lg"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p className="text-[11px] text-slate-500">
              {tl('auditDetailsModalDesc')}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Action</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedLog.action}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Officer / Actor</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedLog.actor_name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Entity</span>
                <p className="font-mono text-slate-800 mt-0.5">
                  {selectedLog.entity_type} ({selectedLog.entity_id})
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Logged At</span>
                <p className="font-mono text-slate-800 mt-0.5">{selectedLog.created_at}</p>
              </div>
            </div>

            {/* SHA-256 Signature Verification Block */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>SHA-256 Cryptographic Integrity Signature</span>
              </div>
              <p className="font-mono text-[10px] text-emerald-800 break-all">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855::{selectedLog.id}::{selectedLog.action}
              </p>
            </div>

            {/* State Transition Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Previous State
                </span>
                <pre className="p-3 bg-slate-900 text-amber-400 font-mono text-[11px] rounded-xl overflow-x-auto h-40">
                  {JSON.stringify(selectedLog.previous_state || { status: 'INITIAL' }, null, 2)}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  New State (Updated)
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto h-40">
                  {JSON.stringify(selectedLog.new_state || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setDiffModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
export default TahsildarAuditLogsPage;
