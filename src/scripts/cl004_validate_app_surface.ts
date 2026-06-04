import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { applicationSurface, foundationSteps, getAcceptedStepCount } from '../lib/app/foundation';

type RequiredFile = {
  path: string;
  markers: string[];
};

const requiredFiles: RequiredFile[] = [
  {
    path: 'src/app/layout.tsx',
    markers: ['Community Premier League', 'RootLayout'],
  },
  {
    path: 'src/app/page.tsx',
    markers: ['applicationSurface', 'foundationSteps', 'StatusCard'],
  },
  {
    path: 'src/app/globals.css',
    markers: ['main-shell', 'status-grid', 'validation-panel'],
  },
  {
    path: 'src/app/api/foundation-status/route.ts',
    markers: ['NextResponse.json', 'prisma.$queryRaw', 'foundation'],
  },
  {
    path: 'src/components/cl/StatusCard.tsx',
    markers: ['StatusCard', 'FoundationStep'],
  },
  {
    path: 'src/lib/app/foundation.ts',
    markers: ['Community Premier League', 'foundationSteps', 'getAcceptedStepCount'],
  },
];

function assertFileMarkers(file: RequiredFile): void {
  const filePath = join(process.cwd(), file.path);

  if (!existsSync(filePath)) {
    throw new Error(`Missing app scaffold file: ${file.path}`);
  }

  const content = readFileSync(filePath, 'utf8');

  for (const marker of file.markers) {
    if (!content.includes(marker)) {
      throw new Error(`File ${file.path} missing marker: ${marker}`);
    }
  }
}

function main(): void {
  if (applicationSurface.name !== 'Community Premier League') {
    throw new Error('Application surface name is incorrect.');
  }

  if (applicationSurface.primaryRoute !== '/') {
    throw new Error('Primary route must be /.');
  }

  if (applicationSurface.healthRoute !== '/api/foundation-status') {
    throw new Error('Health route must be /api/foundation-status.');
  }

  if (foundationSteps.length !== 4) {
    throw new Error(`Expected 4 foundation steps, received ${foundationSteps.length}`);
  }

  if (getAcceptedStepCount() !== 3) {
    throw new Error(`Expected 3 accepted steps before CL-004, received ${getAcceptedStepCount()}`);
  }

  for (const file of requiredFiles) {
    assertFileMarkers(file);
  }

  process.stdout.write('CL-004A app route scaffold validation passed\n');
}

main();