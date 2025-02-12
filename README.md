# University Hierarchy of Wodia University

## **Overview**

This project is a Single Page Application (SPA) designed to manage and display a hierarchical structure of a university. The application allows CRUD operations for hierarchical positions, including the following:

- **University President** → Root
- **Institute** → Level 1
- **School** → Level 2
- **Department** → Level 3
- **Teacher** → Leaf Nodes

## **Features**

- **Dynamic Tree View**: Visualize the hierarchy in an expandable/collapsible tree structure.
- **CRUD Operations**:
  - Add, edit, or delete nodes in the hierarchy.
- **Interactive Forms**:
  - Create and update nodes with validation.
- **API Integration**:
  - Connect to REST APIs for data storage and retrieval.
- **Responsive UI/UX**:
  - Built with modern design principles.

---

## **Hierarchy Example**

```text
University President
├── Institute of IoT
│   ├── School of Computing
│   │   ├── Department of Computer Science
│   │   │   ├── Teacher A
│   │   │   └── Teacher B
│   │   ├── Department of Software Engineering
│   │       ├── Teacher C
│   │       └── Teacher D
│   ├── School of Electrical and Mechanical
│   │   ├── Department of Electrical eng.
│   │   │   ├── Teacher E
│   │   │   └── Teacher F
│   │   ├── Department of Mechanical eng
│   │       ├── Teacher G
│   │       └── Teacher H
│   ├── School of Civil
│       ├── Department of COTOM
│       │   ├── Teacher I
│       │   └── Teacher J
│       └── Department of Civil
│           ├── Teacher K
│           └── Teacher L
├── Institute of Social Science
│   ├── School of Humanities
│   │   ├── Department of History
│   │   │   ├── Teacher M
│   │   │   └── Teacher N
│   │   ├── Department of Literature
│   │       ├── Teacher O
│   │       └── Teacher P
│   ├── School of Behavioral Studies
│   │   ├── Department of Psychology
│   │   │   ├── Teacher Q
│   │   │   └── Teacher R
│   │   ├── Department of Sociology
│   │       ├── Teacher S
│   │       └── Teacher T
│   ├── School of Social Policy
│       ├── Department of Public Policy
│       │   ├── Teacher U
│       │   └── Teacher V
│       └── Department of Political Science
│           ├── Teacher W
│           └── Teacher X

```

---

## **Technical Requirements**

### **Frontend**

- **Framework**: React
- **UI Library**: Mantine or shadcn
- **Styles**: TailwindCSS
- **Forms**: React Hook Form with optional validation using Zod

### **Backend**

- **API**: REST API using Firebase Database REST API, Mockoon, or other mock APIs
- **HTTP Client**: Axios

### **State Management**

- **Redux Toolkit**: For managing the application state.

### **Utilities**

- **Lodash**: For data handling (e.g., tree structure).

---

## **Data Model**

| **Column**    | **Type** | **Description**                                                |
| ------------- | -------- | -------------------------------------------------------------- |
| `id`          | `int`    | Unique identifier for each position.                           |
| `name`        | `string` | Name of the position (e.g., "School of Computing").            |
| `description` | `string` | Details or information about the position.                     |
| `parentId`    | `int`    | ID of the parent position (null for the root position).        |
| `type`        | `string` | The type of position (e.g., "institute", "school", "teacher"). |

---

## **Installation**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd university-hierarchy-spa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

---

## **Usage**

### Add a Position

1. Click on a node in the hierarchy.
2. Click "Add" and fill in the form.
3. Submit to save the position.

### Edit a Position

1. Select a node in the hierarchy.
2. Click "Edit" and update the details.
3. Submit to save changes.

### Delete a Position

1. Select a node in the hierarchy.
2. Click "Delete" to remove the position and all its children.

---

## **Tree Rendering Logic**

```jsx
function renderTree(node, data) {
  const children = data.filter((item) => item.parentId === node.id);
  return (
    <ul key={node.id}>
      <li>
        {node.name} ({node.type})
      </li>
      {children.map((child) => renderTree(child, data))}
    </ul>
  );
}

// Example usage
const rootNode = data.find((item) => item.parentId === null);
const tree = renderTree(rootNode, data);
```

---

## **Features Roadmap**

- [x] Dynamic tree rendering.
- [x] CRUD operations for hierarchy nodes.
- [ ] Drag-and-drop for rearranging nodes.
- [ ] Search functionality to locate nodes quickly.

---

## **Contributing**

Feel free to fork the repository, create feature branches, and submit pull requests. Contributions are welcome!

---

---

## **Authors**

- @demeke-getaneh
- @Tesfa-michael
- @michaelwondemuu ([GitHub Profile](https://github.com/MichaelWondemuu))

---

## **License**

This project is open-source and available under the [MIT License](LICENSE).
