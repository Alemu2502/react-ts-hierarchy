import { DroppableContainerProps, SidebarItemProps } from "../types.ts";
import {useDrag, useDrop } from 'react-dnd';
import { SidebarItem } from './sideBarItem.tsx'; 


// DraggableItem component for rendering each item with drag-and-drop
export const DraggableItem = ({
  item,
  onNodeSelect,
  selectedNode,
  toggleCollapse,
  collapsed,
  renderItems,
  onEdit,
  onDelete,
  onAdd,
  moveNode,
}:
SidebarItemProps
) => {
  const [, dragRef] = useDrag({
    type: 'SIDEBAR_ITEM',
    item: { id: item.id, parentId: item.parentId },
  });

  const [, dropRef] = useDrop({
    accept: 'SIDEBAR_ITEM',
    drop: (draggedItem: { id: number; parentId: number }) => {
      if (draggedItem.id !== item.id) {
        moveNode(draggedItem.id, item.id);
        return; // Prevent further calls
      }
    },
  });

  return (
    <div ref={(node) => dragRef(dropRef(node))}>
      <SidebarItem
        item={item}
        onNodeSelect={onNodeSelect}
        selectedNode={selectedNode}
        toggleCollapse={toggleCollapse}
        collapsed={collapsed}
        renderItems={renderItems}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onAdd}
        moveNode={moveNode}
      />
    </div>
  );
};

// DroppableContainer to render the hierarchical structure for the drag-and-drop feature
export const DroppableContainer = ({
  items,
  renderItems,
  targetId,
  moveNode,
}:
  DroppableContainerProps
) => {
  const [, dropRef] = useDrop({
    accept: 'SIDEBAR_ITEM',
    drop: (draggedItem: { id: number; parentId: number }) => {
      if (targetId !== null && draggedItem.id !== targetId) {
        moveNodeOnce(draggedItem.id, targetId, moveNode); // Ensures only one call
        return { id: targetId }; // Prevent further processing
      }
    },
  });

  return <div ref={dropRef}>{renderItems(items)}</div>;
};

// Wrapper to ensure `moveNode` is called only once
export const moveNodeOnce = (() => {
  let called = false;
  return (draggedId: number, targetId: number, moveNode: (draggedId: number, targetId: number) => void) => {
    if (!called) {
      moveNode(draggedId, targetId);
      called = true;
      setTimeout(() => (called = false), 0); // Reset for the next move
    }
  };
})();
