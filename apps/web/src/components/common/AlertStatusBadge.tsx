import React from 'react';
import { AlertCircle, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { Alert } from '../../services/api';

interface Props {
  status: Alert['status'];
  size?: 'sm' | 'md' | 'lg';
}

export const AlertStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const getDetails = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Response',
          icon: AlertCircle,
          className: 'bg-rose-100 text-rose-800 border-rose-200'
        };
      case 'acknowledged':
        return {
          label: 'Acknowledged',
          icon: Clock,
          className: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'responding':
        return {
          label: 'EMS Unit Dispatched',
          icon: Truck,
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'resolved':
        return {
          label: 'Incident Resolved',
          icon: CheckCircle2,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'cancelled':
        return {
          label: 'Cancelled by Rider',
          icon: XCircle,
          className: 'bg-slate-100 text-slate-700 border-slate-200'
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const { label, icon: Icon, className } = getDetails();
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : size === 'lg' ? 'text-xs px-3 py-1 font-bold' : 'text-xs px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${className} ${sizeClasses}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
