import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { HierarchyNode } from '../types.ts';
import { AppDispatch } from '../components/ui/store.tsx';

const BASE_URL = process.env.REACT_APP_DATABASE_URL;

// Define async thunk for fetching nodes
export const fetchNodesAsync = createAsyncThunk(
  'hierarchy/fetchNodes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/nodes.json`);
      const nodes = response.data ? Object.values(response.data) : [];
      return nodes as HierarchyNode[];
    } catch (error) {
      return rejectWithValue('Failed to fetch nodes');
    }
  }
);

// Define async thunk for creating a node
export const createNodeAsync = createAsyncThunk(
  'hierarchy/createNode',
  async (node: HierarchyNode, { rejectWithValue }) => {
    try {
      const fetchedNodes = await axios.get(`${BASE_URL}/nodes.json`);
      const existingNodes = fetchedNodes.data ? Object.values(fetchedNodes.data) : [];

      if (node.parentId !== null && node.parentId !== undefined) {
        const parentNode = findNodeById(existingNodes, Number(node.parentId));
        if (!parentNode) {
          throw new Error(`Parent node not found for parentId: ${node.parentId}`);
        }
        parentNode.children = parentNode.children || {};
        parentNode.children[node.id] = {
          id: node.id,
          name: node.name,
          description: node.description,
          parentId: node.parentId,
          type: node.type,
          children: node.children || {}
        };
        findAndUpdateNodeById(existingNodes, parentNode.id, parentNode);
      } else {
        // Explicitly set parentId to null for root nodes
        existingNodes[node.id] = {
          ...node,
          parentId: null,
          children: node.children || {}
        };
      }
      await axios.put(`${BASE_URL}/nodes.json`, existingNodes);
      return node;
    } catch (error) {
      return rejectWithValue('Failed to create node');
    }
  }
);

// Define async thunk for updating a node
export const updateNodeAsync = createAsyncThunk(
  'hierarchy/updateNode',
  async (updatedNode: HierarchyNode, { rejectWithValue }) => {
    try {
      const fetchedNodes = await axios.get(`${BASE_URL}/nodes.json`);
      const existingNodes = fetchedNodes.data ? Object.values(fetchedNodes.data) : [];
      const existingNode = findNodeById(existingNodes, updatedNode.id);

      if (!existingNode) {
        throw new Error(`Node to update not found: ${updatedNode.id}`);
      }

      const nodeToSave = {
        ...existingNode,
        ...updatedNode,
        children: existingNode.children || {},
      };

      if (nodeToSave.type === 'root') {
        if (nodeToSave.parentId !== undefined) { 
        delete nodeToSave.parentId;
       } 
      }

      findAndUpdateNodeById(existingNodes, updatedNode.id, nodeToSave);
      await axios.put(`${BASE_URL}/nodes.json`, existingNodes);
      return nodeToSave;
    } catch (error) {
      return rejectWithValue('Failed to update node');
    }
  }
);

// Define async thunk for deleting a node
export const deleteNodeAsync = createAsyncThunk(
  'hierarchy/deleteNode',
  async (id: number, { rejectWithValue }) => {
    try {
      const allNodesResponse = await axios.get(`${BASE_URL}/nodes.json`);
      let allNodes = allNodesResponse.data;

      const findAndDeleteNode = (nodes: any, nodeId: number): boolean => {
        for (const key in nodes) {
          if (nodes[key].id === nodeId) {
            delete nodes[key];
            return true;
          }
          if (nodes[key].children) {
            const deleted = findAndDeleteNode(nodes[key].children, nodeId);
            if (deleted) return true;
          }
        }
        return false;
      };

      const nodeDeleted = findAndDeleteNode(allNodes, id);
      if (!nodeDeleted) {
        throw new Error(`Node with ID ${id} not found in the database structure.`);
      }

      await axios.put(`${BASE_URL}/nodes.json`, allNodes);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete node');
    }
  }
);

export const getNodeByIdAsync = createAsyncThunk(
  'nodes/getNodeById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/nodes.json`);
      const data = response.data;
      if (!data) {
        console.error('No data found in the API response.');
        return rejectWithValue('No data found.');
      }
      const node = findNodeById(Object.values(data), id);
      if (!node) {
        console.error(`Node with ID ${id} not found.`);
        return rejectWithValue(`Node with ID ${id} not found.`);
      }
      node.parentId = node.parentId ?? null;
      return node;
    } catch (error) {
      console.error('Error fetching node data:', error);
      return rejectWithValue(error);
    }
  }
);


export const findAndUpdateNodeById = (nodes: any, nodeId: number, updatedNode: any) => {
  const traverse = (node: any) => {
    if (node.id === nodeId) {
      Object.assign(node, updatedNode);
      return true;
    }
    if (node.children) {
      const childrenArray = Object.values(node.children);
      for (let i = 0; i < childrenArray.length; i++) {
        if (traverse(childrenArray[i])) {
          return true;
        }
      }
    }
    return false;
  };
  return Object.values(nodes).some(traverse);
};

