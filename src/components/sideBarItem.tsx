import React, { useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Box, Group, Text, Tooltip, ActionIcon } from '@mantine/core';
import { FaCaretDown, FaCaretRight, FaBuilding, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setShowActions, selectShowActions } from './ui/hierarchySlice.tsx';
import { SidebarItemProps, HierarchyNode, Item } from '../types.ts';

const ITEM_TYPE = 'NODE';

export const SidebarItem = ({
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
}: SidebarItemProps & { item: HierarchyNode }): JSX.Element => {
  const dispatch = useDispatch();
  const showActions = useSelector(selectShowActions);
  const navigate = useNavigate();

  // Set up drag and drop
  const [{ isDragging }, dragPreview] = useDrag({
    type: ITEM_TYPE,
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: useCallback((draggedItem: { id: number }) => {
      if (draggedItem.id !== item.id) {
        moveNode(draggedItem.id, item.id);
      }
    }, [item.id, moveNode]),
  });

  // Handle node click to select and toggle actions
  const handleNodeClick = (): void => {
    onNodeSelect(item);
    dispatch(setShowActions({ id: item.id, value: !showActions[item.id] }));
  };

  // Handle add click to navigate to add node
  const handleAddClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onAdd(item.id);
    navigate(`/add-node/${item.id}`);
  };

  // Handle edit click to navigate to edit node
  const handleEditClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onEdit(item);
    navigate(`/edit-node/${item.id}`);
  };

  const Icon = FaBuilding;
  const isCollapsed = collapsed[item.id];

  return (
    <Box
      ref={(node) => dragPreview(drop(node))}
      className={`cursor-move p-2 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      key={item.id}
    >
      <Group onClick={handleNodeClick} className="flex justify-between cursor-pointer">
        <Group>
          <Icon />
          <Text>{item.name}</Text>
        </Group>
        {(item.children as Item[]).length > 0 && (
          <button
            aria-expanded={!isCollapsed}
            onClick={() => toggleCollapse(item.id)}
            className="cursor-pointer"
          >
            {isCollapsed ? <FaCaretRight /> : <FaCaretDown />}
          </button>
        )}
      </Group>
      {(item.children as Item[]).length > 0 && !isCollapsed && (
        <div className="pl-5">
          {item.children && renderItems(item.children as Item[])}
        </div>
      )}
      {showActions[item.id] && selectedNode?.id === item.id && (
        <Group className="mt-1 flex justify-end -space-x-2">
          {/* Only render "Add" button if the node type is not "teacher" */}
          {item.type !== 'teacher' && (
            <Tooltip label="Add" withArrow>
              <ActionIcon
                aria-label="Add node"
                className="bg-blue-400 text-white p-1 hover:bg-blue-400 focus:bg-blue-400"
                onClick={handleAddClick}
              >
                <FaPlus />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Edit" withArrow>
            <ActionIcon
              aria-label="Edit node"
              className="bg-green-400 text-white p-1 hover:bg-green-400 focus:bg-green-400"
              onClick={handleEditClick}
            >
              <FaEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete" withArrow>
            <ActionIcon
              aria-label="Delete node"
              className="bg-red-400 text-white p-1 hover:bg-red-400 focus:bg-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <FaTrash />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </Box>
  );
};
