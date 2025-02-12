import React, { useCallback, useMemo } from 'react';
import { AppSidebarProps, Item } from '../types.ts';
import { Navbar, ScrollArea, Box, Input, Button } from '@mantine/core';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, setCollapsed, selectSearchQuery, selectCollapsed } from './ui/hierarchySlice.tsx';
import { moveNodeOnce, DroppableContainer, DraggableItem } from './dragAndDrop.tsx';
import { organizeItems, flattenItems } from './search.tsx';

// Main Sidebar component
export function AppSidebar({
  onNodeSelect,
  selectedNode,
  onEdit,
  onDelete,
  onAdd,
  moveNode,
  nodes,
}: AppSidebarProps) {
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const collapsed = useSelector(selectCollapsed);

  const handleToggleCollapse = useCallback((id: number) => {
    dispatch(setCollapsed(id));
  }, [dispatch]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(event.target.value));
  }, [dispatch]);

  // Flatten the hierarchical structure to make filtering easier
  const flatItems = useMemo(() => flattenItems(nodes), [nodes]);

  // Find all nodes that match the search query and their ancestors
  const filteredItems = useMemo(() => {
    return flatItems.filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flatItems, searchQuery]);

  // Find all the parents of the filtered items and include them in the result
  const filteredItemsWithParents = useMemo(() => {
    const filteredItemsWithParents = new Set<number>();
    const itemsToInclude = new Set<number>();
    filteredItems.forEach((item) => {
      itemsToInclude.add(item.id);
      let parent = item.parentId;
      while (parent !== null && parent !== undefined) {
        const currentParent = parent;
        if (typeof currentParent === 'number') {
          filteredItemsWithParents.add(currentParent);
        }
        const parentItem = flatItems.find((i) => i.id === currentParent);
        parent = parentItem ? parentItem.parentId : null;
      }
    });

    // Include all the children of the filtered items
    const includeChildren = (item: Item) => {
      if (Array.isArray(item.children)) {
        item.children.forEach((child) => {
          itemsToInclude.add(child.id);
          includeChildren(child);
        });
      }
    };
    filteredItems.forEach(includeChildren);
    return flatItems.filter(
      (item) => itemsToInclude.has(item.id) || filteredItemsWithParents.has(item.id)
    );
  }, [filteredItems, flatItems]);

  // Organize items back into their hierarchical structure after filtering
  const organizedItems = useMemo(() => organizeItems(filteredItemsWithParents), [filteredItemsWithParents]);

  // Recursive renderItems function to display each item and its children
  const renderItems: (items: Item[]) => JSX.Element[] = useCallback((items: Item[]) =>
    items.map((item) => (
      <DroppableContainer
        key={item.id}
        items={[item]}
        renderItems={(childItems) =>
          childItems.map((child) => (
            <DraggableItem
              key={child.id}
              item={child}
              onNodeSelect={onNodeSelect}
              selectedNode={selectedNode}
              toggleCollapse={handleToggleCollapse}
              collapsed={collapsed}
              renderItems={renderItems}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              moveNode={(draggedId: number, targetId: number) => {
                moveNodeOnce(draggedId, targetId, moveNode);
              }}
            />
          ))
        }
        targetId={item.id}
        moveNode={moveNode}
      />
    )), [collapsed, handleToggleCollapse, onAdd, onDelete, onEdit, onNodeSelect, selectedNode, moveNode]);

  return (
    <Navbar className="w-[400px] h-screen p-2">
      <ScrollArea>
        <Box className="p-2 flex items-center">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mr-2 w-full"
          />
          <Button>
            <FaSearch />
          </Button>
        </Box>
        <DroppableContainer
          items={organizedItems}
          renderItems={renderItems}
          targetId={null} // Root node
          moveNode={moveNode}
        />
      </ScrollArea>
    </Navbar>
  );
}
