import { Request, Response } from 'express';
import neo4jService from '../services/neo4j.service.js';

// Get node with attributes and relationships
export async function getNodeWithRelationships(req: Request, res: Response) {
  try {
    const nodeId = req.params.id;
    const data = await neo4jService.getNodeWithRelationships(nodeId);
    if (!data) return res.status(404).json({ error: 'Node not found' });
    res.json(data);
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to fetch node', details });
  }
}

// Update node attributes
export async function updateNodeAttributes(req: Request, res: Response) {
  try {
    const nodeId = req.params.id;
    const attributes = req.body;
    const updated = await neo4jService.updateNodeAttributes(nodeId, attributes);
    if (!updated) return res.status(404).json({ error: 'Node not found' });
    res.json(updated);
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to update node', details });
  }
}

// Delete node
export async function deleteNode(req: Request, res: Response) {
  try {
    const nodeId = req.params.id;
    await neo4jService.deleteNode(nodeId);
    res.json({ success: true });
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to delete node', details });
  }
}

// Add relationship
export async function addRelationship(req: Request, res: Response) {
  try {
    const { fromNodeId, toNodeId, type, properties } = req.body;
    const rel = await neo4jService.addRelationship(fromNodeId, toNodeId, type, properties || {});
    if (!rel) return res.status(400).json({ error: 'Failed to create relationship' });
    res.json(rel);
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to add relationship', details });
  }
}

// Update relationship
export async function updateRelationship(req: Request, res: Response) {
  try {
    const relId = req.params.id;
    const properties = req.body;
    const rel = await neo4jService.updateRelationship(relId, properties);
    if (!rel) return res.status(404).json({ error: 'Relationship not found' });
    res.json(rel);
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to update relationship', details });
  }
}

// Delete relationship
export async function deleteRelationship(req: Request, res: Response) {
  try {
    const relId = req.params.id;
    await neo4jService.deleteRelationship(relId);
    res.json({ success: true });
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to delete relationship', details });
  }
}