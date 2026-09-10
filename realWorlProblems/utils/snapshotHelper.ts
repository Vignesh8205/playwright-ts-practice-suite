/**
 * Formats the currency exactly as the UI does.
 */
const formatCurrency = (amount: number) => {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
};

/**
 * Recursively formats banking nodes into readable strings for the snapshot.
 */
function formatNode(node: any, depth: number = 0): string[] {
  const indent = '  '.repeat(depth + 2);
  const formattedAmount = formatCurrency(node.amount);
  let lines = [`${indent}- ${node.name} [${node.type}]: ${formattedAmount}`];
  
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      lines.push(...formatNode(child, depth + 1));
    }
  }
  return lines;
}

/**
 * Reusable method to generate a structured text snapshot from the API response.
 * It applies the exact UI formatting/rounding logic to the raw data.
 */
export function generateSnapshotFromApi(apiResponse: any[], url: string, title: string): string {
  const lines = [
    `ui_snapshot:`,
    `  url: ${url}`,
    `  title: ${title}`,
    ``,
    `elements:`,
    `  banking_data:`
  ];

  if (!apiResponse || apiResponse.length === 0) {
    lines.push(`    - (No Data)`);
  } else {
    for (const rootNode of apiResponse) {
      lines.push(...formatNode(rootNode, 0));
    }
  }

  return lines.join('\n');
}

