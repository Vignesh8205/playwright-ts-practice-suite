const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());

// Tree-based data simulating a complex banking hierarchy
const bankingData = [
  {
    id: 'org-1',
    name: 'Global Bank Inc.',
    type: 'Organization',
    amount: 320500.89,
    children: [
      {
        id: 'reg-1',
        name: 'North America',
        type: 'Region',
        amount: 150000.45,
        children: [
          {
            id: 'branch-1',
            name: 'New York Main',
            type: 'Branch',
            amount: 90000.45,
            children: [
              { id: 'acc-1', name: 'Corporate Checking', type: 'Account', amount: 45000.00 },
              { id: 'acc-2', name: 'Investment Portfolio', type: 'Account', amount: 45000.45 }
            ]
          },
          {
            id: 'branch-2',
            name: 'Chicago Downtown',
            type: 'Branch',
            amount: 60000.00,
            children: [
              { id: 'acc-3', name: 'Small Business Checking', type: 'Account', amount: 35000.50 },
              { id: 'acc-4', name: 'Retail Savings', type: 'Account', amount: 24999.50 }
            ]
          }
        ]
      },
      {
        id: 'reg-2',
        name: 'Europe',
        type: 'Region',
        amount: 85320.54,
        children: [
          {
            id: 'branch-3',
            name: 'London HQ',
            type: 'Branch',
            amount: 65320.54,
            children: [
              {
                id: 'acc-5',
                name: 'High Yield Savings',
                type: 'Account',
                amount: 65310.55,
                children: [
                  { id: 'sub-1', name: 'Fixed Deposit A', type: 'Sub-Account', amount: 32655.27 },
                  { id: 'sub-2', name: 'Fixed Deposit B', type: 'Sub-Account', amount: 32655.28 }
                ]
              },
              { id: 'acc-6', name: 'Checking', type: 'Account', amount: 9.99 } // Example of 9.99 as requested
            ]
          },
          {
            id: 'branch-4',
            name: 'Frankfurt Central',
            type: 'Branch',
            amount: 20000.00,
            children: [
              { id: 'acc-7', name: 'Euro Business', type: 'Account', amount: 20000.00 }
            ]
          }
        ]
      },
      {
        id: 'reg-3',
        name: 'Asia-Pacific',
        type: 'Region',
        amount: 85179.90,
        children: [
          {
            id: 'branch-5',
            name: 'Tokyo Branch',
            type: 'Branch',
            amount: 50100.90,
            children: [
              { id: 'acc-8', name: 'Yen Holdings', type: 'Account', amount: 50100.90 }
            ]
          },
          {
            id: 'branch-6',
            name: 'Singapore Hub',
            type: 'Branch',
            amount: 35079.00,
            children: [
              {
                id: 'acc-9',
                name: 'Wealth Management',
                type: 'Account',
                amount: 35079.00,
                children: [
                  { id: 'sub-3', name: 'Equities', type: 'Sub-Account', amount: 20000.00 },
                  { id: 'sub-4', name: 'Bonds', type: 'Sub-Account', amount: 15079.00 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'org-2',
    name: 'Apex Financial',
    type: 'Organization',
    amount: 10005.99,
    children: [
      {
        id: 'reg-4',
        name: 'South America',
        type: 'Region',
        amount: 10005.99,
        children: [
          {
            id: 'branch-7',
            name: 'São Paulo',
            type: 'Branch',
            amount: 10005.99,
            children: [
              { id: 'acc-10', name: 'Operations', type: 'Account', amount: 10000.00 },
              { id: 'acc-11', name: 'Petty Cash', type: 'Account', amount: 5.99 }
            ]
          }
        ]
      }
    ]
  }
];

app.get('/api/accounts', (req, res) => {
  res.json(bankingData);
});

app.listen(port, () => {
  console.log(`Banking API server running on http://localhost:${port}`);
});