export const updateNodePosition = (nodes: HierarchyNode[] | undefined, updatedNode: HierarchyNode): HierarchyNode[] => {
  if (!Array.isArray(nodes)) {
    return []; // Return an empty array if nodes is not an array
  }

  return nodes.map(node => {
    if (node.id === updatedNode.id) {
      return {
        ...node,
        name: updatedNode.name,
        description: updatedNode.description,
      };
    }
    if (node.children) {
      node.children = updateNodePosition(node.children as HierarchyNode[], updatedNode);
    }
    return node;
  });
};


export const removeNodeAndChildren = (nodes: HierarchyNode[] | { [key: number]: HierarchyNode }, nodeId: number): HierarchyNode[] => {
  return Object.values(nodes).reduce((acc: HierarchyNode[], node) => {
    if (node.id === nodeId) {
      if (node.children && Array.isArray(node.children) && node.children.length === 0) {
        return acc; // skip this node because it has no children
      }
    }

    // If node has children, recursively process them
    if (node.children) {
      // We check if children is an array before calling removeNodeAndChildren recursively
      if (Array.isArray(node.children)) {
        node.children = removeNodeAndChildren(node.children, nodeId);
      } else {
        node.children = removeNodeAndChildren(Object.values(node.children) as HierarchyNode[], nodeId);
      }
    }

    // Add the node to the accumulator if it's not the one to be removed
    if (node.id !== nodeId || (node.children && Array.isArray(node.children) && node.children.length > 0)) {
      acc.push(node);
    }

    return acc;
  }, []);
};


export const findNodeById = (nodes: any[], id: number): HierarchyNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const childNodes = Array.isArray(node.children)
        ? node.children
        : Object.values(node.children);
      const result = findNodeById(childNodes, id);
      if (result) return result;
    }
  }
  return undefined;
};


export const detachNodeFromParent = (nodes: any, nodeId: number): HierarchyNode | null => {
  let detachedNode: HierarchyNode | null = null;

  const traverse = (node: any) => {
    if (node.children) {
      if (Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          if ((node.children[i] as HierarchyNode).id === nodeId) {
            detachedNode = { ...node.children[i] }; // Create a copy of the node to avoid mutating the original
            node.children.splice(i, 1); // Remove the node from its previous parent (array)
            return true;
          }
          if (traverse(node.children[i])) {
            return true;
          }
        }
      } else if (typeof node.children === 'object') {
        const childrenArray = Object.keys(node.children).map(key => node.children[key]);
        for (let i = 0; i < childrenArray.length; i++) {
          if ((childrenArray[i] as HierarchyNode).id === nodeId) {
            detachedNode = { ...childrenArray[i] }; // Create a copy of the node to avoid mutating the original
            if (detachedNode) {
              delete node.children[detachedNode.id]; // Delete the node from its previous parent (object)
            }            
            return true;
          }
          if (traverse(childrenArray[i])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  Object.values(nodes).some(traverse);
  if (!detachedNode) {
    console.error(`Node with ID ${nodeId} not found in any parent.`);
  }
  return detachedNode;
};

 // Helper function to update parentId
const updateSubtree = (node: HierarchyNode, newParentId: number | null) => {
  node.parentId = newParentId;

  // Recursively update children if they exist
  if (node.children) {
    if (Array.isArray(node.children)) {
      // If children are in an array, update them
      node.children.forEach((child) => updateSubtree(child, node.id));
    } else {
      // If children are in an object, convert to array and update them
      Object.values(node.children).forEach((child) => updateSubtree(child, node.id));
    }
  }
};

// Thunk to move a node in the database
export const moveNodeInDatabaseAsync = createAsyncThunk<HierarchyNode[], { draggedNodeId: number; targetParentId: number }, { dispatch: AppDispatch }>(
  'nodes/moveNodeInDatabase',
  async ({ draggedNodeId, targetParentId }, { dispatch }) => {
    try {
      const fetchedNodes = await dispatch(fetchNodesAsync()).unwrap();

      const nodesCopy: HierarchyNode[] = structuredClone(fetchedNodes); // we should use  structuredClone for deep copying

      const detachedNode = detachNodeFromParent(nodesCopy, draggedNodeId);
      if (!detachedNode) {
        throw new Error('Dragged node not found in its old parent');
      }

      const targetNode = findNodeById(nodesCopy, targetParentId);
      if (!targetNode && targetParentId !== null) {
        throw new Error(`Target parent node with ID ${targetParentId} not found`);
      }

      // Update the parentId 
      updateSubtree(detachedNode, targetParentId);
      if (targetParentId !== null) {
        if (!targetNode!.children) {
          targetNode!.children = {};
        }
        targetNode!.children[detachedNode.id] = detachedNode;
      } else {
        nodesCopy[detachedNode.id] = detachedNode;
      }

      await axios.put(`${BASE_URL}/nodes.json`, nodesCopy);
      
      return nodesCopy; // Return the updated nodes
    } catch (error) {
      console.error('Error moving node:', error);
      throw error;
    }
  }
);
