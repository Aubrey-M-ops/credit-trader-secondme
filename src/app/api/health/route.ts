import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`

    // 获取各表数量
    // @ts-ignore - Prisma models may not be generated yet
    const [userCount, taskCount, executionCount, transactionCount, ratingCount] = await Promise.all([
      prisma.user.count(),
      // @ts-ignore
      prisma.task.count(),
      // @ts-ignore
      prisma.execution.count(),
      // @ts-ignore
      prisma.transaction.count(),
      // @ts-ignore
      prisma.rating.count()
    ])

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      supabase: 'connected',
      tables: {
        users: userCount,
        tasks: taskCount,
        executions: executionCount,
        transactions: transactionCount,
        ratings: ratingCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
