import { createCommunityLeagueRuntimeSmokeService, type RuntimeSmokeRoute } from '../lib/runtime-smoke';

type SmokeResult = {
  key: string;
  path: string;
  type: string;
  status: number;
  passed: boolean;
  detail: string;
};

function getBaseUrl(): string {
  return process.env.CL_RUNTIME_BASE_URL ?? 'http://127.0.0.1:32127';
}

async function smokeRoute(baseUrl: string, route: RuntimeSmokeRoute): Promise<SmokeResult> {
  const url = `${baseUrl}${route.path}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: route.type === 'api' ? 'application/json' : 'text/html',
      },
    });

    const body = await response.text();
    const statusMatches = response.status === route.expectedStatus;
    const textMatches = body.includes(route.requiredText);

    return {
      key: route.key,
      path: route.path,
      type: route.type,
      status: response.status,
      passed: statusMatches && textMatches,
      detail: statusMatches && textMatches ? 'ok' : `expected status ${route.expectedStatus} and marker ${route.requiredText}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      key: route.key,
      path: route.path,
      type: route.type,
      status: 0,
      passed: false,
      detail: message,
    };
  }
}

async function main(): Promise<void> {
  const baseUrl = getBaseUrl();
  const service = createCommunityLeagueRuntimeSmokeService();
  const readiness = service.getRuntimeSmokeReadiness();

  if (!readiness.visualPolishAccepted) {
    throw new Error('Visual polish acceptance gate is required before runtime smoke verification.');
  }

  if (!readiness.expectedRoutesPresent) {
    throw new Error('Runtime smoke expected route list is incomplete.');
  }

  if (!readiness.pageRoutesPresent) {
    throw new Error('Runtime smoke page route list is incomplete.');
  }

  if (!readiness.apiRoutesPresent) {
    throw new Error('Runtime smoke API route list is incomplete.');
  }

  const expectedRoutes = service.getExpectedRuntimeSmokeRoutes();

  if (expectedRoutes.length < 22) {
    throw new Error(`Expected at least 22 runtime smoke routes, received ${expectedRoutes.length}`);
  }

  const foundationRoute = expectedRoutes.find((route) => route.path === '/api/foundation-status');
  if (!foundationRoute || foundationRoute.requiredText !== '"status"') {
    throw new Error('Foundation status API marker must align to the actual JSON status payload.');
  }

  if (!expectedRoutes.some((route) => route.path === '/runtime-smoke')) {
    throw new Error('Runtime smoke route list must include /runtime-smoke.');
  }

  if (!expectedRoutes.some((route) => route.path === '/api/runtime-smoke')) {
    throw new Error('Runtime smoke route list must include /api/runtime-smoke.');
  }

  const results = await Promise.all(expectedRoutes.map((route) => smokeRoute(baseUrl, route)));
  const failed = results.filter((result) => !result.passed);
  const pagePasses = results.filter((result) => result.type === 'page' && result.passed).length;
  const apiPasses = results.filter((result) => result.type === 'api' && result.passed).length;

  if (failed.length > 0) {
    const detail = failed
      .map((result) => `${result.path} status=${result.status} detail=${result.detail}`)
      .join('; ');

    throw new Error(`Runtime route smoke failed: ${detail}`);
  }

  process.stdout.write(
    `CL-027A4 end-to-end route smoke / local runtime validation passed: routes=${results.length}, pages=${pagePasses}, apis=${apiPasses}, baseUrl=${baseUrl}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`CL-027A4 end-to-end route smoke / local runtime validation failed: ${message}\n`);
  process.exit(1);
});