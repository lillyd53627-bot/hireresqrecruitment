import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can create automations
        if (user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const payload = await req.json();
        const {
            automation_type,
            name,
            function_name,
            description,
            is_active = true,
            // Entity automation fields
            entity_name,
            event_types,
            // Scheduled automation fields
            schedule_type,
            schedule_mode,
            repeat_interval,
            repeat_unit,
            repeat_on_days,
            repeat_on_day_of_month,
            start_time,
            cron_expression,
            one_time_date,
            ends_type,
            ends_on_date,
            ends_after_count,
            function_args
        } = payload;

        // Validate required fields
        if (!automation_type || !name || !function_name) {
            return Response.json({ 
                error: 'Missing required fields: automation_type, name, function_name' 
            }, { status: 400 });
        }

        // Validate automation type
        if (!['scheduled', 'entity'].includes(automation_type)) {
            return Response.json({ 
                error: 'automation_type must be either "scheduled" or "entity"' 
            }, { status: 400 });
        }

        // Validate entity automation fields
        if (automation_type === 'entity') {
            if (!entity_name || !event_types || !Array.isArray(event_types)) {
                return Response.json({ 
                    error: 'Entity automations require entity_name and event_types (array)' 
                }, { status: 400 });
            }
            const validEvents = ['create', 'update', 'delete'];
            const invalidEvents = event_types.filter(e => !validEvents.includes(e));
            if (invalidEvents.length > 0) {
                return Response.json({ 
                    error: `Invalid event types: ${invalidEvents.join(', ')}. Valid: ${validEvents.join(', ')}` 
                }, { status: 400 });
            }
        }

        // Build automation config
        const automationConfig = {
            automation_type,
            name,
            function_name,
            is_active
        };

        if (description) automationConfig.description = description;
        if (function_args) automationConfig.function_args = function_args;

        // Add entity-specific fields
        if (automation_type === 'entity') {
            automationConfig.entity_name = entity_name;
            automationConfig.event_types = event_types;
        }

        // Add scheduled-specific fields
        if (automation_type === 'scheduled') {
            if (schedule_type) automationConfig.schedule_type = schedule_type;
            if (schedule_mode) automationConfig.schedule_mode = schedule_mode;
            if (repeat_interval) automationConfig.repeat_interval = repeat_interval;
            if (repeat_unit) automationConfig.repeat_unit = repeat_unit;
            if (repeat_on_days) automationConfig.repeat_on_days = repeat_on_days;
            if (repeat_on_day_of_month) automationConfig.repeat_on_day_of_month = repeat_on_day_of_month;
            if (start_time) automationConfig.start_time = start_time;
            if (cron_expression) automationConfig.cron_expression = cron_expression;
            if (one_time_date) automationConfig.one_time_date = one_time_date;
            if (ends_type) automationConfig.ends_type = ends_type;
            if (ends_on_date) automationConfig.ends_on_date = ends_on_date;
            if (ends_after_count) automationConfig.ends_after_count = ends_after_count;
        }

        // Create automation using service role
        const automation = await base44.asServiceRole.automations.create(automationConfig);

        return Response.json({
            success: true,
            automation: automation,
            message: `Automation "${name}" created successfully`
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating automation:', error);
        return Response.json({ 
            error: error.message || 'Failed to create automation',
            details: error.toString()
        }, { status: 500 });
    }
});