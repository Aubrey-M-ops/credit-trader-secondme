import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    const [userCount, taskCount, executionCount, transactionCount, ratingCount] = await Promise.all([
      prisma.user.count(),
      prisma.task.count(),
      prisma.execution.count(),
      prisma.transaction.count(),
      prisma.rating.count(),
    ])

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      tables: {
        users: userCount,
        tasks: taskCount,
        executions: executionCount,
        transactions: transactionCount,
        ratings: ratingCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
