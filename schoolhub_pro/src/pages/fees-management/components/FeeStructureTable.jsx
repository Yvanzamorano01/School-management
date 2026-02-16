import React from 'react';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/format';


const FeeStructureTable = ({ data, onEdit, currency }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Type de frais</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Montant</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Fréquence</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Classe</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Statut</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((fee) => (
            <tr key={fee?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 text-foreground font-medium">{fee?.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{fee?.description || '-'}</td>
              <td className="py-3 px-4 text-foreground font-semibold">
                {formatCurrency(fee?.amount, currency)}
              </td>
              <td className="py-3 px-4 text-muted-foreground">{fee?.frequency}</td>
              <td className="py-3 px-4 text-muted-foreground">{fee?.classId?.name || 'Toutes les classes'}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${fee?.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                  {fee?.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    iconName="Edit"
                    onClick={() => onEdit?.(fee)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconName="Trash2"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructureTable;