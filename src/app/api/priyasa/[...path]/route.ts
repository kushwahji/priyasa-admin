import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM = (process.env.PRIYASA_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.priyasa.com/api/v1').replace(/\/$/, '');

function upstreamUrl(path: string, request: NextRequest) {
  const clean = path.replace(/^\/+/, '');
  const url = new URL(`${UPSTREAM}/${clean}`);
  request.nextUrl.searchParams.forEach((value, key) => url.searchParams.append(key, value));
  return url;
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = upstreamUrl(path.join('/'), request);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.set('accept', 'application/json');
  headers.set('x-forwarded-host', request.headers.get('host') || '');

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Unable to reach PRIYASA Core API.' },
      { status: 503 },
    );
  }

  const out = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) out.set('content-type', contentType);
  const requestId = response.headers.get('x-request-id');
  if (requestId) out.set('x-request-id', requestId);

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: out,
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, context);
}
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, context);
}
export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, context);
}
export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, context);
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(request, context);
}
