import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FeeTypeTable = ({ data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Fee Type Name</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Due Date</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Academic Year</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Applicable Classes</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                No fee types found
              </td>
            </tr>
          ) : (
            data?.map((feeType) => (
              <tr key={feeType?.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Tag" size={16} color="var(--color-primary)" />
                    <span className="font-medium text-foreground">{feeType?.feeTypeName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-foreground font-semibold">{feeType?.amount?.toLocaleString()} FCFA</td>
                <td className="py-3 px-4 text-muted-foreground">{feeType?.dueDate}</td>
                <td className="py-3 px-4 text-muted-foreground">{feeType?.academicYear}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {feeType?.applicableClasses?.slice(0, 2)?.map((cls, idx) => (
                      <span key={idx} className="px-2 py-1 bg-muted text-xs rounded-full text-foreground">
                        {cls}
                      </span>
                    ))}
                    {feeType?.applicableClasses?.length > 2 && (
                      <span className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
                        +{feeType?.applicableClasses?.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    feeType?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {feeType?.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="Edit"
                      onClick={() => onEdit?.(feeType)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      iconName="Trash2"
                      onClick={() => onDelete?.(feeType?.id)}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeeTypeTable;