import { Router } from 'express';
import {
  getNodeWithRelationships,
  updateNodeAttributes,
  deleteNode,
  addRelationship,
  updateRelationship,
  deleteRelationship
} from '../controllers/knowledgeGraph.controller';

const router = Router();

// Node CRUD
router.get('/node/:id', getNodeWithRelationships);
router.patch('/node/:id', updateNodeAttributes);
router.delete('/node/:id', deleteNode);

// Relationship CRUD
router.post('/relationship', addRelationship);
router.patch('/relationship/:id', updateRelationship);
router.delete('/relationship/:id', deleteRelationship);

export default router;