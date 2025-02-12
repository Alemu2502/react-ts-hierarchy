import { NodeType, HierarchyNode } from "../types.ts";


// Function to determine the type of a node based on its parent type
export  const DetermineNodeType = (parentType: NodeType): NodeType => {
    switch (parentType) {
      case "root":
        return "institute";
      case "institute":
        return "school";
      case "school":
        return "department";
      case "department":
        return "teacher";
      default:
        return "root"; // Default fallback
    }
  };

  // Function to flatten a hierarchical structure of nodes into a list
  export const FlattenNodes = (nodes: HierarchyNode[]): HierarchyNode[] => {
    const flattened: HierarchyNode[] = [];
    const flatten = (node: HierarchyNode) => {
      flattened.push(node);
      if (node.children) {
        Object.values(node.children).forEach(flatten);
      }
    };
    nodes.forEach(flatten);
    return flattened;
  };