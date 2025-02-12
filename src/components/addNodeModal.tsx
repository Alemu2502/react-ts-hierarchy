import React, { useEffect } from "react";
import { Modal, Button, Group, TextInput, Textarea } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nodeSchema } from "./nodeSchema.ts";
import { createNodeAsync, fetchNodesAsync } from "../utils/api.tsx";
import { HierarchyNode, NodeType } from "../types.ts";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { setNotification } from "./ui/hierarchySlice.tsx";
import { z } from "zod";
import { generateUniqueIntId } from "../firebase.ts";
import { DetermineNodeType, FlattenNodes } from "./nodeType.ts";


// Type for form data inferred from schema
type NodeFormData = z.infer<typeof nodeSchema>;

export const AddNodeModal = (): JSX.Element => {
  const { parentId } = useParams<{ parentId?: string }>();  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<NodeFormData>({ resolver: zodResolver(nodeSchema) });


  useEffect(() => {
    const setNodeType = async () => {
      // Fetching nodes and cloning them for manipulation
      const fetchedNodes: HierarchyNode[] = await dispatch(fetchNodesAsync() as unknown as AnyAction).unwrap();
      const clonedNodes: HierarchyNode[] = structuredClone(fetchedNodes);

       // Flatten the node structure to easily find parent node
      const flattenedNodes = FlattenNodes(clonedNodes);
      const parentNode: HierarchyNode | null = parentId ? flattenedNodes.find((node) => node.id === Number(parentId)) ?? null : null;
    const nodeType: NodeType = parentNode ? DetermineNodeType(parentNode.type as NodeType) : "root";

      setValue("type", nodeType); 
      setValue("parentId", parentId ? Number(parentId) : null);
    };

    setNodeType(); // Trigger setting node type and parent ID
  }, [parentId, setValue, dispatch]); // Dependencies to refetch if parentId changes


  const onSubmit = async (data: NodeFormData): Promise<void> => {
    try {
      // Generate unique Integer ID for new node
      const newId = await generateUniqueIntId();
      const newNode: HierarchyNode = {
        id: newId,
        name: data.name,
        description: data.description || "",
        type: data.type,
        parentId: data.parentId ?? null,
      };
       // Dispatch action to create new node in the backend
      await dispatch(createNodeAsync(newNode) as unknown as AnyAction).unwrap();
      dispatch(setNotification({ message: `${data.name} created successfully!`, type: "success" }));
      navigate("/");
    } catch (error) {
      console.error("Error adding node:", error);
      dispatch(setNotification({ message: "Failed to create node. Please try again.", type: "error" }));
    }
  };

  return (
    <Modal opened onClose={() => navigate("/")} title="Add New Node">
      <form onSubmit={handleSubmit(onSubmit)} 
      className="space-y-4" 
      aria-labelledby="add-node-modal">
        <TextInput label="Name" 
        {...register("name")} 
        error={errors.name?.message} 
        placeholder="Enter node name"
         />
        <Textarea label="Description (Optional)"
         {...register("description")}
          error={errors.description?.message} 
          placeholder="Enter description"
           />
        <TextInput label="Type"
         {...register("type")} disabled />
        <TextInput label="Parent ID" 
        type="text" 
        {...register("parentId")} 
        error={errors.parentId?.message} disabled
         />
        <Group className="flex justify-end mt-4">
          <Button onClick={() => navigate("/")} 
            className="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
            >Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>Submit</Button>
        </Group>
      </form>
    </Modal>
  );
};
