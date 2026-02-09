import React from 'react';
import Icon from '../../../components/AppIcon';

const NoticeCard = ({ notice }) => {
  const getNoticeTypeColor = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'important':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'general':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const noticeDate = new Date(date);
    const diffMs = now - noticeDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-1 transition-smooth">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Bell" size={18} color="var(--color-primary)" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground line-clamp-1">
              {notice?.title}
            </h4>
            <span className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getNoticeTypeColor(notice?.type)}`}>
              {notice?.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {notice?.message}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Icon name="User" size={12} />
              <span>{notice?.from}</span>
            </div>
            <span>•</span>
            <span>{getTimeAgo(notice?.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeCard;