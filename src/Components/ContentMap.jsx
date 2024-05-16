import { useEffect, useState, useContext } from "react";
import { dataContext } from './Main';
import { Text } from '@chakra-ui/react';
import ReactFlow, { Background, Controls, Position, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import './styles/ContentMap.css';
import CustomNode from './CustomNode';

// Define the custom node types, in this case, only 'custom' type is defined.
const nodeTypes = { custom: CustomNode };

const ContentMap = ({ selection, bundle, currentBundle }) => {
    // Using useContext to access shared data across the component tree.
    const data = useContext(dataContext);

    // State for managing nodes and edges of the React Flow.
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Default properties for nodes.
    const nodeDefaults = {
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
    };

    // Function to update nodes and edges based on the current selection.
    const updateNodes = () => {
        // Initialize arrays for new nodes and edges.
        let newNodes = [];
        let newEdges = [];
    
        // Check if there is a selected subproject and if data is available.
        if (selection.subProjectId != null && data.subProjects.length > 0) {
            // Adding project node.
            newNodes.push({
                id: `${data['projects'][0].id[0].value}`,
                data: { label: data['projects'][0].label[0].value },
                position: { x: 0, y: 0 },
                type: 'input',
                ...nodeDefaults,
            });
    
            // Adding subproject node.
            newNodes.push({
                id: data['subProjects'][0].nid,
                data: { label: data['subProjects'][0].title },
                position: { x: 200, y: 0 },
                type: 'default',
                ...nodeDefaults,
            });
    
            // Connecting project and subproject nodes.
            newEdges.push({
                source: `${data['projects'][0].id[0].value}`,
                target: data['subProjects'][0].nid,
                type: 'smoothstep',
            });
        }
    
        // Check if there is a selected file group and if data is available.
        if (selection.fileGroupId != null && data.fileGroups.length > 0) {
            // Adding file group node.
            newNodes.push({
                id: data['fileGroups'][0].nid_1,
                data: { label: data['fileGroups'][0].title },
                position: { x: 400, y: 0 },
                type: 'default',
                ...nodeDefaults,
            });
    
            // Connecting subproject and file group nodes.
            newEdges.push({
                source: data['subProjects'][0].nid,
                target: data['fileGroups'][0].nid_1,
                type: 'smoothstep',
            });
        }
    
        // Check if there is a selected file and if the current bundle is available.
        if (selection.fid != null && currentBundle.length > 0) {
            // Adding a custom node for the selected file.
            newNodes.push({
                id: currentBundle[0].nid,
                position: { x: 600, y: 0 },
                type: 'custom',
                
                data: {
                    selection: selection,
                    bundle: bundle,
                    currentBundle: currentBundle,
                },
            });
    
            // Connecting file group to the custom node.
            newEdges.push({
                source: data['fileGroups'][0].nid_1,
                target: currentBundle[0].nid,
                type: 'smoothstep',
            });
        }
    
        // Update the state with the new nodes and edges.
        setNodes(newNodes);
        setEdges(newEdges);
    };
    
    // useEffect hook to update the nodes and edges whenever dependencies change.
    useEffect(() => {
        setNodes([]);
        setEdges([]);
        updateNodes();
    }, [selection, data, currentBundle]);

    const getLastNodeId = () => {
        return nodes.length > 0 ? nodes[nodes.length - 1].id : null;
    };

    return (
        <ReactFlow 
            nodeTypes={nodeTypes} 
            nodes={nodes.map(node => ({
                ...node,
                style: {
                    ...node.style,
                    backgroundColor: node.id === getLastNodeId() && node.type !== 'custom' ? '#C7DB94' : 'transparent',
                    color: node.id === getLastNodeId() && node.type !== 'custom' ? '#324126' : '', // Assuming default color otherwise
                    padding: node.id === getLastNodeId() && node.type !== 'custom' ? '15px 15px' : '', // Assuming default padding otherwise
                    border: node.id === getLastNodeId() && node.type !== 'custom' ? '1px solid transparent' : '', // Assuming default border otherwise
                    borderRadius: node.id === getLastNodeId() && node.type !== 'custom' ? '5px' : '', // Assuming default border radius otherwise
                    height: node.id === getLastNodeId() && node.type !== 'custom' ? 'fit-content' : '', // Assuming default height otherwise
                },
            }))} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            fitView
        >
            <Text fontSize='h3' fontWeight='bold' color='brown.300'>You are here</Text>
            <Controls />
        </ReactFlow>
    );
}

export default ContentMap;