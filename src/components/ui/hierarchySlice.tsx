import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store.tsx';
import { HierarchyNode, Notification, HierarchyState } from '../../types.ts';
import { fetchNodesAsync, createNodeAsync, updateNodeAsync, deleteNodeAsync, moveNodeInDatabaseAsync, getNodeByIdAsync } from '../../utils/api.tsx';

// Initial state for the hierarchy slice
const initialState: HierarchyState = {
  nodes: [],
  selectedNode: null,
  collapsed: {},
  searchQuery: '',
  loading: false,
  notification: null,
  error: null,
  showActions: {},
  showSidebar: false,
};

// Create a slice for the hierarchy state
const hierarchySlice = createSlice({
  name: 'hierarchy',
  initialState,
  reducers: {
     // Sets the list of nodes
    setNodes(state, action: PayloadAction<HierarchyNode[]>) {
      state.nodes = action.payload;
    },
    // Sets the selected node
    setSelectedNode(state, action: PayloadAction<HierarchyNode | null>) {
      state.selectedNode = action.payload; 
    },
    // Toggles the collapse state of a node
    setCollapsed(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.collapsed[id] = !state.collapsed[id]; 
    },
     // Sets the search query
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    // Sets whether actions are shown for a node
    setShowActions(state, action: PayloadAction<{ id: number; value: boolean }>) {
      const { id, value } = action.payload;
      state.showActions[id] = value; 
    },
     // Sets the loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
     // Sets a notification
    setNotification(state, action: PayloadAction<Notification | null>) {
      state.notification = action.payload;
    },
     // Sets an error message
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setShowSidebar(state, action: PayloadAction<boolean>) {
      state.showSidebar = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNodesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Sets the fetched nodes
      .addCase(fetchNodesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload;
      })
      // Sets an error message on failure
      .addCase(fetchNodesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch nodes';
      })
      .addCase(createNodeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Adds the newly created node
      .addCase(createNodeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes.push(action.payload);
      })
      // Sets an error message on failure
      .addCase(createNodeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create node';
      })
      .addCase(updateNodeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Updates the node
      .addCase(updateNodeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.nodes.findIndex(node => node.id === action.payload.id);
        if (index !== -1) {
          state.nodes[index] = action.payload;
        }
      })
      // Sets an error message on failure
      .addCase(updateNodeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update node';
      })
      .addCase(deleteNodeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Removes the deleted node
      .addCase(deleteNodeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = state.nodes.filter(node => node.id !== action.payload);
      })
      // Sets an error message on failure
      .addCase(deleteNodeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete node';
      })
      .addCase(moveNodeInDatabaseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Updates nodes after moving
      .addCase(moveNodeInDatabaseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload;
      })
       // Sets an error message on failure
      .addCase(moveNodeInDatabaseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to move node';
      })
      .addCase(getNodeByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Sets the fetched node as selected
      .addCase(getNodeByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        const node = action.payload;
        state.selectedNode = node;
      })
      // Sets an error message on failure
      .addCase(getNodeByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch node by ID';
      });
  },
});

export const {
  setNodes,
  setSelectedNode,
  setCollapsed,
  setSearchQuery,
  setShowActions,
  setLoading,
  setNotification,
  setError,
  setShowSidebar
} = hierarchySlice.actions;

// Selectors to access specific parts of the state
export const selectNodes = (state: RootState) => state.hierarchy.nodes;
export const selectSelectedNode = (state: RootState) => state.hierarchy.selectedNode;
export const selectSearchQuery = (state: RootState) => state.hierarchy.searchQuery;
export const selectCollapsed = (state: RootState) => state.hierarchy.collapsed;
export const selectShowActions = (state: RootState) => state.hierarchy.showActions;


export default hierarchySlice.reducer;
