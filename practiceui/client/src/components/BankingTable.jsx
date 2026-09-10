import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Globe, MapPin, Building, CreditCard, Landmark } from 'lucide-react';
import './BankingTable.css';

const formatCurrency = (amount) => {
  // Round the value as requested (e.g. 9.99 -> 10)
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
};

const getIconForType = (type) => {
  switch (type) {
    case 'Organization': return <Building2 className="node-icon" size={16} />;
    case 'Region': return <Globe className="node-icon" size={16} />;
    case 'Branch': return <MapPin className="node-icon" size={16} />;
    case 'Account': return <CreditCard className="node-icon" size={16} />;
    case 'Sub-Account': return <Landmark className="node-icon" size={16} />;
    default: return <Building className="node-icon" size={16} />;
  }
};

const TableRow = ({ node, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Default expand first two levels
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) setIsExpanded(!isExpanded);
  };

  return (
    <>
      <tr className={`table-row depth-${depth} ${hasChildren ? 'has-children' : ''}`} onClick={toggleExpand}>
        <td className="col-name" style={{ paddingLeft: `${depth * 2 + 1}rem` }}>
          <div className="name-cell">
            <span className="expand-icon-wrapper" style={{ visibility: hasChildren ? 'visible' : 'hidden' }}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            {getIconForType(node.type)}
            <span className="node-name">{node.name}</span>
          </div>
        </td>
        <td className="col-type">
          <span className={`type-badge badge-${node.type.toLowerCase().replace(' ', '-')}`}>
            {node.type}
          </span>
        </td>
        <td className="col-amount">
          {formatCurrency(node.amount)}
        </td>
      </tr>
      {hasChildren && isExpanded && (
        node.children.map((child) => (
          <TableRow key={child.id} node={child} depth={depth + 1} />
        ))
      )}
    </>
  );
};

const BankingTable = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="table-loading-container">
        <div className="spinner"></div>
        <p>Loading Banking Data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty-container">
        <p>No banking data available.</p>
      </div>
    );
  }

  return (
    <div className="banking-table-wrapper">
      <div className="table-header-title">
        <h2>Global Banking Overview</h2>
        <p>Hierarchical view of organizational accounts and balances</p>
      </div>
      <div className="table-container">
        <table className="banking-table">
          <thead>
            <tr>
              <th className="col-name">Entity Name</th>
              <th className="col-type">Entity Type</th>
              <th className="col-amount">Total Amount (Rounded)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((node) => (
              <TableRow key={node.id} node={node} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BankingTable;
