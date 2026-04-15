import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity_name, sort = '-created_date', limit = 300 } = await req.json();

    if (!entity_name) {
      return Response.json({ error: 'entity_name is required' }, { status: 400 });
    }

    const data = await base44.asServiceRole.entities[entity_name].list(sort, limit);
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});