import { Router } from 'express';
import { store } from '../db/store.js';
import { auditLedger } from '../ethics/auditLedger.js';
import type { ResourceItem } from '../types.js';

const router = Router();

// GET all resources
router.get('/', (_req, res) => {
  const resources = store.getResources();
  res.json({ success: true, data: resources });
});

// POST add new resource
router.post('/', (req, res) => {
  const body = req.body;
  const diff = Number(body.allocated) - Number(body.forecastNeeded);
  const status: ResourceItem['status'] = diff < 0 ? 'shortage' : diff > 0 ? 'surplus' : 'optimal';

  const newResource: ResourceItem = {
    ...body,
    id: body.id || `res-${Date.now()}`,
    allocated: Number(body.allocated) || 0,
    forecastNeeded: Number(body.forecastNeeded) || 0,
    status,
    costPerUnit: Number(body.costPerUnit) || 0,
  };

  const created = store.addResource(newResource);

  auditLedger.record({
    action: 'RESOURCE_REBALANCED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'logistics_lead',
      role: 'human_organizer',
      name: 'Logistics Resource Director',
    },
    details: {
      action: 'ADD_RESOURCE_ASSET',
      resourceId: created.id,
      name: created.name,
      category: created.category,
    },
  });

  res.status(201).json({ success: true, data: created });
});

// PUT update resource
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updated = store.updateResource(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Resource not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

// POST smart rebalance (Nudge allocation to match ML forecast)
router.post('/rebalance', (req, res) => {
  const rebalanced = store.rebalanceResources();

  auditLedger.record({
    action: 'RESOURCE_REBALANCED',
    actor: {
      userId: req.headers['x-user-id'] as string || 'ai_allocator',
      role: 'human_organizer',
      name: 'Resource Optimization Engine',
    },
    details: {
      action: 'REBALANCE_ALL_RESOURCES_TO_FORECAST',
      itemsCount: rebalanced.length,
    },
  });

  res.json({
    success: true,
    message: 'All resource deployment vectors rebalanced to optimal ML forecast demand',
    data: rebalanced,
  });
});

export default router;

