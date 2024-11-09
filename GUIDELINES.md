# Expense Tracker Guidelines

## Environment Setup

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── charts/        # Chart components
│   ├── layout/        # Layout components
│   ├── petty-cash/    # Petty cash specific components
│   └── transactions/  # Transaction related components
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── lib/               # Data access layer
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Component Guidelines

1. Keep components small and focused
2. Use TypeScript for type safety
3. Implement proper error handling
4. Use React Query for data fetching
5. Follow the container/presenter pattern
6. Use Ant Design components as base
7. Implement responsive design

## Data Access Layer

The data access layer is in `src/lib/`:

- `supabase.ts`: Main Supabase client configuration
- `supabase-v2.ts`: Extended Supabase client with typed APIs

### Usage Example:

```typescript
import { supabase } from '../lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('table_name')
  .select('*');

// Handle error
if (error) {
  throw error;
}
```

## Authentication Flow

1. Users can sign up with email/password
2. Email verification required
3. Role-based access control
4. Protected routes using AuthProvider

## Available Roles

1. Admin: Full system access
2. Manager: Department management
3. User: Basic access
4. Custodian: Petty cash management

## Components Documentation

### Layout Components

- `Layout.tsx`: Main application layout
- `Header.tsx`: Application header
- `MobileLayout.tsx`: Mobile-specific layout

### Transaction Components

- `TransactionForm.tsx`: Form for creating/editing transactions
- `TransactionList.tsx`: List/table of transactions
- `TransactionSummary.tsx`: Transaction statistics

### Petty Cash Components

- `FundList.tsx`: List of petty cash funds
- `TransactionForm.tsx`: Petty cash transaction form
- `ReconciliationForm.tsx`: Fund reconciliation form

### Chart Components

- `ExpensesByCategory.tsx`: Pie chart for expenses
- `MonthlyExpenses.tsx`: Line chart for monthly trends

## Pages Documentation

### Main Pages

- `Dashboard.tsx`: Main dashboard with overview
- `Transactions.tsx`: Transaction management
- `Projects.tsx`: Project management
- `Settings.tsx`: Application settings

### Petty Cash Pages

- `PettyCash/Dashboard.tsx`: Petty cash overview
- `PettyCash/FundList.tsx`: Fund management
- `PettyCash/Transactions.tsx`: Petty cash transactions

## Error Handling

1. Use try-catch blocks
2. Implement error boundaries
3. Show user-friendly error messages
4. Log errors appropriately

## State Management

1. React Query for server state
2. Context for global state
3. Local state for component-specific data

## Deployment

1. Build the project: `npm run build`
2. Deploy to supported providers
3. Set environment variables
4. Configure authentication