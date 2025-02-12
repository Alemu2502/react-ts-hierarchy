export type HierarchyNode = {
  id: number;
  name: string;
  description: string;
  type: string;
  parentId?: number | null;
  children?: { [key: number]: HierarchyNode } | Item[];
};


export interface Item extends HierarchyNode {
  icon?: React.ElementType;
}

export interface DroppableContainerProps {
  items: Item[];
  renderItems: (items: Item[]) => JSX.Element[];
  targetId: number | null; // Allow `null` for root
  moveNode: (draggedId: number, targetId: number) => void;
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export interface HierarchyState {
  nodes: HierarchyNode[];
  selectedNode: HierarchyNode | null;
  collapsed: Record<number, boolean>;
  searchQuery: string;
  loading: boolean;
  notification?: Notification | null;
  error?: string | null;
  showActions: Record<number, boolean>;
  showSidebar: boolean;
}

export interface AppSidebarProps {
  onNodeSelect: (node: HierarchyNode) => void;
  selectedNode: HierarchyNode | null;
  onEdit: (node: HierarchyNode) => void;
  onDelete: (id: number) => void;
  onAdd: (parentId: number | null) => void;
  moveNode: (draggedId: number, targetId: number) => void;
  nodes: Item[]; 
}

export interface SidebarItemProps {
  item: Item;
  onNodeSelect: (node: HierarchyNode) => void;
  selectedNode: HierarchyNode | null;
  toggleCollapse: (id: number) => void;
  collapsed: Record<number, boolean>;
  renderItems: (items: Item[]) => JSX.Element[]; 
  onEdit: (node: HierarchyNode) => void;
  onDelete: (id: number) => void;
  onAdd: (parentId: number) => void;
  moveNode: (draggedId: number, targetId: number) => void;
}

export type NodeType = "root" | "institute" | "school" | "department" | "teacher";
