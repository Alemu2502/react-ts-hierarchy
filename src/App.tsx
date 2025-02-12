import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './components/ui/store.tsx';
import { setNodes, setSelectedNode, setNotification, setShowSidebar } from './components/ui/hierarchySlice.tsx';
import { HierarchyNode, Item } from './types.ts';
import { Container, Text, Box, Header, AppShell } from '@mantine/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppSidebar } from './components/app-sidebar.tsx';
import { cloneDeep } from 'lodash';
import { NotificationComponent } from './components/notification.tsx';
import { FaBars } from 'react-icons/fa';
import { fetchNodesAsync, updateNodeAsync, deleteNodeAsync, findNodeById, moveNodeInDatabaseAsync, removeNodeAndChildren, updateNodePosition } from './utils/api.tsx';


export const App = (): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const nodes = useSelector((state: RootState) => state.hierarchy.nodes);
  const selectedNode = useSelector((state: RootState) => state.hierarchy.selectedNode);
   const showSidebar = useSelector((state: RootState) => state.hierarchy.showSidebar);

   const toggleSidebar = () => {
    dispatch(setShowSidebar(!showSidebar));
  };

  const parseNodes = useCallback((node: any, parentId: number | null = null): Item | null => {
    if (!node || typeof node !== 'object' || !node.id) return null;
    const children = node.children
      ? Object.values(node.children).map((childNode: any) => parseNodes(childNode, node.id)).filter(child => child !== null)
      : [];
    return { ...node, parentId, children } as Item;
  }, []);

  const loadNodes = useCallback(async () => {
    try {
      const fetchedNodes = await dispatch(fetchNodesAsync()).unwrap();
      if (fetchedNodes && typeof fetchedNodes === 'object') {
        const nodesArray = Object.values(fetchedNodes).filter(node => node !== null);
        const parsedNodes = nodesArray.map((node: any) => parseNodes(node)).filter(node => node !== null) as Item[];

        const rootNode = parsedNodes.find(node => node.type === 'root');
        if (rootNode) {
          dispatch(setNodes([rootNode]));
        } else {
          dispatch(setNodes([]));
        }
      } else {
        dispatch(setNodes([]));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch(setNotification({ message: 'Failed to load data', type: 'error' }));
    }
  }, [dispatch, parseNodes]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const handleNodeSelect = useCallback((node: HierarchyNode, event?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event && (event.target as HTMLElement)?.closest('.collapsible-icon')) {
      event.stopPropagation();
      return;
    }
  
    // Use TailwindCSS's responsive classes to handle mobile behavior
    const isMobile = document.documentElement.classList.contains('md:hidden'); // Check if mobile view is active
  
    if (isMobile) {
      if (event?.target === event?.currentTarget || event?.target instanceof HTMLDivElement) {
        setShowSidebar(false);
        dispatch(setSelectedNode(node));
      }
    } else {
      dispatch(setSelectedNode(node));
    }
  }, [dispatch]);

  const handleAddNode = useCallback(async (parentId: number | null) => {
    try {
      if (parentId === null) {
        const fetchedNodes = await dispatch(fetchNodesAsync()).unwrap();
        const nodesArray = Object.values(fetchedNodes).filter(node => node !== null) as Item[];
        const parsedNodes = nodesArray.map((node: any) => parseNodes(node)).filter(node => node !== null) as Item[];
        dispatch(setNodes(parsedNodes));
        dispatch(setNotification({ message: 'Root node added successfully', type: 'success' }));
        return;
      }
      
      const fetchedNodes = await dispatch(fetchNodesAsync()).unwrap();
      const nodesArray = Object.values(fetchedNodes).filter(node => node !== null) as Item[];
      const parsedNodes = nodesArray.map((node: any) => parseNodes(node)).filter(node => node !== null) as Item[];
      dispatch(setNodes(parsedNodes));
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  }, [dispatch, parseNodes]);

  const handleEditNode = useCallback(async (updatedNode: HierarchyNode) => {
    try {
      await dispatch(updateNodeAsync(updatedNode)).unwrap();
      
      const updatedNodes = updateNodePosition(cloneDeep(nodes), updatedNode);
      dispatch(setNodes(updatedNodes));
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  }, [dispatch, nodes]);

  const handleDeleteNode = useCallback(async (id: number) => {
    const nodeToDelete = findNodeById(nodes.map(node => parseNodes(node)).filter(node => node !== null) as Item[], id);
    if (!nodeToDelete) {
      alert('Node not found');
      return;
    }

    if (Array.isArray(nodeToDelete.children) && nodeToDelete.children.length > 0) {
      alert('Cannot delete parent node without deleting its children first');
      return;
    }
    
    const confirmDeletion = window.confirm(`Are you sure you want to delete  ${nodeToDelete.name}?`);
    if (!confirmDeletion) return;

    const clonedNodes = cloneDeep(nodes);

    const parsedClonedNodes = clonedNodes.map(node => parseNodes(node)).filter(node => node !== null) as Item[];
    const updatedNodes = removeNodeAndChildren(parsedClonedNodes, id);
    dispatch(setNodes(updatedNodes));

    try {
      await dispatch(deleteNodeAsync(id)).unwrap();
      dispatch(setNotification({ message: `${nodeToDelete.name} deleted successfully`, type: 'success' }));
    } catch (error) {
      console.error('Failed to delete node:', error);
      dispatch(setNotification({ message: 'Failed to delete node', type: 'error' }));
    }
  }, [dispatch, nodes, parseNodes]);


const handleMoveNode = useCallback(async (draggedId: number, targetId: number) => {
  try {
    if (draggedId === targetId) {
      console.error("Dragged node and target node are the same. Aborting.");
      dispatch(setNotification({ message: "Dragged node and target node cannot be the same.", type: "error" }));
      return;
    }

    const fetchedNodes = await dispatch(fetchNodesAsync()).unwrap();
    const parsedFetchedNodes = Object.values(fetchedNodes)
      .map((node: any) => parseNodes(node))
      .filter((node) => node !== null) as Item[];

    const targetNode = findNodeById(parsedFetchedNodes, targetId);
    const draggedNode = findNodeById(parsedFetchedNodes, draggedId);

    if (!targetNode) {
      console.error(`Target node not found for targetId: ${targetId}`);
      dispatch(setNotification({ message: "Target node not found.", type: "error" }));
      return;
    }

    if (!draggedNode) {
      console.error(`Dragged node not found for draggedId: ${draggedId}`);
      dispatch(setNotification({ message: "Dragged node not found.", type: "error" }));
      return;
    }

    // Restriction checks based on the target node type
    switch (targetNode.type) {
      case 'teacher':
        console.error("Cannot move to a leaf node (teacher).");
        dispatch(setNotification({ message: "Cannot move to a leaf node (teacher).", type: "error" }));
        return;
      case 'department':
        if (draggedNode.type !== 'teacher') {
          console.error("Only teachers can be moved to a department.");
          dispatch(setNotification({ message: "Only teachers can be moved to a department.", type: "error" }));
          return;
        }
        break;
      case 'school':
        if (draggedNode.type !== 'department') {
          console.error("Only departments can be moved to a school.");
          dispatch(setNotification({ message: "Only departments can be moved to a school.", type: "error" }));
          return;
        }
        break;
      case 'institute':
        if (draggedNode.type !== 'school') {
          console.error("Only schools can be moved to an institute.");
          dispatch(setNotification({ message: "Only schools can be moved to an institute.", type: "error" }));
          return;
        }
        break;
      case 'root':
        if (draggedNode.type !== 'institute') {
          console.error("Only institutes can be moved to the root.");
          dispatch(setNotification({ message: "Only institutes can be moved to the root.", type: "error" }));
          return;
        }
        break;
      default:
        break;
    }

    // Update the dragged node's parent ID
    draggedNode.parentId = targetId;

    // Move the node in the database
    await dispatch(moveNodeInDatabaseAsync({ draggedNodeId: draggedId, targetParentId: targetId })).unwrap();

    const updatedNodes = await dispatch(fetchNodesAsync()).unwrap();
    dispatch(setNodes(updatedNodes));

    dispatch(setNotification({ message: "Node moved successfully", type: "success" }));
  } catch (error) {
    console.error("Failed to move node:", error);
    dispatch(setNotification({ message: "Failed to move node", type: "error" }));
  }
}, [dispatch, parseNodes]);

  const rootNode = nodes.find((node: HierarchyNode) => node.parentId === null);

  return (
    <DndProvider backend={HTML5Backend}>
      <AppShell
        className="p-4 lg:block sm:block fixed"
        header={
          <Header height={70} className="h-[70px] p-4 bg-gray-100">
            <div className="flex items-center h-full">
              <button
                className="p-2 text-gray-700 mr-4"
                onClick={toggleSidebar}
              >
                <FaBars />
              </button>
              <Text className="font-bold text-xl">Woldia University</Text>
            </div>
          </Header>
        }
      >
        <Box className="flex h-full w-full">
          {showSidebar && (
            <Box className="w-80 flex-shrink-0 bg-white">
              <NotificationComponent />
              <AppSidebar
                onNodeSelect={(node: HierarchyNode) => handleNodeSelect(node)}
                selectedNode={selectedNode}
                onEdit={handleEditNode}
                onDelete={handleDeleteNode}
                onAdd={handleAddNode}
                moveNode={handleMoveNode}
                nodes={nodes.map((node: HierarchyNode) => parseNodes(node)).filter(node => node !== null) as Item[]}
              />
            </Box>
          )}
          <Container fluid className="flex-1 p-4 overflow-y-auto lg:ml-[2rem] lg:pl-8">
            {selectedNode ? (
              <Box>
                <Text className="text-lg font-medium">{selectedNode.name}</Text>
                <Text className="text-sm text-gray-500">{selectedNode.description}</Text>
              </Box>
            ) : rootNode && (
              <Box>
                <Text className="text-lg font-medium">{rootNode.name}</Text>
                <Text className="text-sm text-gray-500">{rootNode.description}</Text>
              </Box>
            )}
          </Container>
        </Box>
      </AppShell>
    </DndProvider>
  );
};
