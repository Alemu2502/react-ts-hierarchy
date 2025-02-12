import React, { useCallback, useEffect } from 'react';
import { Modal, Button, Group, TextInput, Textarea } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { nodeSchema } from './nodeSchema.ts';
import { z } from 'zod';
import { updateNodeAsync, fetchNodesAsync, getNodeByIdAsync } from '../utils/api.tsx';
import { HierarchyNode, NodeType } from '../types.ts';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setNodes, setLoading, setError, setNotification } from './ui/hierarchySlice.tsx';
import { RootState, AppDispatch } from './ui/store.tsx';
import { DetermineNodeType, FlattenNodes } from './nodeType.ts';


// Type for form data inferred from schema
type NodeFormData = z.infer<typeof nodeSchema>;

export const EditNodeModal = (): JSX.Element => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { handleSubmit, setValue, register, watch, formState: { errors } } = useForm<NodeFormData>({
    resolver: zodResolver(nodeSchema),
  });

  const isLoading = useSelector((state: RootState) => state.hierarchy.loading);
  const errorMessage = useSelector((state: RootState) => state.hierarchy.error);

  const fetchNode = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      // Fetch the node using the dispatched action and unwrap the result
      const currentNode: HierarchyNode = await dispatch(getNodeByIdAsync(Number(nodeId))).unwrap();
      if (currentNode) {
        setValue('name', currentNode.name);
        setValue('description', currentNode.description || '');
        setValue('type', currentNode.type as NodeType);

        const fetchedNodes: HierarchyNode[] = await dispatch(fetchNodesAsync()).unwrap();
        const clonedNodes: HierarchyNode[] = structuredClone(fetchedNodes);
        const flattenedNodes = FlattenNodes(clonedNodes);

         // Find parent node from flattened nodes
        const parentNode: HierarchyNode | null = currentNode.parentId ? flattenedNodes.find((node) => node.id === currentNode.parentId) ?? null : null;
        const nodeType: NodeType = parentNode ? DetermineNodeType(parentNode.type as NodeType) : "root";
        setValue("type", nodeType);

         // Handle root node or undefined parentId case
        if (currentNode.type === 'root' || currentNode.parentId === undefined || currentNode.parentId === null) {
          setValue('parentId', null); 
        } else {
          setValue('parentId', currentNode.parentId);
        }
      } else {
        console.error('Fetched node is null or undefined');
      }
      dispatch(setLoading(false));
    } catch (error) {
      console.error('Error fetching node data:', error);
      dispatch(setError('Failed to fetch node data.'));
      dispatch(setLoading(false));
    }
  }, [nodeId, setValue, dispatch]);

  useEffect(() => {
    fetchNode();
  }, [fetchNode]);

  const onSubmit = async (data: NodeFormData): Promise<void> => {
    try {
      const updatedNode: HierarchyNode = {
        id: Number(nodeId),
        name: data.name,
        description: data.description || '',
        type: data.type,
        parentId: data.type === 'root' ? null : (data.parentId !== undefined && data.parentId !== null ? Number(data.parentId) : null),
      };

      await dispatch(updateNodeAsync(updatedNode)).unwrap();
      const fetchedNodes = await dispatch(fetchNodesAsync()).unwrap();
      dispatch(setNodes(fetchedNodes));
      dispatch(setNotification({ message: `${data.name} updated successfully!`, type: 'success' }));
      navigate('/');
    } catch (error) {
      console.error('Error updating node', error);
      dispatch(setError('Failed to update node. Please try again.'));
      dispatch(setNotification({ message: 'Failed to update node. Please try again.', type: 'error' }));
    }
  };

  return (
    <Modal opened onClose={() => navigate('/')} title="Edit Node">
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            label="Name"
            {...register('name')}
            error={errors.name?.message}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          <Textarea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            aria-invalid={errors.description ? 'true' : 'false'}
          />
          <TextInput
            label="Type"
            disabled
            value={watch('type')}
          />
          <TextInput
            label="Parent ID"
            type="text"
            {...register('parentId')}
            error={errors.parentId?.message}
            value={watch('parentId') === null || watch('parentId') === undefined ? 'null' : String(watch('parentId'))} 
            disabled
            aria-disabled="true"
          />
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          <Group className="mt-4 flex justify-end">
            <Button
              className="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
              onClick={() => navigate("/")}
              aria-label="Cancel Node Update"
            >
              Cancel
            </Button>
            <Button type="submit" aria-label="Submit Node Update">Submit</Button>
          </Group>
        </form>
      )}
    </Modal>
  );
};
