import React from 'react';
import Icon from '../../../components/AppIcon';


const FeeTypeCard = ({ feeType, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-background rounded-lg border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Tag" size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{feeType?.name}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              feeType?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {feeType?.status}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{feeType?.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount:</span>
          <span className="text-sm font-semibold text-foreground">{feeType?.amount?.toLocaleString()} FCFA</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Due Date:</span>
          <span className="text-sm font-medium text-foreground">{feeType?.dueDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Frequency:</span>
          <span className="text-sm font-medium text-foreground">{feeType?.frequency}</span>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs text-muted-foreground">Applicable Classes:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {feeType?.applicableClasses?.slice(0, 2)?.map((cls, idx) => (
            <span key={idx} className="px-2 py-1 bg-muted/50 rounded text-xs text-foreground">
              {cls}
            </span>
          ))}
          {feeType?.applicableClasses?.length > 2 && (
            <span className="px-2 py-1 bg-muted/50 rounded text-xs text-foreground">
              +{feeType?.applicableClasses?.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView?.(feeType)}
          className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Icon name="Eye" size={16} />
          View
        </button>
        <button
          onClick={() => onEdit?.(feeType)}
          className="flex-1 px-3 py-2 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <Icon name="Edit" size={16} />
          Edit
        </button>
        <button
          onClick={() => onDelete?.(feeType)}
          className="px-3 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
        >
          <Icon name="Trash2" size={16} />
        </button>
      </div>
    </div>
  );
};

export default FeeTypeCard;