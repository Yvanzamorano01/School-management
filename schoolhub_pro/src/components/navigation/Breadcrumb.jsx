import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items?.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      {items?.map((item, index) => {
        const isLast = index === items?.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <Icon
                name="ChevronRight"
                size={16}
                className="breadcrumb-separator"
              />
            )}
            {isLast ? (
              <span className="breadcrumb-current" aria-current="page">
                {item?.label}
              </span>
            ) : (
              <Link
                to={item?.path}
                className="breadcrumb-item"
              >
                {item?.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;