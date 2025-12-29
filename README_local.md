# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## 📥 Bulk Upload Features

### Student Management

- **Sample Excel Format**: Download a pre-formatted Excel template with all required columns
- **Required Columns**:
  - S.No.
  - Name of the Student
  - H.T.No. (Roll Number)
  - Branch (Department)
  - Section
  - Email
  - Mobile
  - Father Name
  - Father Mobile
- **Download Sample**: Click "📥 Download Sample Excel" button in Students page

### Faculty Management

- **Sample Excel Format**: Download a pre-formatted Excel template with all required columns
- **Required Columns**:
  - S.No
  - Employee Code
  - Employee Name
  - Department
  - Designation
  - Email
  - Mobile
- **Download Sample**: Click "📥 Download Sample Excel" button in Faculty page

### Dues Management (Bulk Upload)

- **Sample Excel Format**: Download a pre-formatted Excel template for bulk dues upload
- **Required Columns**:
  - personId (Student Roll Number or Faculty Employee Code)
  - personName (Name of the person)
  - personType (Must be "Student" or "Faculty")
  - department (Department name)
  - description (Due description)
  - amount (Numeric value, 0 for non-payable)
  - dueDate (Format: YYYY-MM-DD, e.g., 2025-12-31)
- **Optional Columns**:
  - category (Either "payable" or "non-payable", defaults to "payable")
  - link (Google Drive link or other URL)
- **Download Template**: Click "📥 Download Template" button in Add Due page (Bulk Upload section)

### How to Use Bulk Upload

1. Click "📥 Download Sample Excel" to get the template
2. Open the downloaded file in Excel/Sheets
3. Replace the sample data with your actual data
4. Keep the column headers exactly as they are
5. Save the file
6. Click "Add Students" or "Add Faculty" and upload your file
7. System will validate and import the data

### How to Use Bulk Dues Upload

1. Navigate to Add Due page (Operator dashboard)
2. Scroll to "Bulk Upload via Excel" section
3. Click "📥 Download Template" to get the sample file
4. Open the downloaded template in Excel/Sheets
5. Fill in the dues data:
   - Replace sample data with actual dues
   - Keep column headers exactly as they are
   - Use YYYY-MM-DD format for dates
   - Use "Student" or "Faculty" for personType
   - Use "payable" or "non-payable" for category
6. Save the file
7. Click "Choose File" and select your filled Excel file
8. Click "Upload Bulk Dues"
9. System will validate and show results:
   - Success: "X dues added successfully"
   - Partial success: Shows which rows succeeded and which failed
   - Errors: Clear messages about what went wrong

**Common Issues:**

- "Student/Faculty not found": Check personId matches database records
- "Invalid date format": Use YYYY-MM-DD format only
- "Invalid personType": Must be exactly "Student" or "Faculty" (case-sensitive)
- "Missing required columns": Download fresh template and don't modify headers
