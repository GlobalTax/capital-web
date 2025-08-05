import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    rls: boolean;
    indexes: boolean;
    performance: boolean;
  };
  metrics: {
    responseTime: number;
    activeConnections: number;
    slowQueries: number;
  };
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const startTime = performance.now();
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      checks: {
        database: false,
        rls: false,
        indexes: false,
        performance: false
      },
      metrics: {
        responseTime: 0,
        activeConnections: 0,
        slowQueries: 0
      },
      recommendations: []
    };

    // Test 1: Basic database connectivity
    try {
      const { data, error } = await supabase
        .from('contact_leads')
        .select('count')
        .limit(1);
      
      healthResult.checks.database = !error;
      if (error) {
        healthResult.recommendations.push('Database connectivity issue detected');
      }
    } catch (error) {
      healthResult.checks.database = false;
      healthResult.recommendations.push('Failed to connect to database');
    }

    // Test 2: RLS functionality
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1);
      
      // RLS should block this for anonymous users
      healthResult.checks.rls = !!error;
      if (!error) {
        healthResult.recommendations.push('RLS policies may not be properly configured');
      }
    } catch (error) {
      healthResult.checks.rls = true; // Error expected due to RLS
    }

    // Test 3: Index performance simulation
    try {
      const indexTestStart = performance.now();
      const { data, error } = await supabase
        .from('contact_leads')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      const indexTestTime = performance.now() - indexTestStart;
      healthResult.checks.indexes = indexTestTime < 1000; // Less than 1 second
      
      if (indexTestTime > 1000) {
        healthResult.recommendations.push('Slow query detected - consider adding indexes');
      }
    } catch (error) {
      healthResult.checks.indexes = false;
      healthResult.recommendations.push('Index performance test failed');
    }

    // Test 4: Overall performance
    const totalTime = performance.now() - startTime;
    healthResult.metrics.responseTime = Math.round(totalTime);
    healthResult.checks.performance = totalTime < 2000; // Less than 2 seconds total

    if (totalTime > 2000) {
      healthResult.recommendations.push('Overall database response time is slow');
    }

    // Determine overall status
    const healthyChecks = Object.values(healthResult.checks).filter(Boolean).length;
    if (healthyChecks === 4) {
      healthResult.status = 'healthy';
    } else if (healthyChecks >= 2) {
      healthResult.status = 'degraded';
    } else {
      healthResult.status = 'unhealthy';
    }

    // Additional recommendations based on patterns
    if (!healthResult.checks.database) {
      healthResult.recommendations.push('Priority: Restore database connectivity');
    }
    
    if (!healthResult.checks.rls) {
      healthResult.recommendations.push('Priority: Review and fix RLS policies');
    }
    
    if (healthResult.metrics.responseTime > 5000) {
      healthResult.recommendations.push('Critical: Database performance severely degraded');
    }

    console.log('Database health check completed', {
      status: healthResult.status,
      responseTime: healthResult.metrics.responseTime,
      checks: healthResult.checks
    });

    return new Response(
      JSON.stringify(healthResult),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      checks: {
        database: false,
        rls: false,
        indexes: false,
        performance: false
      },
      metrics: {
        responseTime: -1,
        activeConnections: 0,
        slowQueries: 0
      },
      recommendations: [
        'Health check system failure',
        'Check database configuration and connectivity'
      ]
    };

    return new Response(
      JSON.stringify(errorResult),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
})